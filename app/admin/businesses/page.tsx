"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Business {
	_id: string;
	name: string;
	email: string;
	userType: string;
	place?: { name: string; city: string; state: string };
	isActive: boolean;
}

export default function AdminBusinesses() {
	const [businesses, setBusinesses] = useState<Business[]>([]);

	useEffect(() => {
		fetch("/api/admin/businesses")
			.then((r) => r.json())
			.then((d) => setBusinesses(d.businesses || []));
	}, []);

	return (
		<AdminLayout>
			<div className="p-6 space-y-4">
				<div>
					<h1 className="text-2xl font-semibold">
						Business Management
					</h1>
					<p className="text-muted-foreground">
						Manage local shops and restaurants
					</p>
				</div>
				<div className="grid grid-cols-1 gap-3">
					{businesses.map((b) => (
						<Card key={b._id}>
							<CardHeader>
								<CardTitle>{b.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<div className="text-sm">{b.email}</div>
										<div className="text-xs text-muted-foreground">
											{b.place?.city}, {b.place?.state}
										</div>
									</div>
									<div>
										<Button
											size="sm"
											variant={
												b.isActive
													? "outline"
													: "default"
											}
										>
											{b.isActive ? "Active" : "Inactive"}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</AdminLayout>
	);
}
