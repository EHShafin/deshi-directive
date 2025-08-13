import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

async function auth(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	if (!token) return null;
	const decoded = (await decode({
		token,
		secret: process.env.JWT_SECRET!,
	})) as any;
	return decoded;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const decoded = await auth(request);
		if (!decoded)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		await dbConnect();
		const { id } = await params;
		const product = await Product.findOne({
			_id: id,
			seller: decoded.userId,
		});
		if (!product)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({
			product: {
				id: product._id,
				name: product.name,
				price: product.price,
				images: product.images,
				stock: product.stock,
				category: product.category,
				description: product.description,
				isActive: product.isActive,
			},
		});
	} catch {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const decoded = await auth(request);
		if (!decoded)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);

		await dbConnect();
		const body = await request.json();
		const { id } = await params;
		const product = await Product.findOneAndUpdate(
			{ _id: id, seller: decoded.userId },
			{ $set: body },
			{ new: true }
		);
		if (!product)
			return NextResponse.json({ error: "Not found" }, { status: 404 });

		return NextResponse.json({
			product: {
				id: product._id,
				name: product.name,
				price: product.price,
				images: product.images,
				stock: product.stock,
				category: product.category,
				description: product.description,
				isActive: product.isActive,
			},
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const decoded = await auth(request);
		if (!decoded)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		await dbConnect();
		const { id } = await params;
		const res = await Product.findOneAndDelete({
			_id: id,
			seller: decoded.userId,
		});
		if (!res)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ ok: true });
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
