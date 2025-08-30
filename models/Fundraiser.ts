import mongoose from "mongoose";

export interface IFundraiser extends mongoose.Document {
	title: string;
	description?: string;
	goal: number;
	raised: number;
	isActive: boolean;
	createdAt: Date;
	creator: mongoose.Types.ObjectId;
	donations: Array<{
		user: mongoose.Types.ObjectId;
		amount: number;
		createdAt: Date;
	}>;
}

const FundraiserSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	goal: { type: Number, required: true, min: 0 },
	raised: { type: Number, default: 0, min: 0 },
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	donations: [
		{
			user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			amount: { type: Number, min: 0 },
			createdAt: { type: Date, default: Date.now },
		},
	],
});

export default mongoose.models.Fundraiser ||
	mongoose.model<IFundraiser>("Fundraiser", FundraiserSchema);
