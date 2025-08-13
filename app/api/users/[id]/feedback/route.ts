import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();
		const { rating, comment } = await request.json();
		if (!rating)
			return NextResponse.json(
				{ error: "rating required" },
				{ status: 400 }
			);
		const { id } = await params;
		const doc = await Feedback.create({ seller: id, rating, comment });
		return NextResponse.json({ id: doc._id }, { status: 201 });
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
