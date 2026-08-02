/**
 * Shared HTML Layout wrapper for standard email dispatches.
 */
export class DefaultEmailLayout {
  static wrap(contentHtml: string, title: string = 'Enterprise Store'): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .header { background: #1a202c; padding: 20px; text-align: center; color: #ffffff; font-size: 20px; font-weight: bold; }
    .content { padding: 30px; line-height: 1.6; }
    .footer { background: #edf2f7; padding: 15px; text-align: center; font-size: 12px; color: #718096; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="content">${contentHtml}</div>
    <div class="footer">&copy; ${new Date().getFullYear()} Enterprise Store. All rights reserved.</div>
  </div>
</body>
</html>`;
  }
}
