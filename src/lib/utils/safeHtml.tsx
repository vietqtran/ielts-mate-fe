import React from 'react';

/**
 * Safely renders HTML content by ensuring it doesn't cause hydration errors
 * @param htmlContent - The HTML content to render
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(htmlContent: string): string {
  if (!htmlContent) return '';

  // Simple sanitization to prevent hydration errors
  // Remove any script tags and other potentially dangerous content
  const sanitized = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * Component wrapper for safely rendering HTML content
 * @param htmlContent - The HTML content to render
 * @param className - CSS classes to apply to the wrapper
 * @returns JSX element with safely rendered HTML
 */
export function SafeHtmlRenderer({
  htmlContent,
  className = '',
}: {
  htmlContent: string;
  className?: string;
}): React.JSX.Element {
  const sanitizedHtml = sanitizeHtml(htmlContent);

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
