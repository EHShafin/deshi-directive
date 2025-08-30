import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Fundraiser from "@/models/Fundraiser";
import User from "@/models/User";

export async function POST(request: NextRequest) {
	try {
		await dbConnect();
		const token = request.cookies.get("token")?.value;
		if (!token)
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);

		const decoded = (await decode({
			token,
			secret: process.env.JWT_SECRET!,
		})) as { userId: string };
		if (!decoded)
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);

		const { fundraiserId, amount } = await request.json();
		if (!fundraiserId || typeof amount !== "number" || amount <= 0)
			return NextResponse.json(
				{ error: "Missing or invalid fields" },
				{ status: 400 }
			);

		const user = await User.findById(decoded.userId);
		if (!user)
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);

		const f = await Fundraiser.findById(fundraiserId);
		if (!f)
			return NextResponse.json(
				{ error: "Fundraiser not found" },
				{ status: 404 }
			);

		f.raised = (f.raised || 0) + amount;
		f.donations = f.donations || [];
		f.donations.push({ user: user._id, amount });
		await f.save();

		return NextResponse.json({
			fundraiser: await Fundraiser.findById(f._id).populate(
				"creator",
				"name profilePicture"
			),
		});
	} catch (error) {
		console.error("Donate error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
