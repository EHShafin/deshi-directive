import mongoose from "mongoose";

export interface IReview extends mongoose.Document {
	from: mongoose.Types.ObjectId;
	to: mongoose.Types.ObjectId;
	rating: number;
	comment?: string;
	fromName?: string;
	fromProfilePicture?: string;
	createdAt: Date;
}

const ReviewSchema = new mongoose.Schema({
	from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	fromName: { type: String, trim: true },
	fromProfilePicture: { type: String, trim: true },
	to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	rating: { type: Number, required: true, min: 0, max: 5 },
	comment: { type: String, trim: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review ||
	mongoose.model<IReview>("Review", ReviewSchema);
