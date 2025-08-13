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

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const isAdmin = await verifyAdmin(request);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await dbConnect();

		const { id } = await params;
		const place = await Place.findById(id);

		if (!place) {
			return NextResponse.json(
				{ error: "Place not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ place });
	} catch (error) {
		console.error("Admin place fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch place" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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

		const params_awaited = await params;

		const existingPlace = await Place.findOne({
			name: name.trim(),
			city: city.trim(),
			state: state.trim(),
			_id: { $ne: params_awaited.id },
		});

		if (existingPlace) {
			return NextResponse.json(
				{ error: "A place with this name already exists in this city" },
				{ status: 409 }
			);
		}

		const place = await Place.findByIdAndUpdate(
			params_awaited.id,
			{
				name: name.trim(),
				description: description.trim(),
				city: city.trim(),
				state: state.trim(),
				country: country.trim(),
				image: image || undefined,
				isActive: isActive !== undefined ? isActive : true,
			},
			{ new: true, runValidators: true }
		);

		if (!place) {
			return NextResponse.json(
				{ error: "Place not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Place updated successfully",
			place,
		});
	} catch (error) {
		console.error("Admin place update error:", error);
		return NextResponse.json(
			{ error: "Failed to update place" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const isAdmin = await verifyAdmin(request);
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await dbConnect();

		const { id } = await params;
		const place = await Place.findByIdAndDelete(id);

		if (!place) {
			return NextResponse.json(
				{ error: "Place not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: "Place deleted successfully",
		});
	} catch (error) {
		console.error("Admin place deletion error:", error);
		return NextResponse.json(
			{ error: "Failed to delete place" },
			{ status: 500 }
		);
	}
}
