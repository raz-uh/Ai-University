import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
};

export async function conductDiagnosticInterview(responses: string[], language: string = 'English') {
  const model = getGeminiModel();

  const prompt = `You are an adaptive learning AI. Based on these user responses to diagnostic questions:
  
1. ${responses[0]}
2. ${responses[1]}
3. ${responses[2]}

Analyze the user's skill level (Beginner/Intermediate/Advanced) and determine their learning preference.
IMPORTANT: Your JSON response content (like topic names) should be in ${language}.
HOWEVER, keep the values for "skillLevel" and "stylePreference" in English exactly as specified.
  
Return ONLY a valid JSON object in this exact format:
{
  "skillLevel": "Beginner" | "Intermediate" | "Advanced",
  "stylePreference": "Video" | "PDF" | "Flashcards",
  "recommendedTopics": ["topic1", "topic2", "topic3"]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Robust JSON extraction
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : text;

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", text);
    throw new Error("Invalid AI response format");
  }
}

export async function generateCourseSyllabus(topic: string, skillLevel: string, stylePreference: string, language: string = 'English') {
  const model = getGeminiModel();

  const prompt = `Create a detailed course syllabus on "${topic}" for a ${skillLevel} learner who prefers ${stylePreference} format.
IMPORTANT: All text in the syllabus content (titles, module names, lesson descriptions) must be in ${language}.
  
Return ONLY a valid JSON object in this format:
{
  "title": "Course Title",
  "modules": [
    {
      "title": "Module Title",
      "content": "Detailed lesson content and explanation"
    }
  ],
  "estimatedHours": 10
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : text;

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse syllabus JSON:", text);
    throw new Error("Invalid syllabus format");
  }
}
