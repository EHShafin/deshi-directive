import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import TourRequest from "@/models/TourRequest";
import User from "@/models/User";

export async function GET() {
	try {
		await dbConnect();
		const list = await TourRequest.find()
			.sort({ createdAt: -1 })
			.limit(100)
			.populate("newbie veteran place", "name");
		return NextResponse.json({ requests: list });
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

		// require authentication and ensure requester is a newbie
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
				{ error: "Only general users can request tours" },
				{ status: 403 }
			);

		const {
			newbie,
			veteran,
			place,
			startTime,
			endTime,
			estimatePrice,
			newbieOffer,
		} = await request.json();
		if (!newbie || !place || !startTime || !endTime || !veteran)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);

		// validate veteran is a tour guide
		const vet = await User.findById(veteran).select("userType name");
		if (!vet || vet.userType !== "veteran")
			return NextResponse.json(
				{ error: "Target user is not a tour guide" },
				{ status: 400 }
			);

		const s = new Date(startTime);
		const e = new Date(endTime);
		if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s)
			return NextResponse.json(
				{ error: "Invalid start or end time" },
				{ status: 400 }
			);

		const tr = await TourRequest.create({
			newbie,
			veteran,
			place,
			startTime: s,
			endTime: e,
			estimatePrice,
			newbieOffer,
			offers: newbieOffer ? [{ who: "newbie", amount: newbieOffer }] : [],
		});

		return NextResponse.json({ tourRequest: tr }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
