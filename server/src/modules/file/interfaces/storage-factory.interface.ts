import { StorageProviderType } from '../types/file.types';
import { IStorageProvider } from './storage-provider.interface';

/**
 * Storage Provider Abstract Factory Interface (Module 21.1).
 */
export interface IStorageProviderFactory {
  /**
   * Resolves target storage provider instance based on type or returns default provider.
   * @param providerType Optional provider enum
   */
  getProvider(providerType?: StorageProviderType): IStorageProvider;

  /**
   * Registers a new storage provider strategy instance into factory registry.
   * @param provider Strategy instance implementing IStorageProvider
   */
  registerProvider(provider: IStorageProvider): void;
}
