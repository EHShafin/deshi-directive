"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		fetchOrders();
	}, []);

	const fetchOrders = async () => {
		setLoading(true);
		const res = await fetch("/api/orders");
		if (!res.ok) {
			setLoading(false);
			return;
		}
		const data = await res.json();
		setOrders(data.orders || []);
		setLoading(false);
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-semibold">My Orders</h1>
			{loading && <div>Loading…</div>}
			<div className="space-y-4 mt-4">
				{orders.map((o: any) => (
					<div key={o._id || o.id} className="border rounded p-3">
						<div className="flex justify-between">
							<div>
								Order #{(o._id || o.id).toString().slice(-6)}
							</div>
							<div>{o.status}</div>
						</div>
						<div className="mt-2 space-y-2">
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
											Quantity: {it.quantity} • Unit: ৳
											{it.price}
										</div>
									</div>
									<div className="font-semibold">
										৳{it.price * it.quantity}
									</div>
								</div>
							))}
						</div>
						<div className="mt-2 font-semibold">
							Total: ৳{o.total}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
