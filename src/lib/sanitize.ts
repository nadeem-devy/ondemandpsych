/**
 * Server-side HTML sanitization for blog content.
 * Removes potentially dangerous tags/attributes while preserving formatting.
 */
export function sanitizeHtml(html: string): string {
  // Allow standard content tags, remove scripts/event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
