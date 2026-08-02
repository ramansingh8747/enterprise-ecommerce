import {
    CouponNotificationEventType,
    ICouponNotificationHandler,
    ICouponNotificationPayload,
    ICouponNotificationService,
    NotificationChannel,
} from "../interfaces/coupon-notification.interface";
import { ICoupon, ICouponDocument } from "../interfaces/coupon.interface";

/**
 * Enterprise Coupon Notification Foundation Service.
 *
 * Prepares transport-agnostic notification payloads and orchestrates handler dispatching.
 * Completely decoupled from Email, SMS, Push, WhatsApp, and database operations.
 */
export class CouponNotificationService implements ICouponNotificationService {
    private readonly handlers: ICouponNotificationHandler[] = [];

    /**
     * Registers a notification transport handler (e.g. EmailProvider, SMSProvider).
     */
    registerHandler(handler: ICouponNotificationHandler): void {
        if (!handler || !handler.name || typeof handler.handleNotification !== "function") {
            throw new Error("Invalid notification handler contract.");
        }

        const exists = this.handlers.some((h) => h.name === handler.name);
        if (!exists) {
            this.handlers.push(handler);
        }
    }

    /**
     * Returns a copy of currently registered notification handlers.
     */
    getRegisteredHandlers(): ICouponNotificationHandler[] {
        return [...this.handlers];
    }

    /**
     * Prepares payload for COUPON_CREATED event.
     */
    prepareCreatedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_CREATED,
            coupon,
            subject: `New Coupon Created: ${coupon.code}`,
            body: `Coupon '${coupon.name}' (${coupon.code}) has been created successfully.`,
            channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        });
    }

    /**
     * Prepares payload for COUPON_UPDATED event.
     */
    prepareUpdatedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_UPDATED,
            coupon,
            subject: `Coupon Updated: ${coupon.code}`,
            body: `Coupon '${coupon.name}' (${coupon.code}) details have been updated.`,
            channels: [NotificationChannel.IN_APP],
        });
    }

    /**
     * Prepares payload for COUPON_ACTIVATED event.
     */
    prepareActivatedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_ACTIVATED,
            coupon,
            subject: `Coupon Activated: ${coupon.code}`,
            body: `Coupon '${coupon.code}' is now ACTIVE and ready for redemption.`,
            channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        });
    }

    /**
     * Prepares payload for COUPON_DEACTIVATED event.
     */
    prepareDeactivatedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_DEACTIVATED,
            coupon,
            subject: `Coupon Deactivated: ${coupon.code}`,
            body: `Coupon '${coupon.code}' has been deactivated.`,
            channels: [NotificationChannel.IN_APP],
        });
    }

    /**
     * Prepares payload for COUPON_EXPIRING_SOON event.
     */
    prepareExpiringSoonPayload(
        coupon: ICouponDocument | ICoupon,
        daysRemaining = 1
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_EXPIRING_SOON,
            coupon,
            subject: `Coupon Expiring Soon: ${coupon.code}`,
            body: `Coupon '${coupon.code}' will expire in ${daysRemaining} day(s) on ${coupon.validUntil}.`,
            channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS],
            metadata: { daysRemaining },
        });
    }

    /**
     * Prepares payload for COUPON_EXPIRED event.
     */
    prepareExpiredPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_EXPIRED,
            coupon,
            subject: `Coupon Expired: ${coupon.code}`,
            body: `Coupon '${coupon.code}' has expired on ${coupon.validUntil}.`,
            channels: [NotificationChannel.IN_APP],
        });
    }

    /**
     * Prepares payload for COUPON_USAGE_LIMIT_REACHED event.
     */
    prepareUsageLimitReachedPayload(
        coupon: ICouponDocument | ICoupon
    ): ICouponNotificationPayload {
        return this.buildPayload({
            eventType: CouponNotificationEventType.COUPON_USAGE_LIMIT_REACHED,
            coupon,
            subject: `Usage Limit Reached: ${coupon.code}`,
            body: `Coupon '${coupon.code}' has reached its maximum usage limit of ${coupon.usageLimit}.`,
            channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        });
    }

    /**
     * Prepares payload for COUPON_DELETED event.
     */
    prepareDeletedPayload(
        couponId: string,
        code: string
    ): ICouponNotificationPayload {
        return {
            eventId: this.generateEventId(),
            eventType: CouponNotificationEventType.COUPON_DELETED,
            couponId,
            couponCode: code,
            couponName: code,
            channels: [NotificationChannel.IN_APP],
            subject: `Coupon Deleted: ${code}`,
            body: `Coupon '${code}' has been permanently deleted.`,
            timestamp: new Date(),
        };
    }

    /**
     * Dispatches a notification payload across all registered provider handlers.
     */
    async dispatchNotification(
        payload: ICouponNotificationPayload
    ): Promise<void> {
        if (!payload || !payload.eventType) {
            throw new Error("Invalid notification payload.");
        }

        for (const handler of this.handlers) {
            try {
                await handler.handleNotification(payload);
            } catch {
                // Provider failure isolation — prevents one provider error from breaking orchestration
                continue;
            }
        }
    }

    private buildPayload(params: {
        eventType: CouponNotificationEventType;
        coupon: ICouponDocument | ICoupon;
        subject: string;
        body: string;
        channels: NotificationChannel[];
        metadata?: Record<string, unknown>;
    }): ICouponNotificationPayload {
        const couponId =
            "_id" in params.coupon && params.coupon._id
                ? params.coupon._id.toString()
                : "";

        return {
            eventId: this.generateEventId(),
            eventType: params.eventType,
            couponId,
            couponCode: params.coupon.code,
            couponName: params.coupon.name,
            channels: params.channels,
            subject: params.subject,
            body: params.body,
            metadata: params.metadata,
            timestamp: new Date(),
        };
    }

    private generateEventId(): string {
        const stamp = Date.now().toString(36).toUpperCase();
        const rand = Math.floor(Math.random() * 1_000_000)
            .toString()
            .padStart(6, "0");
        return `NOTIF-CPN-${stamp}-${rand}`;
    }
}
