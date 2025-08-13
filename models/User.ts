import mongoose from "mongoose";

export type UserType =
	| "newbie"
	| "veteran"
	| "local_admin"
	| "admin"
	| "local_shop"
	| "restaurant";

export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	password: string;
	userType: UserType;
	place?: mongoose.Types.ObjectId;
	phone?: string;
	businessName?: string;
	businessDescription?: string;
	businessAddress?: string;
	businessPhone?: string;
	businessHours?: string;
	description?: string;
	profilePicture?: string;
	isActive: boolean;
	createdAt: Date;
}

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Name is required"],
		trim: true,
		minLength: [2, "Name must be at least 2 characters long"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
		trim: true,
		lowercase: true,
		match: [
			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
			"Please enter a valid email",
		],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
		minLength: [6, "Password must be at least 6 characters long"],
	},
	userType: {
		type: String,
		required: [true, "User type is required"],
		enum: [
			"newbie",
			"veteran",
			"local_admin",
			"admin",
			"local_shop",
			"restaurant",
		],
		default: "newbie",
	},
	place: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Place",
		required: function (this: IUser) {
			return [
				"veteran",
				"local_admin",
				"local_shop",
				"restaurant",
			].includes(this.userType);
		},
	},
	phone: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["veteran", "local_shop", "restaurant"].includes(
				this.userType
			);
		},
	},
	businessName: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["local_shop", "restaurant"].includes(this.userType);
		},
		minLength: [2, "Business name must be at least 2 characters long"],
	},
	businessDescription: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["local_shop", "restaurant"].includes(this.userType);
		},
		minLength: [
			10,
			"Business description must be at least 10 characters long",
		],
	},
	businessAddress: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["local_shop", "restaurant"].includes(this.userType);
		},
		minLength: [5, "Business address must be at least 5 characters long"],
	},
	businessPhone: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["local_shop", "restaurant"].includes(this.userType);
		},
		minLength: [10, "Business phone must be at least 10 characters long"],
	},
	businessHours: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["local_shop", "restaurant"].includes(this.userType);
		},
		minLength: [5, "Business hours must be specified"],
	},
	description: {
		type: String,
		trim: true,
		required: function (this: IUser) {
			return ["veteran"].includes(this.userType);
		},
		minLength: [10, "Description must be at least 10 characters long"],
	},
	profilePicture: {
		type: String,
		default:
			"https://res.cloudinary.com/deshidirective/image/upload/v1/defaults/default-profile",
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.models.User ||
	mongoose.model<IUser>("User", UserSchema);
