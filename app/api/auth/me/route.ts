import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const config = {
	runtime: "nodejs",
};

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "No token provided" },
				{ status: 401 }
			);
		}

		const decoded = (await decode({
			token,
			secret: process.env.JWT_SECRET!,
		})) as {
			userId: string;
		};

		if (!decoded) {
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);
		}

		await dbConnect();
		const user = await User.findById(decoded.userId)
			.select("-password")
			.populate("place", "name city state country");

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					place: user.place,
					phone: user.phone,
					businessName: user.businessName,
					businessDescription: user.businessDescription,
					businessAddress: user.businessAddress,
					businessPhone: user.businessPhone,
					businessHours: user.businessHours,
					description: user.description,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}
}
