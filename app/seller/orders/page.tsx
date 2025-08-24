"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
	const [status, setStatus] = useState<string>("all");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = () => {
		setLoading(true);
		const q = status && status !== "all" ? `?status=${status}` : "";
		return fetch(`/api/seller/orders${q}`, {
			credentials: "include",
		})
			.then((r) => {
				if (r.status === 401) {
					setError("unauthorized");
					return { orders: [] };
				}
				return r.json();
			})
			.then((d) => setOrders(d.orders || []))
			.finally(() => setLoading(false));
	};
	useEffect(() => {
		load();
	}, [status]);

	const router = useRouter();

	useEffect(() => {
		if (error === "unauthorized") {
			router.push("/signin");
		}
	}, [error, router]);

	const update = async (id: string, newStatus: string) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/seller/orders/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
				credentials: "include",
			});
			if (res.status === 401) {
				setError("unauthorized");
				return;
			}
			await res.json();
			load();
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
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
							<SelectItem value="all">All</SelectItem>
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
							<div className="space-y-2">
								{o.items.map((it: any) => (
									<div
										key={String(it.product)}
										className="flex items-center gap-3 border rounded p-2"
									>
										<img
											src="/placeholder.svg"
											className="w-14 h-14 object-cover rounded"
											alt={it.name}
										/>
										<div className="flex-1">
											<div className="font-medium">
												{it.name}
											</div>
											<div className="text-sm text-muted-foreground">
												Quantity: {it.quantity} • Unit:
												${it.price}
											</div>
										</div>
										<div className="font-semibold">
											${it.price * it.quantity}
										</div>
									</div>
								))}
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
