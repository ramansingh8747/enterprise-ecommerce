import { ApiVersion, VersionResolutionStrategy } from '../enums/api-version.enums';
import { VersionContext } from '../types/api-version.types';
import { StrategyResolver } from './strategy.resolver';
import { DEFAULT_API_VERSION_CONFIG, IApiVersionConfig } from '../config/api-version.config';

/**
 * Enterprise Composite Version Resolver (Module 29.2).
 *
 * Evaluates multiple resolution strategies in prioritized sequence (URL -> Header -> Query -> Media Type)
 * and falls back to configured default API version.
 */
export class VersionResolver {
  private readonly strategyResolvers: StrategyResolver[];

  constructor(private readonly config: IApiVersionConfig = DEFAULT_API_VERSION_CONFIG) {
    // Sequence of strategy resolvers with primary strategy first
    const primary = config.resolutionStrategy || VersionResolutionStrategy.URL;
    const allStrategies: VersionResolutionStrategy[] = [
      primary,
      VersionResolutionStrategy.URL,
      VersionResolutionStrategy.HEADER,
      VersionResolutionStrategy.QUERY,
      VersionResolutionStrategy.MEDIA_TYPE,
    ];

    // Remove duplicates preserving priority order
    const uniqueStrategies = Array.from(new Set(allStrategies));
    this.strategyResolvers = uniqueStrategies.map((strat) => new StrategyResolver(strat, config));
  }

  /**
   * Resolves ApiVersion from request context using prioritized strategy evaluation.
   *
   * @param context Request context payload.
   * @returns Resolved ApiVersion enum. Defaults to config.defaultVersion.
   */
  resolve(context: VersionContext): ApiVersion {
    const result = this.resolveWithStrategy(context);
    return result.version;
  }

  /**
   * Resolves ApiVersion along with the strategy that successfully matched.
   *
   * @param context Request context payload.
   */
  resolveWithStrategy(context: VersionContext): { version: ApiVersion; strategy: VersionResolutionStrategy } {
    for (const resolver of this.strategyResolvers) {
      const resolved = resolver.resolve(context);
      if (resolved) {
        // Resolve LATEST alias to actual configured latestVersion enum
        const finalVersion = resolved === ApiVersion.LATEST ? this.config.latestVersion : resolved;
        return { version: finalVersion, strategy: resolver.strategy };
      }
    }

    return {
      version: this.config.defaultVersion || ApiVersion.V1,
      strategy: this.config.resolutionStrategy || VersionResolutionStrategy.URL,
    };
  }
}
