import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { encode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Place from "@/models/Place";

export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		// Ensure Place model is registered
		Place;

		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ email }).populate(
			"place",
			"name city state country"
		);
		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 400 }
			);
		}

		if (!user.isActive) {
			return NextResponse.json(
				{ error: "Account is deactivated. Please contact support." },
				{ status: 403 }
			);
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 400 }
			);
		}

		const token = await encode({
			token: { userId: user._id, userType: user.userType },
			secret: process.env.JWT_SECRET!,
		});

		const response = NextResponse.json(
			{
				message: "Login successful",
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					place: user.place,
					phone: user.phone,
					businessName: user.businessName,
					description: user.description,
				},
			},
			{ status: 200 }
		);

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
		});

		return response;
	} catch (error) {
		console.error("Signin error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
