import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";

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

		const sellerId = new mongoose.Types.ObjectId(decoded.userId);

		const [ordersAgg, productsCount] = await Promise.all([
			Order.aggregate([
				{ $match: { seller: sellerId } },
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 },
						revenue: { $sum: "$total" },
					},
				},
			]),
			Product.countDocuments({ seller: sellerId }),
		]);

		const statusMap: any = {
			pending: 0,
			paid: 0,
			shipped: 0,
			completed: 0,
			cancelled: 0,
		};
		let revenue = 0;
		for (const row of ordersAgg) {
			statusMap[row._id] = row.count;
			revenue += row.revenue || 0;
		}

		return NextResponse.json({
			orders: statusMap,
			revenue,
			products: productsCount,
			feedback: { avgRating: 0, count: 0 },
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
