import { NextRequest, NextResponse } from 'next/server';
import { conductDiagnosticInterview, generateCourseSyllabus } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { responses, userId, language = 'English' } = body;

        if (!responses || !Array.isArray(responses) || responses.length !== 5) {
            return NextResponse.json(
                { error: 'Invalid responses. Expected array of 5 answers.' },
                { status: 400 }
            );
        }

        // Step 1: Conduct diagnostic interview
        const diagnosticResult = await conductDiagnosticInterview(responses, language);

        // Coerce skill level and style preference to match DB constraints
        const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        const validStyles = ['Video', 'PDF', 'Flashcards'];

        const skillLevel = validLevels.includes(diagnosticResult.skillLevel)
            ? diagnosticResult.skillLevel
            : 'Beginner';
        const stylePreference = validStyles.includes(diagnosticResult.stylePreference)
            ? diagnosticResult.stylePreference
            : 'Video';

        // Step 2: Generate course syllabi based on recommended topics
        const courses = [];

        for (const topic of diagnosticResult.recommendedTopics) {
            try {
                const syllabus = await generateCourseSyllabus(
                    topic,
                    skillLevel,
                    stylePreference,
                    language
                );

                // Step 3: Store course in Supabase
                if (userId && supabaseAdmin) {
                    const { data, error } = await supabaseAdmin
                        .from('courses')
                        .insert({
                            user_id: userId,
                            title: syllabus.title,
                            style_preference: stylePreference,
                            skill_level: skillLevel,
                            jsonb_content: syllabus,
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('Error saving course to DB:', error);
                        // Still push to array so user sees it even if save fails
                        courses.push(syllabus);
                    } else {
                        courses.push(data);
                    }
                } else {
                    courses.push(syllabus);
                }
            } catch (courseError) {
                console.error(`Error generating syllabus for topic ${topic}:`, courseError);
            }
        }

        return NextResponse.json({
            success: true,
            diagnostic: {
                ...diagnosticResult,
                skillLevel,
                stylePreference
            },
            courses,
        });
    } catch (error: any) {
        console.error('Diagnostic API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

