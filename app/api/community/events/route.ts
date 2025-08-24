import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
	try {
		await dbConnect();
		const events = await Event.find({ isActive: true })
			.sort({ startDate: 1 })
			.limit(50);
		return NextResponse.json({ events });
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
		const { title, description, startDate, endDate, location } =
			await request.json();
		if (!title || !startDate)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);
		const event = await Event.create({
			title,
			description,
			startDate: new Date(startDate),
			endDate: endDate ? new Date(endDate) : undefined,
			location,
		});
		return NextResponse.json({ event }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
