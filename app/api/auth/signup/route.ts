import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { encode } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Place from "@/models/Place";

export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const {
			name,
			email,
			password,
			userType,
			place,
			phone,
			businessName,
			businessDescription,
			businessAddress,
			businessPhone,
			businessHours,
			description,
			profilePicture,
		} = await request.json();

		if (!name || !email || !password || !userType) {
			return NextResponse.json(
				{ error: "Name, email, password, and user type are required" },
				{ status: 400 }
			);
		}

		if (
			!["newbie", "veteran", "local_shop", "restaurant"].includes(
				userType
			)
		) {
			return NextResponse.json(
				{ error: "Invalid user type" },
				{ status: 400 }
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		if (["veteran", "local_shop", "restaurant"].includes(userType)) {
			if (!place) {
				return NextResponse.json(
					{ error: "Place selection is required for this user type" },
					{ status: 400 }
				);
			}
			if (!phone) {
				return NextResponse.json(
					{ error: "Phone number is required for this user type" },
					{ status: 400 }
				);
			}

			if (userType === "veteran") {
				if (!description || description.length < 10) {
					return NextResponse.json(
						{
							error: "Description must be at least 10 characters long",
						},
						{ status: 400 }
					);
				}
			}
		}

		if (["local_shop", "restaurant"].includes(userType)) {
			if (!businessName || businessName.length < 2) {
				return NextResponse.json(
					{
						error: "Business name must be at least 2 characters long",
					},
					{ status: 400 }
				);
			}

			if (!businessDescription || businessDescription.length < 10) {
				return NextResponse.json(
					{
						error: "Business description must be at least 10 characters long",
					},
					{ status: 400 }
				);
			}

			if (!businessAddress || businessAddress.length < 5) {
				return NextResponse.json(
					{
						error: "Business address must be at least 5 characters long",
					},
					{ status: 400 }
				);
			}

			if (!businessPhone || businessPhone.length < 10) {
				return NextResponse.json(
					{
						error: "Business phone must be at least 10 characters long",
					},
					{ status: 400 }
				);
			}

			if (!businessHours || businessHours.length < 5) {
				return NextResponse.json(
					{ error: "Business hours must be specified" },
					{ status: 400 }
				);
			}
		}

		if (place) {
			const placeExists = await Place.findById(place);
			if (!placeExists || !placeExists.isActive) {
				return NextResponse.json(
					{ error: "Invalid or inactive place selected" },
					{ status: 400 }
				);
			}
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json(
				{ error: "User already exists with this email" },
				{ status: 400 }
			);
		}

		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const userData: any = {
			name,
			email,
			password: hashedPassword,
			userType,
		};

		if (place) userData.place = place;
		if (phone) userData.phone = phone;
		if (businessName) userData.businessName = businessName;
		if (businessDescription)
			userData.businessDescription = businessDescription;
		if (businessAddress) userData.businessAddress = businessAddress;
		if (businessPhone) userData.businessPhone = businessPhone;
		if (businessHours) userData.businessHours = businessHours;
		if (description) userData.description = description;
		if (profilePicture) userData.profilePicture = profilePicture;

		const user = await User.create(userData);
		const populatedUser = await User.findById(user._id).populate(
			"place",
			"name city state country"
		);

		const token = await encode({
			token: { userId: user._id, userType: user.userType },
			secret: process.env.JWT_SECRET!,
		});

		const response = NextResponse.json(
			{
				message: "User created successfully",
				user: {
					id: populatedUser._id,
					name: populatedUser.name,
					email: populatedUser.email,
					userType: populatedUser.userType,
					place: populatedUser.place,
					phone: populatedUser.phone,
					businessName: populatedUser.businessName,
					businessDescription: populatedUser.businessDescription,
					businessAddress: populatedUser.businessAddress,
					businessPhone: populatedUser.businessPhone,
					businessHours: populatedUser.businessHours,
					description: populatedUser.description,
					profilePicture: populatedUser.profilePicture,
				},
			},
			{ status: 201 }
		);

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7,
		});

		return response;
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
