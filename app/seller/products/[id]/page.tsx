"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export default function EditProductPage() {
	const { id } = useParams<{ id: string }>() as any;
	const router = useRouter();
	const [data, setData] = useState<any>({
		name: "",
		price: 0,
		category: "",
		stock: 0,
		images: [],
	});

	useEffect(() => {
		fetch(`/api/seller/products/${id}`)
			.then((r) => r.json())
			.then((d) => setData(d.product));
	}, [id]);

	const save = async () => {
		await fetch(`/api/seller/products/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: data.name,
				price: Number(data.price),
				category: data.category,
				stock: Number(data.stock),
				images: data.images,
			}),
		});
		router.push("/seller/products");
	};

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-semibold">Edit Product</h1>
			<div className="grid gap-3 max-w-lg">
				<Input
					placeholder="Name"
					value={data.name}
					onChange={(e) => setData({ ...data, name: e.target.value })}
				/>
				<Input
					placeholder="Category"
					value={data.category}
					onChange={(e) =>
						setData({ ...data, category: e.target.value })
					}
				/>
				<Input
					type="number"
					placeholder="Price"
					value={data.price}
					onChange={(e) =>
						setData({
							...data,
							price: parseFloat(e.target.value || "0"),
						})
					}
				/>
				<Input
					type="number"
					placeholder="Stock"
					value={data.stock}
					onChange={(e) =>
						setData({
							...data,
							stock: parseInt(e.target.value || "0"),
						})
					}
				/>
				<FileUpload
					value={(data.images || []).map((url: string) => ({
						public_id: url,
						secure_url: url,
						bytes: 0,
					}))}
					onChange={(files) =>
						setData({
							...data,
							images: files.map((f: any) => f.secure_url),
						})
					}
					folder="deshi_directive/products"
					maxFiles={5}
				/>
				<div className="flex gap-2">
					<Button onClick={save}>Save</Button>
					<Button variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);
}
