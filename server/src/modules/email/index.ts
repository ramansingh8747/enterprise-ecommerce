// Barrel export for Email Module Architecture (Module 20.4)
export * from './types/email.types';
export * from './constants/email.constants';
export * from './interfaces/email-recipient.interface';
export * from './interfaces/email-attachment.interface';
export * from './interfaces/email-request.interface';
export * from './interfaces/email-response.interface';
export * from './interfaces/email-provider.interface';
export * from './interfaces/email-service.interface';
export * from './interfaces/email-template.interface';
export * from './providers/smtp.provider';
export * from './providers/nodemailer.provider';
export * from './providers/ses.provider';
export * from './providers/sendgrid.provider';
export * from './providers/mailgun.provider';
export * from './providers/mock.provider';
export * from './services/email.service';
export * from './templates';
