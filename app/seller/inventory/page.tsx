"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SellerNav from "@/components/seller/SellerNav";

export default function InventoryPage() {
	const [items, setItems] = useState<any[]>([]);

	const load = () =>
		fetch("/api/seller/inventory")
			.then((r) => r.json())
			.then((d) => setItems(d.items || []));
	useEffect(() => {
		load();
	}, []);

	const update = async (id: string, stock: number) => {
		await fetch("/api/seller/inventory", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ productId: id, stock: Number(stock) }),
		});
		load();
	};

	return (
		<div className="space-y-4">
			<SellerNav />
			<h1 className="text-xl font-semibold">Inventory</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{items.map((i) => (
					<Card key={i.id}>
						<CardHeader className="flex items-center justify-between flex-row">
							<CardTitle className="truncate">{i.name}</CardTitle>
							<div className="text-sm">${i.price}</div>
						</CardHeader>
						<CardContent className="space-y-3">
							{i.image ? (
								<img
									src={i.image}
									alt=""
									className="w-full h-40 object-cover rounded"
								/>
							) : (
								<div className="h-40 bg-muted rounded" />
							)}
							<div className="flex items-center gap-2">
								<Input
									type="number"
									className="w-28"
									defaultValue={i.stock}
									onChange={(e) => {
										i.stock = parseInt(
											e.target.value || "0"
										);
										setItems([...items]);
									}}
								/>
								<Button onClick={() => update(i.id, i.stock)}>
									Update
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
