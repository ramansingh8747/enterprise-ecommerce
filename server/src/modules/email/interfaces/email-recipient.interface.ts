/**
 * Recipient target contract.
 */
export interface IEmailRecipient {
  /**
   * Target email address.
   */
  email: string;

  /**
   * Optional recipient display name (e.g. 'John Doe').
   */
  name?: string;
}
