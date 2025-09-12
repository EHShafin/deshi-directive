import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";

export async function GET() {
	try {
		await dbConnect();
		const events = await Event.find({ isActive: true })
			.sort({ startDate: 1 })
			.limit(50)
			.populate("creator", "name profilePicture");
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
		const token = request.cookies.get("token")?.value;
		if (!token)
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);

		const decoded = (await decode({
			token,
			secret: process.env.JWT_SECRET!,
		})) as {
			userId: string;
		};
		if (!decoded)
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);

		const { title, description, startDate, endDate, location } =
			await request.json();
		if (!title || !startDate)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);

		const creator = await User.findById(decoded.userId);
		if (!creator)
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);

		const event = await Event.create({
			title,
			description,
			startDate: new Date(startDate),
			endDate: endDate ? new Date(endDate) : undefined,
			location,
			creator: creator._id,
		});
		const populated = await Event.findById(event._id).populate(
			"creator",
			"name profilePicture"
		);
		return NextResponse.json({ event: populated }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
