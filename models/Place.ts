import mongoose from "mongoose";

export interface IPlace extends mongoose.Document {
	name: string;
	description: string;
	country: string;
	state: string;
	city: string;
	image: string;
	isActive: boolean;
	createdAt: Date;
}

const PlaceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Place name is required"],
		trim: true,
		minLength: [2, "Place name must be at least 2 characters long"],
	},
	description: {
		type: String,
		required: [true, "Description is required"],
		trim: true,
		minLength: [10, "Description must be at least 10 characters long"],
	},
	country: {
		type: String,
		required: [true, "Country is required"],
		trim: true,
	},
	state: {
		type: String,
		required: [true, "State is required"],
		trim: true,
	},
	city: {
		type: String,
		required: [true, "City is required"],
		trim: true,
	},
	image: {
		type: String,
		default:
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
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

PlaceSchema.index({ name: 1, city: 1, state: 1 }, { unique: true });

export default mongoose.models.Place ||
	mongoose.model<IPlace>("Place", PlaceSchema);
