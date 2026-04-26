// API configuration constants for OpenRouter interaction

export const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default headers sent with every API request
export const fallbackHeaders = {
    'Content-Type': 'application/json',
    'X-Title': 'RittikProg OpenRouter API', // Application identifire for OpenRouter
}

// Maxium number of characters allowed in file attachments to avoid API limits
export const MAX_FILE_CHARS = 120000