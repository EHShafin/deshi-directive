"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductPage() {
	const params = useParams() as any;
	const id = params?.id;
	const router = useRouter();
	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		let mounted = true;
		fetch(`/api/products/${id}`)
			.then((r) => r.json())
			.then((d) => {
				if (!mounted) return;
				setProduct(d.product || null);
			})
			.finally(() => mounted && setLoading(false));
		return () => {
			mounted = false;
		};
	}, [id]);

	if (loading) return <div className="p-4">Loading…</div>;
	if (!product) return <div className="p-4">Product not found</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<img
						src={
							(product.images && product.images[0]) ||
							"/placeholder.png"
						}
						alt={product.name}
						className="w-full h-96 object-cover rounded"
					/>
				</div>
				<div>
					<h1 className="text-2xl font-semibold">{product.name}</h1>
					<div className="text-lg font-medium mt-2">
						৳{product.price}
					</div>
					<div className="text-sm text-muted-foreground mt-2">
						{product.seller?.businessName || ""}
					</div>
					<div className="mt-4">
						<button
							className="btn btn-primary"
							onClick={() =>
								router.push(
									`/places/${product.place || ""}/products`
								)
							}
						>
							Buy from place
						</button>
					</div>
				</div>
			</div>
			<div className="mt-6">{product.description}</div>
		</div>
	);
}
