import { envConfig } from './env.config';

/**
 * Enterprise Application Configuration Module (Module 2 - Step 2.1).
 *
 * Immutable application-wide operational constants, pagination parameters,
 * language defaults, and date/time format constants.
 */
export interface IAppConfig {
  readonly name: string;
  readonly version: string;
  readonly environment: string;
  readonly defaultLanguage: string;
  readonly supportedLanguages: readonly string[];
  readonly pagination: {
    readonly defaultPage: number;
    readonly defaultLimit: number;
    readonly limitOptions: readonly number[];
  };
  readonly dateTime: {
    readonly defaultDateFormat: string;
    readonly defaultTimeFormat: string;
    readonly defaultDateTimeFormat: string;
    readonly isoFormat: string;
  };
  readonly metadata: {
    readonly companyName: string;
    readonly supportEmail: string;
    readonly copyrightYear: number;
  };
}

export const APP_CONFIG: IAppConfig = Object.freeze({
  name: envConfig.appTitle,
  version: '1.0.0',
  environment: envConfig.appEnv,
  defaultLanguage: 'en-US',
  supportedLanguages: Object.freeze(['en-US', 'es-ES', 'fr-FR', 'de-DE']),
  pagination: Object.freeze({
    defaultPage: 1,
    defaultLimit: 10,
    limitOptions: Object.freeze([10, 25, 50, 100]),
  }),
  dateTime: Object.freeze({
    defaultDateFormat: 'MMM dd, yyyy',
    defaultTimeFormat: 'hh:mm a',
    defaultDateTimeFormat: 'MMM dd, yyyy hh:mm a',
    isoFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  }),
  metadata: Object.freeze({
    companyName: 'Enterprise E-Commerce Inc.',
    supportEmail: 'support@enterprise-ecommerce.com',
    copyrightYear: new Date().getFullYear(),
  }),
});
