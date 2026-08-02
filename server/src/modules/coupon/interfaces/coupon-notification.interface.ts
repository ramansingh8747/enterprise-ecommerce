import { ICoupon, ICouponDocument } from "./coupon.interface";

/**
 * Supported coupon notification event types.
 */
export enum CouponNotificationEventType {
    COUPON_CREATED = "COUPON_CREATED",
    COUPON_UPDATED = "COUPON_UPDATED",
    COUPON_ACTIVATED = "COUPON_ACTIVATED",
    COUPON_DEACTIVATED = "COUPON_DEACTIVATED",
    COUPON_EXPIRING_SOON = "COUPON_EXPIRING_SOON",
    COUPON_EXPIRED = "COUPON_EXPIRED",
    COUPON_USAGE_LIMIT_REACHED = "COUPON_USAGE_LIMIT_REACHED",
    COUPON_DELETED = "COUPON_DELETED",
}

/**
 * Transport channels for future provider implementations.
 */
export enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP",
    IN_APP = "IN_APP",
}

/**
 * Transport-agnostic payload contract for coupon notification events.
 */
export interface ICouponNotificationPayload {
    eventId: string;
    eventType: CouponNotificationEventType;
    couponId: string;
    couponCode: string;
    couponName: string;
    channels: NotificationChannel[];
    subject?: string;
    body: string;
    recipientUserId?: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

/**
 * Provider contract interface for future transport listeners (Email, SMS, Push, WhatsApp).
 */
export interface ICouponNotificationHandler {
    name: string;
    handleNotification(payload: ICouponNotificationPayload): Promise<void>;
}

/**
 * Enterprise Coupon Notification Service Interface.
 */
export interface ICouponNotificationService {
    registerHandler(handler: ICouponNotificationHandler): void;
    getRegisteredHandlers(): ICouponNotificationHandler[];

    prepareCreatedPayload(coupon: ICouponDocument | ICoupon): ICouponNotificationPayload;
    prepareUpdatedPayload(coupon: ICouponDocument | ICoupon): ICouponNotificationPayload;
    prepareActivatedPayload(coupon: ICouponDocument | ICoupon): ICouponNotificationPayload;
    prepareDeactivatedPayload(coupon: ICouponDocument | ICoupon): ICouponNotificationPayload;
    prepareExpiringSoonPayload(
        coupon: ICouponDocument | ICoupon,
        daysRemaining?: number
    ): ICouponNotificationPayload;
    prepareExpiredPayload(coupon: ICouponDocument | ICoupon): ICouponNotificationPayload;
    prepareUsageLimitReachedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload;
    prepareDeletedPayload(couponId: string, code: string): ICouponNotificationPayload;

    dispatchNotification(payload: ICouponNotificationPayload): Promise<void>;
}
