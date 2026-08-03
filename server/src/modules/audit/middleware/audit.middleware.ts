import { Request, Response, NextFunction, RequestHandler } from 'express';
import { IAuditService } from '../interfaces/audit.interface';
import { DEFAULT_AUDIT_CONFIG, IAuditConfig } from '../config/audit.config';
import { AuditStatus } from '../enums/audit.enums';
import { AuditContextUtil } from '../utils/audit-context.util';
import { AuditDecoratorUtil } from '../decorators/audit.decorator';
import { AuditPayload } from '../types/audit.types';

/**
 * Sensitive Data Masking Helper.
 * Recursively redacts sensitive keys matching the configured whitelist/blacklist.
 */
export function sanitizePayload(data: unknown, sensitiveKeys: string[]): unknown {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item, sensitiveKeys));
  }

  const sanitized: Record<string, unknown> = {};
  const lowerSensitiveKeys = sensitiveKeys.map((k) => k.toLowerCase());

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (lowerSensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizePayload(value, sensitiveKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Filter Request Headers against Whitelist.
 */
export function sanitizeHeaders(
  headers: Record<string, unknown>,
  whitelist: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const lowerWhitelist = whitelist.map((h) => h.toLowerCase());

  for (const [key, value] of Object.entries(headers)) {
    if (lowerWhitelist.includes(key.toLowerCase())) {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

/**
 * Enterprise Audit Middleware Factory (Module 24.4).
 *
 * Creates non-blocking Express middleware that intercepts response lifecycle events,
 * captures actor details, redacts sensitive request data, and records audit logs
 * asynchronously via IAuditService.
 *
 * Audit failures are caught internally and will NEVER fail or block incoming HTTP requests.
 *
 * @param auditService Injected IAuditService instance.
 * @param customConfig Optional configuration overrides.
 * @returns Express RequestHandler middleware function.
 */
export function createAuditMiddleware(
  auditService: IAuditService,
  customConfig?: Partial<IAuditConfig>
): RequestHandler {
  const config: IAuditConfig = {
    ...DEFAULT_AUDIT_CONFIG,
    ...customConfig,
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Check if request path/method is excluded
    if (!AuditDecoratorUtil.shouldAudit(req, config)) {
      return next();
    }

    // Attach response finish listener for non-blocking audit logging
    res.on('finish', () => {
      // Execute asynchronously outside the current call stack
      setImmediate(async () => {
        try {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode;

          if (config.ignoredStatusCodes.includes(statusCode)) {
            return;
          }

          const action = AuditDecoratorUtil.resolveAuditAction(req.method, req.path);
          const entity = AuditDecoratorUtil.resolveAuditEntity(req.path);
          const severity = AuditDecoratorUtil.resolveAuditSeverity(statusCode, action);
          const status = statusCode < 400 ? AuditStatus.SUCCESS : AuditStatus.FAILURE;

          const actor = AuditContextUtil.extractUser(req);
          const requestId = AuditContextUtil.extractRequestId(req);
          const correlationId = AuditContextUtil.extractCorrelationId(req);

          // Build sanitized request details for audit metadata
          const sanitizedBody = config.captureRequestBody && req.body
            ? sanitizePayload(req.body, config.sensitiveKeys)
            : undefined;

          const sanitizedQuery = config.captureQuery && req.query
            ? sanitizePayload(req.query, config.sensitiveKeys)
            : undefined;

          const sanitizedParams = config.captureParams && req.params
            ? sanitizePayload(req.params, config.sensitiveKeys)
            : undefined;

          const sanitizedHeaderMap = sanitizeHeaders(
            req.headers as Record<string, unknown>,
            config.headerWhitelist
          );

          const entityIdParam = req.params?.id || req.params?.entityId;
          const entityId = entityIdParam ? String(entityIdParam) : undefined;

          const description = `HTTP ${req.method} ${req.originalUrl || req.url} - Status ${statusCode} (${durationMs}ms)`;

          const payload: AuditPayload = {
            action,
            entity,
            entityId,
            actor,
            severity,
            status,
            description,
            failureReason: statusCode >= 400 ? `HTTP Error Status ${statusCode}` : undefined,
            timestamp: new Date(),
            metadata: {
              ip: actor.ipAddress,
              userAgent: actor.userAgent,
              requestId,
              correlationId,
              durationMs,
              tags: [req.method, req.path, `status:${statusCode}`],
              extra: {
                method: req.method,
                path: req.path,
                statusCode,
                query: sanitizedQuery,
                params: sanitizedParams,
                body: sanitizedBody,
                headers: sanitizedHeaderMap,
              },
            },
          };

          // Asynchronously record audit log without waiting or throwing
          await auditService.record(payload);
        } catch (error) {
          // Internal error handling guard: audit failure must never break execution
          console.error('[AuditMiddleware] Failed to record audit log entry:', error);
        }
      });
    });

    next();
  };
}
