import mongoose from "mongoose";

export interface IFeedback extends mongoose.Document {
	seller: mongoose.Types.ObjectId;
	user?: mongoose.Types.ObjectId;
	rating: number;
	comment?: string;
	createdAt: Date;
}

const FeedbackSchema = new mongoose.Schema({
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	rating: { type: Number, required: true, min: 1, max: 5 },
	comment: { type: String, trim: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback ||
	mongoose.model<IFeedback>("Feedback", FeedbackSchema);
