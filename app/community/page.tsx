import React from "react";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import Fundraiser from "@/models/Fundraiser";
import Review from "@/models/Review";

export default async function Page() {
	await dbConnect();

	const events = await Event.find({ isActive: true })
		.sort({ startDate: 1 })
		.limit(50)
		.lean();

	const fundraisers = await Fundraiser.find({ isActive: true })
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	const reviews = await Review.find()
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	return (
		<div style={{ padding: 20 }}>
			<h1>Community</h1>
			<section>
				<h2>Upcoming / Ongoing Events</h2>
				<ul>
					{events.map((e: any) => (
						<li key={e._id}>
							{e.title} -{" "}
							{new Date(e.startDate).toLocaleDateString()}
						</li>
					))}
				</ul>
			</section>
			<section>
				<h2>Fundraisers</h2>
				<ul>
					{fundraisers.map((f: any) => (
						<li key={f._id}>
							{f.title} - raised {f.raised} / {f.goal}
						</li>
					))}
				</ul>
			</section>
			<section>
				<h2>Recent Reviews</h2>
				<ul>
					{reviews.map((r: any) => (
						<li key={r._id}>
							{r.rating} stars - {r.comment}
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
