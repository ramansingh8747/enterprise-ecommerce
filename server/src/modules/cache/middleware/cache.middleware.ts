import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ICacheService } from '../interfaces/cache.interfaces';
import { CacheDecoratorUtil } from '../decorators/cache.decorator';
import { CacheStatus } from '../enums/cache.enums';

/**
 * Express Response Payload Wrapper.
 */
interface IResponsePayload {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Enterprise Cache Express Middleware Factory (Module 26.4).
 *
 * Creates non-blocking Express middleware that intercepts eligible GET requests,
 * serves cached responses on Cache HIT (`X-Cache: HIT`), and captures successful HTTP 200
 * responses on Cache MISS (`X-Cache: MISS`) for storage via ICacheService.
 *
 * Cache errors are swallowed silently to guarantee zero impact on API availability.
 *
 * @param cacheService Injected ICacheService instance.
 * @param customTTL Optional custom TTL override in seconds.
 * @returns Express RequestHandler middleware function.
 */
export function createCacheMiddleware(
  cacheService: ICacheService,
  customTTL?: number
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Check eligibility
    if (!CacheDecoratorUtil.shouldCache(req)) {
      return next();
    }

    const key = CacheDecoratorUtil.buildCacheKey(req);
    const ttl = CacheDecoratorUtil.resolveTTL(req, customTTL);
    const namespace = CacheDecoratorUtil.resolveNamespace(req);

    // 2. Check Cache
    try {
      const { value, status } = await cacheService.get<IResponsePayload>(key);

      if (status === CacheStatus.HIT && value) {
        res.setHeader('X-Cache', 'HIT');
        if (value.headers) {
          for (const [hKey, hVal] of Object.entries(value.headers)) {
            res.setHeader(hKey, hVal);
          }
        }
        res.status(value.statusCode || 200).json(value.body);
        return;
      }
    } catch (err) {
      console.error('[CacheMiddleware] Error reading cache key:', err);
    }

    // 3. Cache MISS — Intercept Response Capture
    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let isCaptured = false;

    const captureAndSave = (bodyData: unknown) => {
      if (isCaptured) return;
      isCaptured = true;

      // Only cache successful 200 OK responses
      if (res.statusCode === 200 && bodyData !== undefined && bodyData !== null) {
        setImmediate(async () => {
          try {
            const payloadToStore: IResponsePayload = {
              statusCode: 200,
              headers: {
                'content-type': String(res.getHeader('content-type') || 'application/json'),
              },
              body: bodyData,
            };

            await cacheService.set(key, payloadToStore, {
              ttl,
              namespace,
            });
          } catch (saveErr) {
            console.error('[CacheMiddleware] Error saving cached response:', saveErr);
          }
        });
      }
    };

    res.json = function (body: unknown): Response {
      captureAndSave(body);
      return originalJson(body);
    };

    res.send = function (body: unknown): Response {
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        captureAndSave(parsed);
      } catch {
        captureAndSave(body);
      }
      return originalSend(body);
    };

    next();
  };
}
