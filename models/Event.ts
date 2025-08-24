import mongoose from "mongoose";

export interface IEvent extends mongoose.Document {
	title: string;
	description?: string;
	startDate: Date;
	endDate?: Date;
	location?: string;
	isActive: boolean;
	createdAt: Date;
}

const EventSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date },
	location: { type: String, trim: true },
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event ||
	mongoose.model<IEvent>("Event", EventSchema);
