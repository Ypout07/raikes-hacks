import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// The exact string matching the 'demoJudgeKey' in your Go CLI's client.go file
const EXPECTED_JUDGE_KEY = process.env.JUDGE_API_KEY || "DEMO_BYPASS_KEY_123";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.judge_api_key !== EXPECTED_JUDGE_KEY) {
      console.warn("Unauthorized attempt to write metrics.");
      return NextResponse.json(
        { error: "Unauthorized payload" },
        { status: 401 },
      );
    }

    const { submission_id, metrics } = body;

    if (!submission_id || !metrics) {
      return NextResponse.json(
        { error: "Malformed payload from orchestrator" },
        { status: 400 },
      );
    }

    // We change the status from 'processing' to 'completed' so it leaves the queue forever
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "completed",
        passed_tests: metrics.passed_tests,
        execution_time_seconds: metrics.execution_time_seconds,
        tokens_used: metrics.tokens_used,
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Supabase update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to save results to database" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Fatal error in results endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
