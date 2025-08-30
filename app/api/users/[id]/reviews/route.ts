import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import { decode } from "next-auth/jwt";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();
		const { id } = await params;

		const reviews = await Review.find({ to: id })
			.sort({ createdAt: -1 })
			.lean();

		const payload = reviews.map((r: any) => ({
			id: r._id,
			from: r.from
				? {
						id: r.from,
						name: r.fromName || "Guest",
						profilePicture: r.fromProfilePicture || null,
				  }
				: null,
			rating: r.rating,
			comment: r.comment,
			createdAt: r.createdAt,
		}));

		return NextResponse.json({ reviews: payload }, { status: 200 });
	} catch (error) {
		console.error("Reviews GET error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();

		const { id } = await params;
		const body = await request.json();
		const { rating, comment } = body;

		// require rating
		if (typeof rating !== "number") {
			return NextResponse.json(
				{ error: "Rating is required" },
				{ status: 400 }
			);
		}

		// verify target user exists and is reviewable
		const target = await User.findById(id).select("userType");
		if (
			!target ||
			!["veteran", "local_shop", "restaurant"].includes(target.userType)
		) {
			return NextResponse.json(
				{ error: "User not available for reviews" },
				{ status: 400 }
			);
		}

		// determine 'from' user from token
		const token = request.cookies.get("token")?.value;
		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required to submit review" },
				{ status: 401 }
			);
		}

		const decoded = (await decode({
			token,
			secret: process.env.JWT_SECRET!,
		})) as { userId?: string } | null;
		if (!decoded?.userId) {
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);
		}

		const fromUser = await User.findById(decoded.userId).select("_id");
		if (!fromUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		// create review snapshotting reviewer's name/profilePicture
		const poster = await User.findById(fromUser._id).select(
			"name profilePicture"
		);
		const review = await Review.create({
			from: fromUser._id,
			fromName: poster?.name,
			fromProfilePicture: poster?.profilePicture,
			to: id,
			rating,
			comment,
		});

		return NextResponse.json({ reviewId: review._id }, { status: 201 });
	} catch (error) {
		console.error("Reviews POST error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
