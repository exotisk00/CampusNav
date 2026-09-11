/**
 * AI Configuration and Status Detection
 * Supports optional external AI API (e.g. Google Gemini) via VITE_GEMINI_API_KEY.
 * Safely defaults to Local Campus Context Engine when not configured.
 */

export const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
  '';

export function isRealAiConfigured() {
  return Boolean(
    GEMINI_API_KEY &&
    GEMINI_API_KEY.trim().length > 10 &&
    !GEMINI_API_KEY.includes('your-api-key')
  );
}

export function getAiStatus() {
  const configured = isRealAiConfigured();
  return {
    isConfigured: configured,
    providerName: configured ? 'Google Gemini AI' : 'Campus Context Engine',
    shortLabel: configured ? 'Gemini AI' : 'Campus Context Engine',
    statusText: configured ? 'Online • Gemini AI' : 'Online • Campus Context Engine',
  };
}
