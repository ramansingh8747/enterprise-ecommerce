import { body, param, query } from 'express-validator';
import { validateRequest } from '../../../middleware/validate.middleware';
import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notification.types';

/**
 * Express-validator chain for creating a single notification.
 */
export const createNotificationValidation = [
  body('type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn(Object.values(NotificationType))
    .withMessage('Invalid notification type'),
  body('channel')
    .notEmpty()
    .withMessage('Notification channel is required')
    .isIn(Object.values(NotificationChannel))
    .withMessage('Invalid notification channel'),
  body('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage('Invalid notification priority'),
  body('message')
    .notEmpty()
    .withMessage('Notification message is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Notification message must be between 1 and 10000 characters'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Notification title cannot exceed 250 characters'),
  body('recipient')
    .notEmpty()
    .withMessage('Recipient object is required')
    .isObject()
    .withMessage('Recipient must be a JSON object'),
  body('recipient.userId')
    .optional()
    .isMongoId()
    .withMessage('recipient.userId must be a valid Mongo ObjectId'),
  body('recipient.email')
    .optional()
    .isEmail()
    .withMessage('recipient.email must be a valid email address'),
  body('recipient.phone')
    .optional()
    .isString()
    .trim()
    .withMessage('recipient.phone must be a string'),
  body('recipient.deviceToken')
    .optional()
    .isString()
    .trim()
    .withMessage('recipient.deviceToken must be a string'),
  body('recipient.webhookUrl')
    .optional()
    .isURL()
    .withMessage('recipient.webhookUrl must be a valid URL'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('scheduledAt must be a valid ISO8601 date string'),
  validateRequest,
];

/**
 * Express-validator chain for bulk notification creation.
 */
export const createBulkNotificationsValidation = [
  body('items')
    .notEmpty()
    .withMessage('items array is required')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array of notification objects'),
  validateRequest,
];

/**
 * Express-validator chain for scheduling a notification.
 */
export const scheduleNotificationValidation = [
  body('scheduledAt')
    .notEmpty()
    .withMessage('scheduledAt date is required')
    .isISO8601()
    .withMessage('scheduledAt must be a valid ISO8601 date string'),
  validateRequest,
];

/**
 * Express-validator chain for path parameter ID lookups.
 */
export const getNotificationByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for user notifications query parameters.
 */
export const getUserNotificationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage('Invalid notification type filter'),
  query('channel')
    .optional()
    .isIn(Object.values(NotificationChannel))
    .withMessage('Invalid notification channel filter'),
  query('status')
    .optional()
    .isIn(Object.values(NotificationStatus))
    .withMessage('Invalid notification status filter'),
  query('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage('Invalid notification priority filter'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead filter must be a boolean string (true/false)'),
  query('sortBy')
    .optional()
    .isString()
    .trim()
    .withMessage('sortBy must be a field string name'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
  validateRequest,
];

/**
 * Express-validator chain for marking a notification as read.
 */
export const markAsReadValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for marking multiple notifications as read.
 */
export const markAllAsReadValidation = [
  body('notificationIds')
    .optional()
    .isArray()
    .withMessage('notificationIds must be an array of Mongo ObjectIds'),
  body('notificationIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each notificationId must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for updating notification status.
 */
export const updateNotificationStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(Object.values(NotificationStatus))
    .withMessage('Invalid notification status'),
  body('failureReason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('failureReason cannot exceed 2000 characters'),
  validateRequest,
];

/**
 * Express-validator chain for retrying a failed notification.
 */
export const retryNotificationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for cancelling a pending/queued notification.
 */
export const cancelNotificationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  validateRequest,
];

/**
 * Express-validator chain for deleting a notification.
 */
export const deleteNotificationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID path parameter is required')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ObjectId'),
  validateRequest,
];
