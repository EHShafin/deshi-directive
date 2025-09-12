import { NextResponse } from "next/server";

// Reviews have been removed from the application. Keep this route returning
// 410 Gone so any existing callers fail fast and can be cleaned up.

export async function GET() {
	return NextResponse.json({ error: "Reviews removed" }, { status: 410 });
}

export async function POST() {
	return NextResponse.json({ error: "Reviews removed" }, { status: 410 });
}
