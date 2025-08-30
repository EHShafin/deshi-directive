import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TourRequest from "@/models/TourRequest";
import Payment from "@/models/Payment";
import { decode } from "next-auth/jwt";

export async function GET(request: NextRequest, { params }: any) {
	try {
		await dbConnect();
		const paramsObj: any = await params;
		const id = paramsObj.id;
		const tr = await TourRequest.findById(id).populate(
			"newbie veteran place"
		);
		if (!tr)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ tourRequest: tr });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest, { params }: any) {
	try {
		await dbConnect();
		const paramsObj: any = await params;
		const id = paramsObj.id;
		const body = await request.json();
		const tr = await TourRequest.findById(id);
		if (!tr)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		// auth
		const token = request.cookies.get("token")?.value;
		const decoded = token
			? ((await decode({
					token,
					secret: process.env.JWT_SECRET!,
			  })) as any)
			: null;
		const meId = decoded?.userId;

		// restrict who can post offers
		if (body.veteranOffer !== undefined) {
			if (!meId || String(meId) !== String(tr.veteran)) {
				return NextResponse.json(
					{ error: "Unauthorized" },
					{ status: 403 }
				);
			}
			tr.veteranOffer = body.veteranOffer;
			tr.status = "offered";
			tr.offers = tr.offers || [];
			tr.offers.push({
				who: "veteran",
				amount: body.veteranOffer,
				at: new Date(),
			} as any);
		}
		if (body.newbieOffer !== undefined) {
			if (!meId || String(meId) !== String(tr.newbie)) {
				return NextResponse.json(
					{ error: "Unauthorized" },
					{ status: 403 }
				);
			}
			tr.newbieOffer = body.newbieOffer;
			tr.status = "offered";
			tr.offers = tr.offers || [];
			tr.offers.push({
				who: "newbie",
				amount: body.newbieOffer,
				at: new Date(),
			} as any);
		}
		if (body.status) tr.status = body.status;
		if (body.veteran) tr.veteran = body.veteran;
		await tr.save();
		return NextResponse.json({ tourRequest: tr });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest, { params }: any) {
	try {
		await dbConnect();
		const paramsObj: any = await params;
		const id = paramsObj.id;
		const { cardNumber, cardName, expiry, cvv, amount } =
			await request.json();
		if (
			!cardNumber ||
			!cardName ||
			!expiry ||
			!cvv ||
			typeof amount !== "number"
		)
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);
		if (!/^\d{16}$/.test(cardNumber))
			return NextResponse.json(
				{ error: "Card number must be 16 digits" },
				{ status: 400 }
			);
		if (!/^\d{3,4}$/.test(cvv))
			return NextResponse.json({ error: "Invalid cvv" }, { status: 400 });
		const tr = await TourRequest.findById(id);
		if (!tr)
			return NextResponse.json(
				{ error: "Tour request not found" },
				{ status: 404 }
			);
		const pay = await Payment.create({
			tourRequest: tr._id,
			cardNumber,
			cardName,
			expiry,
			cvv,
			amount,
		});
		// mark as completed (paid)
		tr.status = "completed";
		await tr.save();
		return NextResponse.json({ payment: pay, tourRequest: tr });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
