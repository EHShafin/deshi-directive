import mongoose from "mongoose";

export interface IPayment extends mongoose.Document {
	tourRequest: mongoose.Types.ObjectId;
	cardNumber: string;
	cardName: string;
	expiry: string;
	cvv: string;
	amount: number;
	createdAt: Date;
}

const PaymentSchema = new mongoose.Schema({
	tourRequest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "TourRequest",
		required: true,
		index: true,
	},
	cardNumber: { type: String, required: true },
	cardName: { type: String, required: true },
	expiry: { type: String, required: true },
	cvv: { type: String, required: true },
	amount: { type: Number, required: true, min: 0 },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment ||
	mongoose.model<IPayment>("Payment", PaymentSchema);
