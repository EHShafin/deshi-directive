import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import User from "@/models/User";

export async function GET() {
	try {
		await dbConnect();
		const reviews = await Review.find()
			.sort({ createdAt: -1 })
			.limit(50)
			.populate("reviewer targetUser place", "name email");
		return NextResponse.json({ reviews });
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
		const { reviewer, targetUser, place, rating, comment } =
			await request.json();
		if (!reviewer || !rating)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);
		if (rating < 1 || rating > 5)
			return NextResponse.json(
				{ error: "Invalid rating" },
				{ status: 400 }
			);
		const review = await Review.create({
			reviewer,
			targetUser,
			place,
			rating,
			comment,
		});
		return NextResponse.json({ review }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
