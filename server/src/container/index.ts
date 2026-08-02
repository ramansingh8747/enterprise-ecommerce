import { SmsFactory } from "../factories/sms.factory";
import { SmsService } from "../services/sms.service";
import { OtpService } from "../services/otp.service";
import { JwtService } from "../services/jwt.service";
import { AuthService } from "../services/auth.service";
import { SessionService } from "../services/session.service";

import { WishlistRepository } from "../modules/wishlist/repositories/wishlist.repository";
import { WishlistService } from "../modules/wishlist/services/wishlist.service";
import { WishlistController } from "../modules/wishlist/controllers/wishlist.controller";

import { ReviewRepository } from "../modules/review/repositories/review.repository";
import { ReviewService } from "../modules/review/services/review.service";
import { ReviewController } from "../modules/review/controllers/review.controller";

import { NotificationRepository } from "../modules/notification/repositories/notification.repository";
import { NotificationService } from "../modules/notification/services/notification.service";
import { NotificationController } from "../modules/notification/controllers/notification.controller";

const smsProvider = SmsFactory.createProvider();

export const smsService = new SmsService(smsProvider);
export const sessionService = new SessionService();
export const jwtService = new JwtService();

console.log("JWT Service Instance:", jwtService);
console.log("verifyAccessToken:", typeof jwtService.verifyAccessToken);

export const authService = new AuthService(jwtService, sessionService);
export const otpService = new OtpService(smsService);

// Wishlist Module Central DI Singletons
export const wishlistRepository = new WishlistRepository();
export const wishlistService = new WishlistService(wishlistRepository);
export const wishlistController = new WishlistController(wishlistService);

// Reviews & Ratings Module Central DI Singletons
export const reviewRepository = new ReviewRepository();
export const reviewService = new ReviewService(reviewRepository);
export const reviewController = new ReviewController(reviewService);

// Notification Module Central DI Singletons
export const notificationRepository = new NotificationRepository();
export const notificationService = new NotificationService(notificationRepository);
export const notificationController = new NotificationController(notificationService);