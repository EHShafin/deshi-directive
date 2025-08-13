import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

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
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");

		const query: any = { seller: decoded.userId };
		if (status) query.status = status;

		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit);

		const total = await Order.countDocuments(query);

		return NextResponse.json({
			orders: orders.map((o) => ({
				id: o._id,
				total: o.total,
				status: o.status,
				createdAt: o.createdAt,
				items: o.items,
			})),
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
