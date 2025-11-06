/**
 * Text utility functions for app-wide text processing
 */

/**
 * Replaces {{appName}} placeholder in text with the user's app alias
 * @param text - The text containing {{appName}} placeholder
 * @param appAlias - The app alias to replace with (default: 'Rhythm')
 * @returns The text with {{appName}} replaced
 */
export const replaceAppName = (text: string, appAlias?: string): string => {
  const alias = appAlias || 'Rhythm';
  return text.replace(/\{\{appName\}\}/g, alias);
};

/**
 * Replaces {{nickname}} placeholder in text with the user's nickname
 * @param text - The text containing {{nickname}} placeholder
 * @param nickname - The nickname to replace with (default: 'Guest')
 * @returns The text with {{nickname}} replaced
 */
export const replaceNickname = (text: string, nickname?: string): string => {
  const nick = nickname || 'Guest';
  return text.replace(/\{\{nickname\}\}/g, nick);
};

/**
 * Replaces both {{appName}} and {{nickname}} placeholders in text
 * @param text - The text containing placeholders
 * @param appAlias - The app alias to use
 * @param nickname - The nickname to use
 * @returns The text with both placeholders replaced
 */
export const replacePlaceholders = (text: string, appAlias?: string, nickname?: string): string => {
  let result = replaceAppName(text, appAlias);
  result = replaceNickname(result, nickname);
  return result;
};

/**
 * Gets a personalized greeting message with app alias
 * @param baseMessage - Base message with {{appName}} placeholder
 * @param appAlias - The app alias to use
 * @returns Personalized message
 */
export const getPersonalizedMessage = (baseMessage: string, appAlias?: string): string => {
  return replaceAppName(baseMessage, appAlias);
};

