import { Types } from 'mongoose';

/**
 * Domain representation of an official merchant reply to a customer review.
 */
export interface IMerchantReply {
  /**
   * The text response body provided by the store owner or authorized administrator.
   */
  comment: string;

  /**
   * UTC timestamp when the merchant response was posted.
   */
  repliedAt: Date;

  /**
   * Reference to the User ID of the merchant/admin who authored the reply.
   */
  repliedBy: Types.ObjectId | string;
}
