import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userType = searchParams.get("userType");
		const search = searchParams.get("search");
		const isActive = searchParams.get("isActive");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		await dbConnect();

		const query: any = {};

		if (userType && userType !== "all") {
			query.userType = userType;
		}

		if (isActive && isActive !== "all") {
			query.isActive = isActive === "true";
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ businessName: { $regex: search, $options: "i" } },
			];
		}

		const users = await User.find(query)
			.populate("place", "name city state")
			.sort({ createdAt: -1 })
			.limit(limit)
			.skip((page - 1) * limit);

		const total = await User.countDocuments(query);
		const active = await User.countDocuments({ ...query, isActive: true });
		const inactive = await User.countDocuments({
			...query,
			isActive: false,
		});

		return NextResponse.json({
			users: users.map((user) => ({
				_id: user._id,
				name: user.name,
				email: user.email,
				userType: user.userType,
				place: user.place,
				phone: user.phone,
				businessName: user.businessName,
				isActive: user.isActive,
				createdAt: user.createdAt,
			})),
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				total,
				hasNext: page * limit < total,
				hasPrev: page > 1,
			},
			stats: {
				total,
				active,
				inactive,
			},
		});
	} catch (error) {
		console.error("Admin users fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		await dbConnect();

		const user = new User(body);
		await user.save();

		return NextResponse.json(
			{ message: "User created successfully", user },
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("User creation error:", error);

		if (error.code === 11000) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 }
		);
	}
}
