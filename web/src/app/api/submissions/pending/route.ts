import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Disable Vercel caching
export const dynamic = "force-dynamic";

export async function GET() {
  const { data: job, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { message: "No pending submissions" },
      { status: 404 },
    );
  }

  await supabase
    .from("submissions")
    .update({ status: "processing" })
    .eq("id", job.id);

  return NextResponse.json({
    submission_id: job.id,
    docker_image_tag: job.docker_image_tag,
    status: "processing",
    api_key: process.env.GEMINI_API_KEY,
  });
}
