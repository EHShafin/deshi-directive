import mongoose from "mongoose";

export type OrderStatus =
	| "pending"
	| "paid"
	| "shipped"
	| "completed"
	| "cancelled";

export interface IOrderItem {
	product: mongoose.Types.ObjectId;
	name: string;
	price: number;
	quantity: number;
}

export interface IOrder extends mongoose.Document {
	seller: mongoose.Types.ObjectId;
	user?: mongoose.Types.ObjectId;
	items: IOrderItem[];
	total: number;
	status: OrderStatus;
	createdAt: Date;
}

const OrderSchema = new mongoose.Schema({
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	items: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			name: { type: String, required: true },
			price: { type: Number, required: true, min: 0 },
			quantity: { type: Number, required: true, min: 1 },
		},
	],
	total: { type: Number, required: true, min: 0 },
	status: {
		type: String,
		enum: ["pending", "paid", "shipped", "completed", "cancelled"],
		default: "pending",
	},
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order ||
	mongoose.model<IOrder>("Order", OrderSchema);
