import { IStorageProviderFactory } from '../interfaces/storage-factory.interface';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { StorageProviderType } from '../types/file.types';
import { ProviderUnavailableError } from '../errors/file.errors';

/**
 * Enterprise Storage Provider Abstract Factory (Module 21.1).
 * Supports runtime provider resolution and dynamic strategy registration.
 */
export class StorageProviderFactory implements IStorageProviderFactory {
  private readonly providerRegistry = new Map<StorageProviderType, IStorageProvider>();

  constructor(private readonly defaultProviderType: StorageProviderType = StorageProviderType.LOCAL) {}

  /**
   * Registers a storage provider instance into factory registry.
   */
  registerProvider(provider: IStorageProvider): void {
    if (!provider || !provider.providerType) {
      throw new Error('Cannot register invalid storage provider instance');
    }
    this.providerRegistry.set(provider.providerType, provider);
  }

  /**
   * Resolves target storage provider instance based on type or returns default provider.
   */
  getProvider(providerType?: StorageProviderType): IStorageProvider {
    const targetType = providerType || this.defaultProviderType;
    const provider = this.providerRegistry.get(targetType);

    if (!provider) {
      throw new ProviderUnavailableError(
        `Storage provider '${targetType}' is not registered in StorageProviderFactory`
      );
    }

    return provider;
  }
}
