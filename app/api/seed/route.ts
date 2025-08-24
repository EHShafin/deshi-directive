import { NextRequest, NextResponse } from "next/server";
import seedPlaces from "@/lib/seed";

export async function POST(request: NextRequest) {
	try {
		const result = await seedPlaces();

		if (result.success) {
			return NextResponse.json(
				{ message: result.message },
				{ status: 200 }
			);
		} else {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error("Seed API error:", error);
		return NextResponse.json(
			{ error: "Failed to seed data" },
			{ status: 500 }
		);
	}
    
}
