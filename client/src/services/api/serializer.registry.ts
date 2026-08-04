export type RequestSerializer<T = unknown> = (data: T) => unknown;
export type ResponseDeserializer<T = unknown> = (data: unknown) => T;

/**
 * Open/Closed Serializer Registry (Module 6 - Step 6.5).
 *
 * Centralized registry for registering custom data serializers and deserializers.
 */
export class SerializerRegistry {
  private static serializers: Map<string, RequestSerializer> = new Map();
  private static deserializers: Map<string, ResponseDeserializer> = new Map();

  /**
   * Registers a request serializer for a payload key.
   */
  public static registerSerializer(key: string, serializer: RequestSerializer): void {
    this.serializers.set(key, serializer);
  }

  /**
   * Registers a response deserializer for a payload key.
   */
  public static registerDeserializer(key: string, deserializer: ResponseDeserializer): void {
    this.deserializers.set(key, deserializer);
  }

  /**
   * Gets a request serializer by key.
   */
  public static getSerializer(key: string): RequestSerializer | undefined {
    return this.serializers.get(key);
  }

  /**
   * Gets a response deserializer by key.
   */
  public static getDeserializer(key: string): ResponseDeserializer | undefined {
    return this.deserializers.get(key);
  }
}
