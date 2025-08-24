import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(request: NextRequest) {
	try {
		await dbConnect();
		const { searchParams } = new URL(request.url);
		const place = searchParams.get("place");
		const q = searchParams.get("q");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "24");

		const query: any = { isActive: true };
		if (q)
			query.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ category: { $regex: q, $options: "i" } },
			];
		if (place) {
			const sellers = await User.find({ place: place }).select("_id");
			query.seller = { $in: sellers.map((s) => s._id) };
		}

		const products = await Product.find(query)
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit)
			.populate("seller", "userType businessName")
			.lean();

		const total = await Product.countDocuments(query);

		return NextResponse.json({
			products: products.map((p: any) => ({
				id: p._id,
				_id: p._id,
				name: p.name,
				price: p.price,
				images: p.images,
				stock: p.stock,
				category: p.category,
				isActive: p.isActive,
				createdAt: p.createdAt,
				seller: p.seller
					? {
							id: p.seller._id || p.seller.id,
							userType: p.seller.userType,
							businessName: p.seller.businessName,
					  }
					: undefined,
			})),
			total,
			currentPage: page,
			totalPages: Math.ceil(total / limit),
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
