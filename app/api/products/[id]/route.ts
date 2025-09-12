import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		await dbConnect();
		const { id } = params;
		const p: any = await Product.findById(id)
			.populate("seller", "userType businessName")
			.lean();
		if (!p)
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({
			product: {
				id: p._id,
				_id: p._id,
				name: p.name,
				price: p.price,
				images: p.images,
				stock: p.stock,
				category: p.category,
				description: p.description,
				isActive: p.isActive,
				createdAt: p.createdAt,
				seller: p.seller
					? {
							id: p.seller._id || p.seller.id,
							userType: p.seller.userType,
							businessName: p.seller.businessName,
					  }
					: undefined,
			},
		});
	} catch (e) {
		return NextResponse.json({ error: "Failed" }, { status: 500 });
	}
}
