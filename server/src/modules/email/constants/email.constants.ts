import { EmailCategory, EmailPriority } from '../types/email.types';

/**
 * Enterprise Email Module Constants (Module 20.1).
 */

/**
 * Default Sender Information.
 */
export const DEFAULT_SENDER = {
  name: process.env.EMAIL_FROM_NAME || 'Enterprise Store',
  email: process.env.EMAIL_FROM_ADDRESS || 'no-reply@enterprisestore.com',
};

/**
 * Default Retry Configuration.
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactorMs: 2000,
  maxDelayMs: 10000,
};

/**
 * Attachment Size and Count Boundaries.
 */
export const ATTACHMENT_LIMITS = {
  maxSizeBytes: 25 * 1024 * 1024, // 25MB
  maxCount: 10,
};

/**
 * Priority List Array.
 */
export const EMAIL_PRIORITIES = Object.values(EmailPriority);

/**
 * Category List Array.
 */
export const EMAIL_CATEGORIES = Object.values(EmailCategory);
