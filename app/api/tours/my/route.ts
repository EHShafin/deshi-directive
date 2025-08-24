import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import TourRequest from "@/models/TourRequest";

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
		const userId = decoded.userId;
		const requests = await TourRequest.find({
			$or: [{ newbie: userId }, { veteran: userId }],
		})
			.sort({ createdAt: -1 })
			.populate("newbie veteran place review", "name");

		return NextResponse.json({ requests });
	} catch (error) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
