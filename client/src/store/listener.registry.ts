import type { AppStartListening } from './types/listener.types';

export type ListenerRegistrar = (startListening: AppStartListening) => void;

/**
 * Open/Closed Listener Registry (Module 5 - Step 5.5).
 *
 * Allows future feature modules to register side-effect listeners dynamically.
 */
export class ListenerRegistry {
  private static registrars: ListenerRegistrar[] = [];

  /**
   * Registers a feature listener callback.
   */
  public static register(registrar: ListenerRegistrar): void {
    this.registrars.push(registrar);
  }

  /**
   * Executes all registered listener callbacks with startListening.
   */
  public static setupAll(startListening: AppStartListening): void {
    for (const registrar of this.registrars) {
      registrar(startListening);
    }
  }
}
