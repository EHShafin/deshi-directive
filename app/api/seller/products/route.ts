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

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");

		const query: any = { seller: decoded.userId };
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		const products = await Product.find(query)
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit);

		const total = await Product.countDocuments(query);

		return NextResponse.json({
			products: products.map((p) => ({
				id: p._id,
				name: p.name,
				price: p.price,
				images: p.images,
				stock: p.stock,
				category: p.category,
				isActive: p.isActive,
				createdAt: p.createdAt,
			})),
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
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
		const {
			name,
			description,
			category,
			price,
			images = [],
			stock = 0,
		} = body;

		if (!name || price === undefined) {
			return NextResponse.json(
				{ error: "Name and price are required" },
				{ status: 400 }
			);
		}

		const product = await Product.create({
			seller: decoded.userId,
			name,
			description,
			category,
			price,
			images,
			stock,
		});

		return NextResponse.json(
			{
				product: {
					id: product._id,
					name: product.name,
					price: product.price,
					images: product.images,
					stock: product.stock,
					category: product.category,
				},
			},
			{ status: 201 }
		);
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
