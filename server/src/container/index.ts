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

import { MockEmailProvider } from "../modules/email/providers/mock.provider";
import { EmailService } from "../modules/email/services/email.service";
import { EmailTemplateRenderer } from "../modules/email/templates/renderer/template-renderer";
import { WelcomeEmailTemplate } from "../modules/email/templates/welcome/welcome-email.template";

import { LocalStorageProvider } from "../modules/file/providers/local.provider";
import { StorageProviderFactory } from "../modules/file/factories/storage.factory";
import { NamingStrategy } from "../modules/file/strategies/naming.strategy";
import { FileRepository } from "../modules/file/repositories/file.repository";
import { FileService } from "../modules/file/services/file.service";
import { FileUploadService } from "../modules/file/services/file-upload.service";
import { FileController } from "../modules/file/controllers/file.controller";
import { StorageProviderType } from "../modules/file/types/file.types";

import { SearchRepository } from "../modules/search/repositories/search.repository";
import { SearchService } from "../modules/search/services/search.service";
import { SearchController } from "../modules/search/controllers/search.controller";

const smsProvider = SmsFactory.createProvider();

export const smsService = new SmsService(smsProvider);
export const sessionService = new SessionService();
export const jwtService = new JwtService();

// Email Module Central DI Singletons
export const mockEmailProvider = new MockEmailProvider();
export const emailService = new EmailService(mockEmailProvider);
export const emailTemplateRenderer = new EmailTemplateRenderer();
export const welcomeEmailTemplate = new WelcomeEmailTemplate();

// Register Welcome Email template in Template Renderer engine
emailTemplateRenderer.registerTemplate(welcomeEmailTemplate);

console.log("JWT Service Instance:", jwtService);
console.log("verifyAccessToken:", typeof jwtService.verifyAccessToken);

export const authService = new AuthService(
  jwtService,
  sessionService,
  emailService,
  emailTemplateRenderer
);
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

// File Module Central DI Singletons (Module 21.7)
export const localStorageProvider = new LocalStorageProvider();
export const storageProviderFactory = new StorageProviderFactory(StorageProviderType.LOCAL);
export const namingStrategy = new NamingStrategy();
export const fileRepository = new FileRepository();

// Register LocalStorageProvider strategy in Abstract Storage Factory
storageProviderFactory.registerProvider(localStorageProvider);

export const fileService = new FileService(storageProviderFactory, namingStrategy);
export const fileUploadService = new FileUploadService(storageProviderFactory, namingStrategy, fileRepository);
export const fileController = new FileController(fileUploadService);

// Search Module DI Singletons
export const searchRepository = new SearchRepository();
export const searchService = new SearchService(searchRepository);
export const searchController = new SearchController(searchService);