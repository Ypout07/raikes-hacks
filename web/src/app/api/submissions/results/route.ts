import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();

  const expectedKey = process.env.JUDGE_API_KEY || "DEMO_BYPASS_KEY_123";
  if (body.judge_api_key !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "completed",
      passed_tests: body.metrics.passed_tests,
      execution_time_seconds: body.metrics.execution_time_seconds,
      tokens_used: body.metrics.tokens_used,
    })
    .eq("id", body.submission_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
