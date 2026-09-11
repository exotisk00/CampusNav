import { isRealAiConfigured, getAiStatus } from './aiConfig.js';
import { queryGeminiApi } from './geminiClient.js';
import {
  generateLocalCampusResponse,
  quickActions,
  suggestedPrompts,
} from './campusContextEngine.js';

/**
 * Main AI Assistant dispatch function.
 * 1. Checks if external Gemini API is configured and attempts response.
 * 2. Seamlessly and reliably falls back to the Local Campus Context Engine
 *    grounded in LPU locations, live Firestore events, and live lost & found items.
 */
export async function getAiAssistantResponse(userMessage, campusContext = {}) {
  const trimmed = (userMessage || '').trim();
  if (!trimmed) {
    return {
      text: "How can I help you today? Ask me about campus navigation, events, lost & found, or facilities!",
      action: null,
      provider: 'CampusNav AI',
    };
  }

  // 1. Try external AI API if key is present
  if (isRealAiConfigured()) {
    try {
      const geminiResult = await queryGeminiApi(trimmed, campusContext);
      if (geminiResult && geminiResult.text) {
        return geminiResult;
      }
    } catch (err) {
      console.warn('External AI call error, switching to Campus Context Engine:', err);
    }
  }

  // 2. Safe & intelligent Local Campus Engine
  return generateLocalCampusResponse(trimmed, campusContext);
}

export { getAiStatus, quickActions, suggestedPrompts };
