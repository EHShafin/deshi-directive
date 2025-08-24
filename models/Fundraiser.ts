import mongoose from "mongoose";

export interface IFundraiser extends mongoose.Document {
	title: string;
	description?: string;
	goal: number;
	raised: number;
	isActive: boolean;
	createdAt: Date;
}

const FundraiserSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	goal: { type: Number, required: true, min: 0 },
	raised: { type: Number, default: 0, min: 0 },
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Fundraiser ||
	mongoose.model<IFundraiser>("Fundraiser", FundraiserSchema);
