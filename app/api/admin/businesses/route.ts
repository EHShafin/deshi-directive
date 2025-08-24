import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
	try {
		await dbConnect();
		const businesses = await User.find({
			userType: { $in: ["local_shop", "restaurant"] },
		})
			.select("name email userType isActive place")
			.populate("place", "city state name");
		return NextResponse.json({ businesses });
	} catch (error) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
