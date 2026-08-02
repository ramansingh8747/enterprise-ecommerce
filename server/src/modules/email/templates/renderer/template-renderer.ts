import { ITemplateRenderer } from '../interfaces/template-renderer.interface';
import { IEmailTemplateData } from '../interfaces/template-data.interface';
import { IEmailTemplateResult } from '../interfaces/template-result.interface';
import { IEmailTemplate } from '../../interfaces/email-template.interface';

/**
 * Enterprise Email Template Renderer Engine Implementation (Module 20.4).
 * Manages template registration, data context injection, rendering orchestration, and validation.
 */
export class EmailTemplateRenderer implements ITemplateRenderer {
  private readonly templateRegistry = new Map<string, IEmailTemplate>();

  /**
   * Registers a template instance in the engine registry.
   */
  registerTemplate(template: IEmailTemplate): void {
    if (!template || !template.templateId) {
      throw new Error('Cannot register invalid email template instance');
    }
    this.templateRegistry.set(String(template.templateId), template);
  }

  /**
   * Evaluates if a template identifier is registered in the engine.
   */
  hasTemplate(templateName: string): boolean {
    return this.templateRegistry.has(templateName);
  }

  /**
   * Renders a registered template by identifier with data context.
   */
  async render(templateName: string, data: IEmailTemplateData): Promise<IEmailTemplateResult> {
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name identifier is required for rendering');
    }

    const template = this.templateRegistry.get(templateName);
    if (!template) {
      throw new Error(`Email template '${templateName}' is not registered in TemplateRenderer engine`);
    }

    try {
      const rendered = template.render(data || {});
      return {
        subject: template.subject,
        html: rendered.html,
        text: rendered.text,
      };
    } catch (error: any) {
      throw new Error(`Failed to render email template '${templateName}': ${error.message}`);
    }
  }
}
