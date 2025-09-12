import mongoose from "mongoose";

export type TourStatus =
	| "requested"
	| "offered"
	| "confirmed"
	| "completed"
	| "cancelled";

export interface ITourRequest extends mongoose.Document {
	newbie: mongoose.Types.ObjectId;
	veteran?: mongoose.Types.ObjectId;
	place: mongoose.Types.ObjectId;
	startTime: Date;
	endTime: Date;
	estimatePrice?: number;
	newbieOffer?: number;
	veteranOffer?: number;
	offers?: { who: "newbie" | "veteran"; amount: number; at: Date }[];
	status: TourStatus;
	createdAt: Date;
}

const TourRequestSchema = new mongoose.Schema({
	newbie: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	veteran: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	place: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Place",
		required: true,
	},
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	estimatePrice: { type: Number },
	newbieOffer: { type: Number },
	veteranOffer: { type: Number },
	offers: [
		{
			who: { type: String },
			amount: { type: Number },
			at: { type: Date, default: Date.now },
		},
	],
	status: {
		type: String,
		enum: ["requested", "offered", "confirmed", "completed", "cancelled"],
		default: "requested",
	},
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TourRequest ||
	mongoose.model<ITourRequest>("TourRequest", TourRequestSchema);
