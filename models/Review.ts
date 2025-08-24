import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
	reviewer: mongoose.Types.ObjectId;
	targetUser?: mongoose.Types.ObjectId;
	place?: mongoose.Types.ObjectId;
	rating: number;
	comment?: string;
	createdAt: Date;
}

const ReviewSchema = new mongoose.Schema({
	reviewer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	place: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
	rating: { type: Number, required: true, min: 1, max: 5 },
	comment: { type: String, trim: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review ||
	mongoose.model<IReview>("Review", ReviewSchema);
