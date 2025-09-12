"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		fetch(`/api/products?limit=48`)
			.then((r) => r.json())
			.then((d) => {
				if (!mounted) return;
				setProducts(d.products || []);
			})
			.finally(() => mounted && setLoading(false));
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold">Products</h1>
			{loading && <div>Loading…</div>}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
				{products.map((p) => (
					<Link
						key={p._id || p.id}
						href={`/products/${p._id || p.id}`}
						className="block border rounded overflow-hidden"
					>
						<img
							src={
								(p.images && p.images[0]) || "/placeholder.png"
							}
							alt={p.name}
							className="w-full h-40 object-cover"
						/>
						<div className="p-3">
							<div className="font-semibold">{p.name}</div>
							<div className="text-sm text-muted-foreground">
								৳{p.price}
							</div>
							<div className="text-xs text-muted-foreground">
								{p.seller?.businessName || ""}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
