import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json([
        submission_id: job.id,
        docker_image_tag: job.docker_image_tag,
        status: 'processing',
        api_key: process.env.GEMINI_API_KEY
    ]);
}
