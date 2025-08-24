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
	time: Date;
	estimatePrice?: number;
	newbieOffer?: number;
	veteranOffer?: number;
	status: TourStatus;
	review?: mongoose.Types.ObjectId;
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
	time: { type: Date, required: true },
	estimatePrice: { type: Number },
	newbieOffer: { type: Number },
	veteranOffer: { type: Number },
	status: {
		type: String,
		enum: ["requested", "offered", "confirmed", "completed", "cancelled"],
		default: "requested",
	},
	review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TourRequest ||
	mongoose.model<ITourRequest>("TourRequest", TourRequestSchema);
