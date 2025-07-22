import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Place from "@/models/Place";

export async function GET(request: NextRequest) {
	try {
		await dbConnect();

		const places = await Place.find({ isActive: true })
			.select("_id name city state country image")
			.sort({ name: 1 });

		return NextResponse.json({ places }, { status: 200 });
	} catch (error) {
		console.error("Places fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch places" },
			{ status: 500 }
		);
	}
}
