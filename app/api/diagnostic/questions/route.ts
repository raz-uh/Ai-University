import { NextRequest, NextResponse } from 'next/server';
import { generateFieldSpecificQuestions } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        const { topic, skillLevel, language = 'English' } = await request.json();

        if (!topic || !skillLevel) {
            return NextResponse.json({ error: 'Missing topic or skillLevel' }, { status: 400 });
        }

        const questions = await generateFieldSpecificQuestions(topic, skillLevel, language);

        return NextResponse.json({
            success: true,
            questions
        });

    } catch (error: any) {
        console.error('Diagnostic questions API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate specific questions', details: error.message },
            { status: 500 }
        );
    }
}
