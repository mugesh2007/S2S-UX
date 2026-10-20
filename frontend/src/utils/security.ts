/**
 * Security and sanitization utilities for the S2S UI Rendering Engine.
 * Enforces zero execution of model-generated code and prevents XSS/CSS injection.
 */

const SAFE_URL_PATTERN = /^(https?:|mailto:|#|\/[a-zA-Z0-9_\-./]*)/i;
const DANGEROUS_CSS_PATTERN = /(expression|behavior|javascript:|vbscript:|@import|-moz-binding|<|>|url\s*\(\s*['"]?data:)/i;

/**
 * Validates and sanitizes a link or image URL.
 * Only allows http:, https:, mailto:, #, or relative paths.
 * Returns undefined or fallback if unsafe.
 */
export function sanitizeUrl(url: unknown, fallback: string = '#'): string {
  if (typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const clean = url.trim();
  // Strictly reject javascript:, data:, and script injections
  if (/^(javascript|data|vbscript|file):/i.test(clean)) {
    return fallback;
  }
  if (SAFE_URL_PATTERN.test(clean)) {
    return clean;
  }
  return fallback;
}

/**
 * Sanitizes Tailwind CSS class token string.
 * Strips angle brackets, script-like tokens, quotes, and newlines.
 */
export function sanitizeTailwindClasses(classes: unknown): string {
  if (typeof classes !== 'string') return '';
  // Remove dangerous HTML/script characters
  return classes
    .replace(/[<>"';`{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes custom inline CSS style object.
 * Strips dangerous properties and unvalidated expression values.
 */
export function sanitizeInlineStyles(
  styles: Record<string, string> | undefined
): React.CSSProperties {
  if (!styles || typeof styles !== 'object') return {};

  const cleanStyles: Record<string, string> = {};
  for (const [key, val] of Object.entries(styles)) {
    if (typeof key !== 'string' || typeof val !== 'string') continue;

    // Disallow dangerous CSS properties
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('behavior') ||
      lowerKey.includes('binding') ||
      lowerKey.includes('expression')
    ) {
      continue;
    }

    // Disallow dangerous CSS values
    if (DANGEROUS_CSS_PATTERN.test(val)) {
      continue;
    }

    cleanStyles[key] = val.trim();
  }

  return cleanStyles as React.CSSProperties;
}

/**
 * Safe text content wrapper. Guarantees safe string conversion without evaluating code.
 */
export function safeText(value: unknown, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}
