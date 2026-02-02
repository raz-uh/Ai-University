import { GoogleGenerativeAI } from '@google/generative-ai';

export const getGeminiModel = () => {
  const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
};

export async function conductDiagnosticInterview(responses: string[], language: string = 'English') {
  const model = getGeminiModel();

  const prompt = `You are an adaptive learning AI. Based on these user responses to diagnostic questions:
  
${responses.map((r, i) => `${i + 1}. ${r}`).join('\n')}
  
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

export const personalizeModule = async (title: string, content: string, feedback: string, language: string) => {
  const model = getGeminiModel();
  const prompt = `You are an adaptive learning AI. A user is studying a module titled "${title}" with the following content:
  
"${content}"

The user has the following feedback/request for this specific module:
"${feedback}"

Your task is to REWRITE the content of this module to address the user's feedback while maintaining the educational value.
- If they want it simpler, use easier analogies.
- If they want more examples, provide them.
- If they are confused, explain the core concepts more clearly.

OUTPUT: Return ONLY the new content string. No JSON, no preamble, just the text.
The output MUST be in ${language}.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};
