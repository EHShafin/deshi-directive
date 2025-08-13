"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import SellerNav from "@/components/seller/SellerNav";

export default function ProductsPage() {
	const [products, setProducts] = useState<any[]>([]);
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [price, setPrice] = useState<number>(0);
	const [category, setCategory] = useState<string>("");
	const [stock, setStock] = useState<number>(0);
	const [images, setImages] = useState<any[]>([]);
	const [search, setSearch] = useState("");

	const load = () =>
		fetch(`/api/seller/products?search=${encodeURIComponent(search)}`)
			.then((r) => r.json())
			.then((d) => setProducts(d.products || []));
	useEffect(() => {
		load();
	}, []);

	const create = async () => {
		const res = await fetch("/api/seller/products", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name,
				price: Number(price),
				category,
				stock: Number(stock),
				images: images.map((i) => i.secure_url),
			}),
		});
		if (res.ok) {
			setOpen(false);
			setName("");
			setPrice(0);
			setCategory("");
			setStock(0);
			setImages([]);
			load();
		}
	};

	const remove = async (id: string) => {
		if (!confirm("Delete product?")) return;
		await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
		load();
	};

	return (
		<div className="space-y-4">
			<SellerNav />
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Products</h1>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Add Product</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Add New Product</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-1">
								<label
									htmlFor="product-name"
									className="text-sm font-medium"
								>
									Product Name
								</label>
								<Input
									id="product-name"
									placeholder="e.g., Handmade Mug"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<label
									htmlFor="product-category"
									className="text-sm font-medium"
								>
									Category
								</label>
								<Input
									id="product-category"
									placeholder="e.g., Kitchenware"
									value={category}
									onChange={(e) =>
										setCategory(e.target.value)
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1">
									<label
										htmlFor="product-price"
										className="text-sm font-medium"
									>
										Price
									</label>
									<Input
										id="product-price"
										type="number"
										placeholder="0.00"
										value={price}
										onChange={(e) =>
											setPrice(
												parseFloat(
													e.target.value || "0"
												)
											)
										}
									/>
								</div>
								<div className="space-y-1">
									<label
										htmlFor="product-stock"
										className="text-sm font-medium"
									>
										Stock
									</label>
									<Input
										id="product-stock"
										type="number"
										placeholder="0"
										value={stock}
										onChange={(e) =>
											setStock(
												parseInt(e.target.value || "0")
											)
										}
									/>
								</div>
							</div>
							<div className="space-y-1">
								<div className="text-sm font-medium">
									Images
								</div>
								<FileUpload
									value={images}
									onChange={setImages}
									folder="deshi_directive/products"
									maxFiles={5}
								/>
							</div>
							<Button onClick={create}>Create</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
			<div className="flex gap-2">
				<Input
					placeholder="Search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Button variant="outline" onClick={load}>
					Search
				</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{products.map((p) => (
					<Card key={p.id}>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="truncate">{p.name}</CardTitle>
							<div className="flex gap-2">
								<a href={`/seller/products/${p.id}`}>
									<Button size="sm" variant="outline">
										Edit
									</Button>
								</a>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => remove(p.id)}
								>
									Delete
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{p.images?.[0] ? (
								<img
									src={p.images[0]}
									alt=""
									className="w-full h-40 object-cover rounded"
								/>
							) : (
								<div className="h-40 bg-muted rounded" />
							)}
							<div className="mt-3 flex items-center justify-between">
								<span className="font-semibold">
									${p.price}
								</span>
								<span className="text-sm text-muted-foreground">
									Stock: {p.stock}
								</span>
							</div>
							<div className="text-sm text-muted-foreground mt-1">
								{p.category}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
