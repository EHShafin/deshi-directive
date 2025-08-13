"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import SellerNav from "@/components/seller/SellerNav";

export default function OrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [status, setStatus] = useState<string>("");

	const load = () =>
		fetch(`/api/seller/orders${status ? `?status=${status}` : ""}`)
			.then((r) => r.json())
			.then((d) => setOrders(d.orders || []));
	useEffect(() => {
		load();
	}, [status]);

	const update = async (id: string, newStatus: string) => {
		await fetch(`/api/seller/orders/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		});
		load();
	};

	return (
		<div className="space-y-4">
			<SellerNav />
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Orders</h1>
				<div className="flex items-center gap-2">
					<span className="text-sm">Filter</span>
					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="All" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="shipped">Shipped</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-3">
				{orders.map((o) => (
					<Card key={o.id}>
						<CardHeader className="flex items-center justify-between flex-row">
							<CardTitle>Order #{o.id.slice(-6)}</CardTitle>
							<div className="text-sm text-muted-foreground">
								{new Date(o.createdAt).toLocaleString()}
							</div>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="text-sm">
									Items:{" "}
									{o.items.reduce(
										(a: any, i: any) => a + i.quantity,
										0
									)}
								</div>
								<div className="font-semibold">${o.total}</div>
							</div>
							<div className="flex flex-wrap gap-2">
								{(
									[
										"pending",
										"paid",
										"shipped",
										"completed",
										"cancelled",
									] as const
								).map((s) => (
									<Button
										key={s}
										size="sm"
										variant={
											o.status === s
												? "default"
												: "outline"
										}
										onClick={() => update(o.id, s)}
									>
										{s}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
