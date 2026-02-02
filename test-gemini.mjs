import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
console.log('API Key length:', apiKey.length);
console.log('API Key starts with:', apiKey.substring(0, 7));

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

try {
  const result = await model.generateContent('Hi');
  console.log('Success:', result.response.text());
} catch (e) {
  console.error('Failure:', e.message);
}
