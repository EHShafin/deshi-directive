"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SellerNav from "@/components/seller/SellerNav";

export default function SellerDashboard() {
	const { user, isLoading } = useAuth();
	const [stats, setStats] = useState<any>(null);

	useEffect(() => {
		if (!isLoading) {
			fetch("/api/seller/stats")
				.then((r) => r.json())
				.then(setStats)
				.catch(() => setStats(null));
		}
	}, [isLoading]);

	if (isLoading) return <div className="py-10 text-center">Loading...</div>;
	if (
		!user ||
		!(user.userType === "local_shop" || user.userType === "restaurant")
	)
		return null;

	return (
		<div className="space-y-6">
			<SellerNav />
			<h1 className="text-2xl font-semibold">Business Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Revenue</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">
						{stats?.revenue?.toFixed?.(2) || 0}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Products</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">
						{stats?.products || 0}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Orders</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">
						{(stats?.orders?.paid || 0) +
							(stats?.orders?.shipped || 0) +
							(stats?.orders?.completed || 0) +
							(stats?.orders?.pending || 0)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Rating</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">
						{(stats?.feedback?.avgRating || 0).toFixed?.(1)} ★
					</CardContent>
				</Card>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Order Status</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-4">
						{Object.entries(
							stats?.orders || {
								pending: 0,
								paid: 0,
								shipped: 0,
								completed: 0,
								cancelled: 0,
							}
						).map(([k, v]) => (
							<div
								key={k}
								className="p-3 border rounded-md flex items-center justify-between"
							>
								<span className="capitalize">{k}</span>
								<span className="font-semibold">
									{v as any}
								</span>
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Quick Links</CardTitle>
					</CardHeader>
					<CardContent className="flex gap-2 flex-wrap">
						<a href="/seller/products">
							<Button>Products</Button>
						</a>
						<a href="/seller/orders">
							<Button variant="outline">Orders</Button>
						</a>
						<a href="/seller/feedback">
							<Button variant="outline">Feedback</Button>
						</a>
						<a href="/seller/inventory">
							<Button variant="outline">Inventory</Button>
						</a>
						<a href="/seller/settings">
							<Button variant="outline">Shop Info</Button>
						</a>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
