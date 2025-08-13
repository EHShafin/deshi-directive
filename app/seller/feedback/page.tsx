"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SellerNav from "@/components/seller/SellerNav";

export default function FeedbackPage() {
	const [data, setData] = useState<any>({ feedbacks: [], averageRating: 0 });
	useEffect(() => {
		fetch("/api/seller/feedback")
			.then((r) => r.json())
			.then(setData);
	}, []);

	return (
		<div className="space-y-4">
			<SellerNav />
			<h1 className="text-xl font-semibold">Customer Feedback</h1>
			<Card>
				<CardHeader>
					<CardTitle>Average Rating</CardTitle>
				</CardHeader>
				<CardContent className="text-2xl font-bold">
					{data.averageRating?.toFixed?.(1) || 0} ★
				</CardContent>
			</Card>
			<div className="grid gap-3">
				{data.feedbacks.map((f: any) => (
					<Card key={f.id}>
						<CardContent className="py-4">
							<div className="flex items-center justify-between">
								<span>
									{"★".repeat(f.rating)}
									{"☆".repeat(5 - f.rating)}
								</span>
								<span className="text-sm text-muted-foreground">
									{new Date(f.createdAt).toLocaleString()}
								</span>
							</div>
							{f.comment && (
								<div className="mt-2 text-sm">{f.comment}</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
