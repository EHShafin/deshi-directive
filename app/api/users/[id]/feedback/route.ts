import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import User from "@/models/User";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();
		// require authentication and only allow general users (newbie) to post feedback
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

		const authUser = await User.findById(decoded.userId).select("userType");
		if (!authUser || authUser.userType !== "newbie")
			return NextResponse.json(
				{ error: "Only general users can leave feedback" },
				{ status: 403 }
			);

		const { rating, comment } = await request.json();
		if (!rating)
			return NextResponse.json(
				{ error: "rating required" },
				{ status: 400 }
			);

		const { id } = await params;
		const doc = await Feedback.create({
			seller: id,
			rating,
			comment,
			user: decoded.userId,
		});
		return NextResponse.json({ id: doc._id }, { status: 201 });
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
