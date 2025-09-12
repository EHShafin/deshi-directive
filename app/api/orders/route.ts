import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

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
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");

		const query: any = { user: decoded.userId };

		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit)
			.populate("seller", "userType businessName name")
			.lean();

		const total = await Order.countDocuments(query);

		return NextResponse.json({
			orders,
			total,
			currentPage: page,
			totalPages: Math.ceil(total / limit),
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
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
		const body = await request.json();
		const { items } = body;
		if (!items || !Array.isArray(items) || items.length === 0)
			return NextResponse.json(
				{ error: "Invalid items" },
				{ status: 400 }
			);

		const productIds = items.map((it: any) => it.productId);
		const products = await Product.find({
			_id: { $in: productIds },
		}).lean();
		const itemsResolved = items.map((it: any) => {
			const p = products.find(
				(pp: any) => String(pp._id) === String(it.productId)
			);
			if (!p) throw new Error("Product not found");
			return {
				product: p._id,
				name: p.name,
				price: p.price,
				quantity: Number(it.quantity || 1),
				seller: p.seller,
			};
		});

		const sellers = Array.from(
			new Set(itemsResolved.map((it: any) => String(it.seller)))
		);
		if (sellers.length > 1)
			return NextResponse.json(
				{ error: "Multiple sellers in cart not supported" },
				{ status: 400 }
			);

		const total = itemsResolved.reduce(
			(s: number, it: any) => s + it.price * it.quantity,
			0
		);

		const sellerId = sellers[0];

		const payment = (body as any).payment;
		const status = payment ? "paid" : "pending";

		const order = await Order.create({
			seller: sellerId,
			user: decoded.userId,
			items: itemsResolved.map(({ seller, ...rest }: any) => rest),
			total,
			status,
		});

		return NextResponse.json(
			{ orderId: order._id, status: order.status },
			{ status: 201 }
		);
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
