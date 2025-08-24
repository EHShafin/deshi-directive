import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";

export async function GET() {
	try {
		await dbConnect();
		const list = await Fundraiser.find({ isActive: true })
			.sort({ createdAt: -1 })
			.limit(50);
		return NextResponse.json({ fundraisers: list });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await dbConnect();
		const { title, description, goal } = await request.json();
		if (!title || typeof goal !== "number")
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);
		const f = await Fundraiser.create({ title, description, goal });
		return NextResponse.json({ fundraiser: f }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
