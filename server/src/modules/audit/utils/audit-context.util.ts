import { Request } from 'express';
import { IAuditActor, IAuditContext } from '../interfaces/audit.interface';
import { SYSTEM_USER } from '../constants/audit.constants';

/**
 * Enterprise Audit Context Utility (Module 24.1).
 *
 * Pure utility class responsible for extracting actor identity, IP address,
 * user agent, and request/correlation IDs from HTTP Express request objects
 * to assemble standardized IAuditContext payloads.
 */
export class AuditContextUtil {
  /**
   * Extracts user identity (IAuditActor) from an Express Request object.
   *
   * @param req Express Request object.
   * @returns IAuditActor object or SYSTEM_USER if unauthenticated.
   */
  static extractUser(req: Request): IAuditActor {
    const reqWithUser = req as unknown as {
      user?: {
        _id?: { toString(): string } | string;
        id?: { toString(): string } | string;
        email?: string;
        role?: string;
      };
    };

    const user = reqWithUser.user;
    if (!user) {
      return {
        userId: SYSTEM_USER.id,
        email: SYSTEM_USER.email,
        role: SYSTEM_USER.role,
        ipAddress: AuditContextUtil.extractIp(req),
        userAgent: AuditContextUtil.extractUserAgent(req),
      };
    }

    const userId = user._id ? user._id.toString() : user.id ? user.id.toString() : SYSTEM_USER.id;
    const email = user.email ?? SYSTEM_USER.email;
    const role = user.role ?? 'USER';

    return {
      userId,
      email,
      role,
      ipAddress: AuditContextUtil.extractIp(req),
      userAgent: AuditContextUtil.extractUserAgent(req),
    };
  }

  /**
   * Extracts client IP address handling reverse proxies and x-forwarded-for headers.
   *
   * @param req Express Request object.
   * @returns Client IP address string.
   */
  static extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ipString = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      const firstIp = ipString.split(',')[0].trim();
      if (firstIp) return firstIp;
    }
    return req.ip || req.socket?.remoteAddress || '127.0.0.1';
  }

  /**
   * Extracts User-Agent string from request headers.
   *
   * @param req Express Request object.
   * @returns User-Agent string or 'unknown'.
   */
  static extractUserAgent(req: Request): string {
    const ua = req.headers['user-agent'];
    return ua ? String(ua) : 'unknown';
  }

  /**
   * Extracts or generates unique Request ID for tracing.
   *
   * @param req Express Request object.
   * @returns Request ID string.
   */
  static extractRequestId(req: Request): string {
    const headerId = req.headers['x-request-id'] || req.headers['x-request-id'.toLowerCase()];
    if (headerId) {
      return Array.isArray(headerId) ? headerId[0] : String(headerId);
    }
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Extracts or generates Correlation ID for distributed tracing.
   *
   * @param req Express Request object.
   * @returns Correlation ID string.
   */
  static extractCorrelationId(req: Request): string {
    const correlationHeader =
      req.headers['x-correlation-id'] || req.headers['x-correlation-id'.toLowerCase()];
    if (correlationHeader) {
      return Array.isArray(correlationHeader) ? correlationHeader[0] : String(correlationHeader);
    }
    return AuditContextUtil.extractRequestId(req);
  }

  /**
   * Assembles a complete IAuditContext object from an Express Request.
   *
   * @param req Express Request object.
   * @returns Populated IAuditContext.
   */
  static buildContext(req: Request): IAuditContext {
    return {
      user: AuditContextUtil.extractUser(req),
      ip: AuditContextUtil.extractIp(req),
      userAgent: AuditContextUtil.extractUserAgent(req),
      requestId: AuditContextUtil.extractRequestId(req),
      correlationId: AuditContextUtil.extractCorrelationId(req),
    };
  }
}
