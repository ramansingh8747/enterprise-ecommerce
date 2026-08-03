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

import { AnalyticsRepository } from "../modules/analytics/repositories/analytics.repository";
import { AnalyticsService } from "../modules/analytics/services/analytics.service";
import { AnalyticsController } from "../modules/analytics/controllers/analytics.controller";

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

// Analytics & Reporting Engine DI Singletons (Module 23.1)
export const analyticsRepository = new AnalyticsRepository();
export const analyticsService = new AnalyticsService(analyticsRepository);
export const analyticsController = new AnalyticsController(analyticsService);

// Audit Module DI Singletons (Module 24.3 / 24.5)
import { MongoAuditRepository } from "../modules/audit/repositories/mongo-audit.repository";
import { AuditProvider } from "../modules/audit/providers/audit.provider";
import { AuditService } from "../modules/audit/services/audit.service";
import { AuditController } from "../modules/audit/controllers/audit.controller";

export const auditRepository = new MongoAuditRepository();
export const auditProvider = new AuditProvider(auditRepository);
export const auditService = new AuditService(auditRepository);
export const auditController = new AuditController(auditService);

// Background Jobs Engine DI Singletons (Module 25.3 / 25.4 / 25.5)
import { MongoJobsRepository } from "../modules/jobs/repositories/mongo-jobs.repository";
import { JobProvider } from "../modules/jobs/providers/jobs.provider";
import { JobService } from "../modules/jobs/services/jobs.service";
import { WorkerRegistry } from "../modules/jobs/workers/worker.registry";
import { JobExecutor } from "../modules/jobs/executors/job.executor";
import { SchedulerEngine } from "../modules/jobs/scheduler/scheduler.engine";
import { SchedulerService } from "../modules/jobs/scheduler/scheduler.service";
import { JobsController } from "../modules/jobs/controllers/jobs.controller";

export const jobsRepository = new MongoJobsRepository();
export const jobsProvider = new JobProvider(jobsRepository);
export const jobsService = new JobService(jobsRepository, jobsProvider);
export const workerRegistry = new WorkerRegistry();
export const jobExecutor = new JobExecutor(jobsRepository, workerRegistry);
export const schedulerEngine = new SchedulerEngine();
export const schedulerService = new SchedulerService(jobsRepository, jobsService, schedulerEngine, jobExecutor);
export const jobsController = new JobsController(jobsService);

// Enterprise Cache System DI Singletons (Module 26.3 / 26.5)
import { MemoryCacheProvider } from "../modules/cache/providers/memory-cache.provider";
import { CacheService } from "../modules/cache/services/cache.service";
import { CacheController } from "../modules/cache/controllers/cache.controller";

export const memoryCacheProvider = new MemoryCacheProvider();
export const cacheService = new CacheService(memoryCacheProvider);
export const cacheController = new CacheController(cacheService);

// Enterprise Payment Gateway Module DI Singletons (Module 27.3 / 27.5 / 27.6)
import { MongoPaymentRepository } from "../modules/payment/repositories/mongo-payment.repository";
import { MockPaymentProvider } from "../modules/payment/providers/mock-payment.provider";
import { PaymentProviderRegistry } from "../modules/payment/providers/provider.registry";
import { PaymentProviderFactory } from "../modules/payment/providers/payment.factory";
import { PaymentService } from "../modules/payment/services/payment.service";
import { PaymentController } from "../modules/payment/controllers/payment.controller";
import { WebhookService } from "../modules/payment/webhooks/webhook.service";
import { WebhookController } from "../modules/payment/controllers/webhook.controller";

export const paymentRepository = new MongoPaymentRepository();
export const paymentProviderRegistry = new PaymentProviderRegistry();
export const mockPaymentProvider = new MockPaymentProvider();
export const paymentProviderFactory = new PaymentProviderFactory(paymentProviderRegistry);
export const paymentProvider = paymentProviderFactory.getProvider();
export const paymentService = new PaymentService(paymentRepository, paymentProvider);
export const paymentController = new PaymentController(paymentService);
export const webhookService = new WebhookService(paymentService, paymentProviderFactory);
export const webhookController = new WebhookController(webhookService);

// Enterprise API Rate Limiting & Throttling DI Singletons (Module 28.3 / 28.5 / 28.6)
import { RateLimitStore } from "../modules/rate-limit/storage/rate-limit.store";
import { MemoryRateLimitProvider } from "../modules/rate-limit/providers/memory-rate-limit.provider";
import { globalRateLimitPolicyRegistry } from "../modules/rate-limit/policies/policy.registry";
import { RateLimitService } from "../modules/rate-limit/services/rate-limit.service";
import { RateLimitController } from "../modules/rate-limit/controllers/rate-limit.controller";

export const rateLimitStore = new RateLimitStore();
export const memoryRateLimitProvider = new MemoryRateLimitProvider(rateLimitStore);
export const rateLimitPolicyRegistry = globalRateLimitPolicyRegistry;
export const rateLimitService = new RateLimitService(memoryRateLimitProvider);
export const rateLimitController = new RateLimitController(rateLimitService);

// Enterprise API Versioning & Backward Compatibility DI Singletons (Module 29.3 / 29.5 / 29.6)
import { VersionStore } from "../modules/api-versioning/storage/version.store";
import { globalVersionRegistry } from "../modules/api-versioning/registry/version.registry";
import { VersionResolver } from "../modules/api-versioning/resolver/version.resolver";
import { DefaultVersionProvider } from "../modules/api-versioning/providers/default-version.provider";
import { ApiVersionService } from "../modules/api-versioning/services/api-version.service";
import { ApiVersionController } from "../modules/api-versioning/controllers/api-version.controller";

export const versionStore = new VersionStore();
export const versionRegistry = globalVersionRegistry;
export const versionResolver = new VersionResolver();
export const versionProvider = new DefaultVersionProvider(versionStore, versionRegistry, versionResolver);
export const apiVersionService = new ApiVersionService(versionProvider, versionRegistry);
export const apiVersionController = new ApiVersionController(apiVersionService);