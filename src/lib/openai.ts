import OpenAI from 'openai';

// This ensures the code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server-side');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
