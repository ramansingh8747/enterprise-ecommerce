import { EmailTemplateId } from '../../types/email.types';
import { IEmailTemplate, IRenderedEmail } from '../../interfaces/email-template.interface';
import { IEmailTemplateData } from '../interfaces/template-data.interface';
import { DefaultEmailLayout } from '../layouts/default-layout';

/**
 * Abstract Base Class for all Email Templates (Module 20.4).
 * Enforces strong typing, variable interpolation, and layout wrapping.
 */
export abstract class BaseEmailTemplate implements IEmailTemplate {
  abstract readonly templateId: EmailTemplateId | string;
  abstract readonly subject: string;

  /**
   * Internal string interpolation helper replacing {{variable}} placeholders.
   */
  protected interpolate(templateStr: string, data: IEmailTemplateData): string {
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
      const value = key.split('.').reduce((acc: any, part: string) => acc && acc[part], data);
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  /**
   * Abstract renderHtml method implemented by concrete template subclasses.
   */
  protected abstract renderHtmlContent(data: IEmailTemplateData): string;

  /**
   * Abstract renderTextContent method implemented by concrete template subclasses.
   */
  protected abstract renderTextContent(data: IEmailTemplateData): string;

  /**
   * Renders the complete template including subject interpolation, HTML layout wrapping, and plain text fallback.
   */
  render(context: IEmailTemplateData): IRenderedEmail {
    if (!context || typeof context !== 'object') {
      throw new Error(`Invalid context data supplied to template '${this.templateId}'`);
    }

    const interpolatedSubject = this.interpolate(this.subject, context);
    const rawHtml = this.renderHtmlContent(context);
    const wrappedHtml = DefaultEmailLayout.wrap(rawHtml, interpolatedSubject);
    const plainText = this.renderTextContent(context);

    return {
      html: wrappedHtml,
      text: plainText,
    };
  }
}
