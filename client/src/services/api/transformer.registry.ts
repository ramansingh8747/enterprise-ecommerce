export type ResponseTransformer<TInput = unknown, TOutput = unknown> = (data: TInput) => TOutput;

/**
 * Open/Closed Transformer Registry (Module 6 - Step 6.5).
 *
 * Centralized registry for registering response transformation functions.
 */
export class TransformerRegistry {
  private static transformers: Map<string, ResponseTransformer> = new Map();

  /**
   * Registers a response transformer.
   */
  public static register(key: string, transformer: ResponseTransformer): void {
    this.transformers.set(key, transformer);
  }

  /**
   * Retrieves a response transformer by key.
   */
  public static getTransformer<TInput = unknown, TOutput = unknown>(
    key: string
  ): ResponseTransformer<TInput, TOutput> | undefined {
    return this.transformers.get(key) as ResponseTransformer<TInput, TOutput> | undefined;
  }
}
