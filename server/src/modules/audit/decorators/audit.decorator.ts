import { Request, Response } from 'express';
import { AuditAction, AuditEntity, AuditSeverity } from '../enums/audit.enums';
import { IAuditMetadata } from '../interfaces/audit.interface';
import { DEFAULT_AUDIT_CONFIG, IAuditConfig } from '../config/audit.config';
import { AuditContextUtil } from '../utils/audit-context.util';

/**
 * Enterprise Audit Decorator & Helper Utility (Module 24.4).
 *
 * Provides reusable metadata builders, action/entity resolvers, and audit decision
 * helpers for middleware and future controller method decoration.
 */
export class AuditDecoratorUtil {
  /**
   * Determines whether an HTTP request should be audited based on configuration rules.
   *
   * @param req Express Request object.
   * @param config Optional partial configuration override.
   */
  static shouldAudit(req: Request, config: IAuditConfig = DEFAULT_AUDIT_CONFIG): boolean {
    if (!config.enabled) return false;

    const method = req.method.toUpperCase();
    if (config.excludedMethods.includes(method)) return false;

    const url = req.originalUrl || req.url;
    const isExcluded = config.excludedRoutes.some((route) => url.startsWith(route));
    if (isExcluded) return false;

    return true;
  }

  /**
   * Resolves the appropriate AuditAction enum based on HTTP method and route path.
   *
   * @param method HTTP method (GET, POST, PUT, PATCH, DELETE).
   * @param path Request route path.
   */
  static resolveAuditAction(method: string, path: string): AuditAction {
    const cleanPath = path.toLowerCase();
    const upperMethod = method.toUpperCase();

    if (cleanPath.includes('/login')) return AuditAction.LOGIN;
    if (cleanPath.includes('/logout')) return AuditAction.LOGOUT;
    if (cleanPath.includes('/password')) return AuditAction.PASSWORD_RESET;
    if (cleanPath.includes('/otp')) return AuditAction.VERIFY_OTP;
    if (cleanPath.includes('/export')) return AuditAction.EXPORT;
    if (cleanPath.includes('/import')) return AuditAction.IMPORT;
    if (cleanPath.includes('/download')) return AuditAction.DOWNLOAD;
    if (cleanPath.includes('/upload')) return AuditAction.UPLOAD;

    switch (upperMethod) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      case 'GET':
      default:
        return AuditAction.VIEW;
    }
  }

  /**
   * Resolves the appropriate AuditEntity enum based on route path segment.
   *
   * @param path Request route path string.
   */
  static resolveAuditEntity(path: string): AuditEntity {
    const cleanPath = path.toLowerCase();

    if (cleanPath.includes('/auth') || cleanPath.includes('/login') || cleanPath.includes('/session')) {
      return AuditEntity.AUTH;
    }
    if (cleanPath.includes('/users') || cleanPath.includes('/user')) return AuditEntity.USER;
    if (cleanPath.includes('/products') || cleanPath.includes('/product')) return AuditEntity.PRODUCT;
    if (cleanPath.includes('/categories') || cleanPath.includes('/category')) return AuditEntity.CATEGORY;
    if (cleanPath.includes('/brands') || cleanPath.includes('/brand')) return AuditEntity.BRAND;
    if (cleanPath.includes('/variants') || cleanPath.includes('/variant')) return AuditEntity.PRODUCT_VARIANT;
    if (cleanPath.includes('/inventory') || cleanPath.includes('/inventories')) return AuditEntity.INVENTORY;
    if (cleanPath.includes('/orders') || cleanPath.includes('/order')) return AuditEntity.ORDER;
    if (cleanPath.includes('/payments') || cleanPath.includes('/payment')) return AuditEntity.PAYMENT;
    if (cleanPath.includes('/reviews') || cleanPath.includes('/review')) return AuditEntity.REVIEW;
    if (cleanPath.includes('/coupons') || cleanPath.includes('/coupon')) return AuditEntity.COUPON;
    if (cleanPath.includes('/files') || cleanPath.includes('/file')) return AuditEntity.FILE;
    if (cleanPath.includes('/notifications') || cleanPath.includes('/notification')) return AuditEntity.NOTIFICATION;

    return AuditEntity.USER;
  }

  /**
   * Resolves event severity based on HTTP response status code and action type.
   *
   * @param statusCode HTTP response status code.
   * @param action Audit action.
   */
  static resolveAuditSeverity(statusCode: number, action: AuditAction): AuditSeverity {
    if (statusCode >= 500) return AuditSeverity.CRITICAL;
    if (statusCode >= 400) return AuditSeverity.HIGH;

    if (action === AuditAction.DELETE || action === AuditAction.PASSWORD_RESET || action === AuditAction.REFUND) {
      return AuditSeverity.HIGH;
    }
    if (action === AuditAction.CREATE || action === AuditAction.UPDATE || action === AuditAction.PLACE_ORDER) {
      return AuditSeverity.MEDIUM;
    }

    return AuditSeverity.LOW;
  }

  /**
   * Assembles a structured IAuditMetadata object for an intercepted request.
   *
   * @param req Express Request object.
   * @param res Express Response object.
   * @param durationMs Duration in milliseconds.
   */
  static buildAuditMetadata(req: Request, _res: Response, durationMs: number): IAuditMetadata {
    return {
      ip: AuditContextUtil.extractIp(req),
      userAgent: AuditContextUtil.extractUserAgent(req),
      requestId: AuditContextUtil.extractRequestId(req),
      correlationId: AuditContextUtil.extractCorrelationId(req),
      durationMs,
      tags: [req.method, req.path],
    };
  }
}
