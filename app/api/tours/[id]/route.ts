import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TourRequest from "@/models/TourRequest";
import Payment from "@/models/Payment";

export async function GET(request: NextRequest, { params }: any) {
	try {
		await dbConnect();
		const id = params.id;
		const tr = await TourRequest.findById(id).populate(
			"newbie veteran place review"
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
		const id = params.id;
		const body = await request.json();
		const tr = await TourRequest.findById(id);
		if (!tr)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		if (body.veteranOffer !== undefined) {
			tr.veteranOffer = body.veteranOffer;
			tr.status = "offered";
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
		const id = params.id;
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
		const p = await Payment.create({
			tourRequest: tr._id,
			cardNumber,
			cardName,
			expiry,
			cvv,
			amount,
		});
		tr.status = "confirmed";
		await tr.save();
		return NextResponse.json({ payment: p, tourRequest: tr });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
