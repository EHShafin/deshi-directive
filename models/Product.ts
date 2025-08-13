import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
	seller: mongoose.Types.ObjectId;
	name: string;
	description?: string;
	category?: string;
	price: number;
	images: string[];
	stock: number;
	isActive: boolean;
	createdAt: Date;
}

const ProductSchema = new mongoose.Schema({
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	name: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	category: { type: String, trim: true },
	price: { type: Number, required: true, min: 0 },
	images: { type: [String], default: [] },
	stock: { type: Number, required: true, min: 0, default: 0 },
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product ||
	mongoose.model<IProduct>("Product", ProductSchema);
