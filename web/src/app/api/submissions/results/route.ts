import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "not implemented" }, { status: 501 });
}
