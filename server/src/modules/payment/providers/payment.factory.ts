import { IPaymentProvider } from '../interfaces/payment.interfaces';
import { PaymentProvider } from '../enums/payment.enums';
import { globalPaymentProviderRegistry, PaymentProviderRegistry } from './provider.registry';
import { DEFAULT_PAYMENT_CONFIG, IPaymentConfig } from '../config/payment.config';

/**
 * Enterprise Payment Provider Factory (Module 27.4).
 *
 * Resolves active payment gateway transport drivers based on requested provider keys
 * or application defaults.
 */
export class PaymentProviderFactory {
  constructor(
    private readonly registry: PaymentProviderRegistry = globalPaymentProviderRegistry,
    private readonly config: IPaymentConfig = DEFAULT_PAYMENT_CONFIG
  ) {}

  /**
   * Resolves and returns the target IPaymentProvider driver instance.
   *
   * @param provider Optional PaymentProvider enum key. Defaults to configured provider.
   */
  getProvider(provider?: PaymentProvider): IPaymentProvider {
    const targetProvider = provider || this.config.provider || PaymentProvider.MOCK;
    const driver = this.registry.getProvider(targetProvider);

    if (!driver) {
      throw new Error(
        `PaymentProvider '${targetProvider}' is not registered. Registered providers: ${this.registry
          .listProviders()
          .join(', ')}`
      );
    }

    return driver;
  }

  /**
   * Validates whether a payment provider driver is registered and available.
   *
   * @param provider Target PaymentProvider key.
   */
  validateProvider(provider: PaymentProvider): boolean {
    return this.registry.hasProvider(provider);
  }

  /**
   * Registers a new provider instance dynamically.
   *
   * @param provider Target PaymentProvider key.
   * @param instance Driver implementation.
   */
  registerProvider(provider: PaymentProvider, instance: IPaymentProvider): void {
    this.registry.registerProvider(provider, instance);
  }
}
