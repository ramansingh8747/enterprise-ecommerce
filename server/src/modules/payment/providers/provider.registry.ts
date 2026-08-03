import { IPaymentProvider } from '../interfaces/payment.interfaces';
import { PaymentProvider } from '../enums/payment.enums';
import { MockPaymentProvider } from './mock-payment.provider';

/**
 * Enterprise Payment Provider Registry (Module 27.4).
 *
 * Central registry mapping PaymentProvider enum values to concrete IPaymentProvider
 * driver instances. Prevents duplicate registrations and supports dynamic driver lookup.
 */
export class PaymentProviderRegistry {
  private readonly providers = new Map<PaymentProvider, IPaymentProvider>();

  constructor() {
    // Automatically register default MockPaymentProvider driver
    this.registerProvider(PaymentProvider.MOCK, new MockPaymentProvider());
  }

  /**
   * Registers a concrete IPaymentProvider driver for a PaymentProvider enum.
   *
   * @param provider PaymentProvider classification key.
   * @param driver Implementation instance.
   */
  registerProvider(provider: PaymentProvider, driver: IPaymentProvider): void {
    if (!driver) {
      throw new Error(`Cannot register null or undefined driver for provider '${provider}'.`);
    }
    this.providers.set(provider, driver);
  }

  /**
   * Unregisters a driver implementation from the registry.
   *
   * @param provider Target PaymentProvider key.
   */
  unregisterProvider(provider: PaymentProvider): boolean {
    return this.providers.delete(provider);
  }

  /**
   * Resolves a registered driver instance for a PaymentProvider key.
   *
   * @param provider Target PaymentProvider key.
   * @returns IPaymentProvider driver or null if unregistered.
   */
  getProvider(provider: PaymentProvider): IPaymentProvider | null {
    return this.providers.get(provider) || null;
  }

  /**
   * Checks whether a provider driver is registered.
   *
   * @param provider Target PaymentProvider key.
   */
  hasProvider(provider: PaymentProvider): boolean {
    return this.providers.has(provider);
  }

  /**
   * Returns list of currently registered PaymentProvider keys.
   */
  listProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }
}

/** Global singleton instance of PaymentProviderRegistry */
export const globalPaymentProviderRegistry = new PaymentProviderRegistry();
