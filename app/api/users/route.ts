import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userType = searchParams.get("type");
		const search = searchParams.get("search");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "12");

		await dbConnect();

		const query: any = { isActive: true };

		if (userType && userType !== "all") {
			query.userType = userType;
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ businessName: { $regex: search, $options: "i" } },
			];
		}

		const users = await User.find(query)
			.select("name userType businessName place createdAt")
			.populate("place", "name city state country")
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await User.countDocuments(query);

		const publicUsers = users.map((user) => ({
			id: user._id,
			name: user.name,
			userType: user.userType,
			businessName: user.businessName,
			place: user.place,
			createdAt: user.createdAt,
		}));

		return NextResponse.json({
			users: publicUsers,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		console.error("Users fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
