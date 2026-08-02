import { IEmailTemplateData } from './template-data.interface';
import { IEmailTemplateResult } from './template-result.interface';
import { IEmailTemplate } from '../../interfaces/email-template.interface';

/**
 * Enterprise Email Template Renderer Engine Interface Contract.
 */
export interface ITemplateRenderer {
  /**
   * Renders a registered template by identifier with data context.
   */
  render(templateName: string, data: IEmailTemplateData): Promise<IEmailTemplateResult>;

  /**
   * Registers a template instance with the rendering engine.
   */
  registerTemplate(template: IEmailTemplate): void;

  /**
   * Evaluates if a template identifier is registered in the engine.
   */
  hasTemplate(templateName: string): boolean;
}
