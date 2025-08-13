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
		const user = await User.findById(id)
			.select("-password -email")
			.populate("place", "name city state country");

		if (!user || !user.isActive) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const publicProfile = {
			id: user._id,
			name: user.name,
			userType: user.userType,
			place: user.place,
			phone: user.phone,
			businessName: user.businessName,
			businessDescription: user.businessDescription,
			businessAddress: user.businessAddress,
			businessPhone: user.businessPhone,
			businessHours: user.businessHours,
			description: user.description,
			createdAt: user.createdAt,
		};

		if (user.userType === "newbie") {
			return NextResponse.json({
				user: {
					id: publicProfile.id,
					name: publicProfile.name,
					userType: publicProfile.userType,
					place: publicProfile.place,
					createdAt: publicProfile.createdAt,
				},
			});
		}

		return NextResponse.json({ user: publicProfile }, { status: 200 });
	} catch (error) {
		console.error("Profile fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
