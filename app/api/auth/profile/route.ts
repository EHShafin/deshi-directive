import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "No token provided" },
				{ status: 401 }
			);
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		await dbConnect();
		const user = await User.findById(decoded.userId);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const body = await request.json();
		const {
			name,
			phone,
			businessName,
			businessDescription,
			businessAddress,
			businessPhone,
			businessHours,
			description,
			currentPassword,
			newPassword,
		} = body;

		if (newPassword && currentPassword) {
			const validPassword = await bcrypt.compare(
				currentPassword,
				user.password
			);
			if (!validPassword) {
				return NextResponse.json(
					{ error: "Current password is incorrect" },
					{ status: 400 }
				);
			}
			const hashedPassword = await bcrypt.hash(newPassword, 12);
			user.password = hashedPassword;
		}

		if (name) user.name = name;
		if (phone !== undefined) user.phone = phone;
		if (businessName !== undefined) user.businessName = businessName;
		if (businessDescription !== undefined)
			user.businessDescription = businessDescription;
		if (businessAddress !== undefined)
			user.businessAddress = businessAddress;
		if (businessPhone !== undefined) user.businessPhone = businessPhone;
		if (businessHours !== undefined) user.businessHours = businessHours;
		if (description !== undefined) user.description = description;

		await user.save();

		const updatedUser = await User.findById(decoded.userId)
			.select("-password")
			.populate("place", "name city state country");

		return NextResponse.json(
			{
				user: {
					id: updatedUser._id,
					name: updatedUser.name,
					email: updatedUser.email,
					userType: updatedUser.userType,
					place: updatedUser.place,
					phone: updatedUser.phone,
					businessName: updatedUser.businessName,
					businessDescription: updatedUser.businessDescription,
					businessAddress: updatedUser.businessAddress,
					businessPhone: updatedUser.businessPhone,
					businessHours: updatedUser.businessHours,
					description: updatedUser.description,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Profile update error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
