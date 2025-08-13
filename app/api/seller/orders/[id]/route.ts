import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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
		const { status } = await request.json();
		const { id } = await params;
		const order = await Order.findOneAndUpdate(
			{ _id: id, seller: decoded.userId },
			{ $set: { status } },
			{ new: true }
		);
		if (!order)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ id: order._id, status: order.status });
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
