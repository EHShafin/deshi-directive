import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Place from "@/models/Place";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

async function verifyAdmin(request: NextRequest) {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		return false;
	}

	try {
		const decoded = await decode({
			token,
			secret: process.env.JWT_SECRET!,
		});
		return decoded && decoded.userType === "admin";
	} catch {
		return false;
	}
}

export async function GET(request: NextRequest) {
	try {
		const isAdmin = await verifyAdmin(request);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const isActive = searchParams.get("isActive");

		const skip = (page - 1) * limit;

		let query: any = {};

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ city: { $regex: search, $options: "i" } },
				{ state: { $regex: search, $options: "i" } },
				{ country: { $regex: search, $options: "i" } },
			];
		}

		if (isActive !== null && isActive !== undefined && isActive !== "") {
			query.isActive = isActive === "true";
		}

		const [places, total] = await Promise.all([
			Place.find(query)
				.select(
					"_id name description city state country image isActive createdAt"
				)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit),
			Place.countDocuments(query),
		]);

		const totalPages = Math.ceil(total / limit);

		const stats = await Place.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					active: { $sum: { $cond: ["$isActive", 1, 0] } },
					inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
				},
			},
		]);

		return NextResponse.json({
			places,
			pagination: {
				currentPage: page,
				totalPages,
				total,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
			stats: stats[0] || { total: 0, active: 0, inactive: 0 },
		});
	} catch (error) {
		console.error("Admin places fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch places" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const isAdmin = await verifyAdmin(request);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await dbConnect();

		const body = await request.json();
		const { name, description, city, state, country, image, isActive } =
			body;

		if (!name || !description || !city || !state || !country) {
			return NextResponse.json(
				{ error: "All required fields must be provided" },
				{ status: 400 }
			);
		}

		const existingPlace = await Place.findOne({
			name: name.trim(),
			city: city.trim(),
			state: state.trim(),
		});

		if (existingPlace) {
			return NextResponse.json(
				{ error: "A place with this name already exists in this city" },
				{ status: 409 }
			);
		}

		const place = new Place({
			name: name.trim(),
			description: description.trim(),
			city: city.trim(),
			state: state.trim(),
			country: country.trim(),
			image: image || undefined,
			isActive: isActive !== undefined ? isActive : true,
		});

		await place.save();

		return NextResponse.json(
			{ message: "Place created successfully", place },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Admin place creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create place" },
			{ status: 500 }
		);
	}
}
