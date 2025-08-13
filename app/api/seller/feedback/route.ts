import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;
		if (!token)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		const decoded = (await decode({
			token,
			secret: process.env.JWT_SECRET!,
		})) as any;
		if (!decoded)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);

		await dbConnect();
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");

		const feedbacks = await Feedback.find({ seller: decoded.userId })
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit);

		const total = await Feedback.countDocuments({ seller: decoded.userId });
		const sellerId = new mongoose.Types.ObjectId(decoded.userId as string);
		const avg = await Feedback.aggregate([
			{ $match: { seller: sellerId } },
			{ $group: { _id: "$seller", avg: { $avg: "$rating" } } },
		]);

		return NextResponse.json({
			feedbacks: feedbacks.map((f) => ({
				id: f._id,
				rating: f.rating,
				comment: f.comment,
				createdAt: f.createdAt,
			})),
			total,
			averageRating: avg[0]?.avg || 0,
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
