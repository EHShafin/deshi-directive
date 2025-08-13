import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
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

		const lowStock = parseInt(
			new URL(request.url).searchParams.get("low") || "5"
		);

		const products = await Product.find({ seller: decoded.userId })
			.select("name stock images price")
			.sort({ stock: 1 });

		return NextResponse.json({
			items: products.map((p) => ({
				id: p._id,
				name: p.name,
				stock: p.stock,
				price: p.price,
				image: p.images[0],
			})),
			lowStockThreshold: lowStock,
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
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
		const { productId, stock } = await request.json();
		if (!productId || stock === undefined)
			return NextResponse.json(
				{ error: "productId and stock required" },
				{ status: 400 }
			);

		const product = await Product.findOneAndUpdate(
			{ _id: productId, seller: decoded.userId },
			{ $set: { stock } },
			{ new: true }
		);
		if (!product)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ ok: true, stock: product.stock });
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
