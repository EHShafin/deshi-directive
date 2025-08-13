import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();

		const { id } = await params;
		const user = await User.findById(id).populate(
			"place",
			"name city state country"
		);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		console.error("User fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const body = await request.json();

		await dbConnect();

		const { id } = await params;
		const user = await User.findByIdAndUpdate(id, body, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "User updated successfully", user },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("User update error:", error);

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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await dbConnect();

		const { id } = await params;
		const user = await User.findByIdAndDelete(id);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "User deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("User deletion error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
