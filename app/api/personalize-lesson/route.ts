import { NextRequest, NextResponse } from 'next/server';
import { personalizeModule } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { courseId, moduleIndex, feedback, language = 'English' } = await request.json();

        if (!courseId || moduleIndex === undefined || !feedback) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database connection not initialized' }, { status: 500 });
        }

        // 1. Fetch current course content
        const { data: course, error: fetchError } = await supabaseAdmin
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (fetchError || !course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const modules = course.jsonb_content.modules;
        if (!modules[moduleIndex]) {
            return NextResponse.json({ error: 'Module index out of bounds' }, { status: 400 });
        }

        const targetModule = modules[moduleIndex];

        // 2. Personalize with AI
        const newContent = await personalizeModule(
            targetModule.title,
            targetModule.content,
            feedback,
            language
        );

        // 3. Update the module in the JSONB object
        const updatedModules = [...modules];
        updatedModules[moduleIndex] = {
            ...targetModule,
            content: newContent
        };

        const updatedJsonb = {
            ...course.jsonb_content,
            modules: updatedModules
        };

        // 4. Save back to Supabase
        const { data: updatedCourse, error: updateError } = await supabaseAdmin
            .from('courses')
            .update({ jsonb_content: updatedJsonb })
            .eq('id', courseId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            updatedCourse
        });

    } catch (error: any) {
        console.error('Personalization API error:', error);
        return NextResponse.json(
            { error: 'Failed to personalize lesson', details: error.message },
            { status: 500 }
        );
    }
}
