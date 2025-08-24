"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id;
	const { user } = useAuth();
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!id) return;
		fetchProducts();
	}, [id]);

	const fetchProducts = async () => {
		setLoading(true);
		const res = await fetch(`/api/products?place=${id}`);
		const data = await res.json();
		setProducts(data.products || []);
		setLoading(false);
	};

	const buy = async (p: any) => {
		addToCart(p, 1);
	};

	const [cart, setCart] = useState<any[]>([]);
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [payInfo, setPayInfo] = useState({ card: "", name: "" });

	const addToCart = (p: any, qty = 1) => {
		const sellerIds = cart.map((c) => String(c.seller));
		if (sellerIds.length && sellerIds[0] !== String(p.seller)) return;
		const existing = cart.find(
			(c) => String(c.productId || c._id) === String(p._id || p.id)
		);
		if (existing) {
			setCart(
				cart.map((c) =>
					String(c.productId || c._id) === String(p._id || p.id)
						? { ...c, quantity: c.quantity + qty }
						: c
				)
			);
		} else {
			setCart([
				...cart,
				{
					productId: p._id || p.id,
					name: p.name,
					price: p.price,
					quantity: qty,
					seller: p.seller,
				},
			]);
		}
	};

	const isCustomer =
		!!user && (user.userType === "newbie" || user.userType === "veteran");

	const checkout = async () => {
		if (!isCustomer) {
			// Redirect unauthenticated or non-customer users to sign in or show a message
			router.push("/signin");
			return;
		}

		const res = await fetch(`/api/orders`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				items: cart.map((c) => ({
					productId: c.productId,
					quantity: c.quantity,
				})),
				payment: { success: true, method: "card", info: payInfo },
			}),
		});
		if (res.ok) {
			setCart([]);
			setCheckoutOpen(false);
			// Only customers should see their orders
			router.push("/profile/orders");
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-semibold">Products</h1>
			{loading && <div>Loading…</div>}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
				{products.map((p: any) => {
					const sellerType = p.seller?.userType;
					const isRestaurant = sellerType === "restaurant";
					const isShop = sellerType === "local_shop";
					const cardClass = isRestaurant
						? "border-2 border-amber-400"
						: isShop
						? "border-2 border-emerald-400"
						: "border rounded";
					return (
						<div
							key={p._id || p.id}
							className={`${cardClass} rounded p-3`}
						>
							<img
								src={
									(p.images && p.images[0]) ||
									"/placeholder.png"
								}
								alt={p.name}
								className="w-full h-40 object-cover mb-2"
							/>
							<div className="flex items-center justify-between">
								<h3 className="font-semibold">{p.name}</h3>
								<div
									className="text-xs px-2 py-0.5 rounded text-white"
									style={{
										background: isRestaurant
											? "#f97316"
											: isShop
											? "#16a34a"
											: "#6b7280",
									}}
								>
									{isRestaurant
										? "Food"
										: isShop
										? "Shop"
										: "Item"}
								</div>
							</div>
							<div className="text-sm text-muted-foreground">
								{p.category}
							</div>
							<div className="mt-2 font-medium">৳{p.price}</div>
							<div className="text-xs text-muted-foreground">
								{p.seller?.businessName || ""}
							</div>
							<div className="mt-3 flex gap-2">
								<button
									className="btn"
									onClick={() => addToCart(p, 1)}
								>
									Add to cart
								</button>
								<button
									className="btn btn-primary"
									onClick={() => {
										addToCart(p, 1);
										if (isCustomer) {
											setCheckoutOpen(true);
										} else {
											router.push("/signin");
										}
									}}
								>
									Buy now
								</button>
							</div>
						</div>
					);
				})}
			</div>

			<div className="fixed bottom-4 right-4 w-80 bg-white border rounded p-3">
				<div className="flex justify-between items-center">
					<div className="font-semibold">Cart ({cart.length})</div>
					<div className="text-sm">
						Total: ৳
						{cart.reduce(
							(s: number, c: any) => s + c.price * c.quantity,
							0
						)}
					</div>
				</div>
				<div className="mt-2 space-y-2">
					{cart.map((c: any) => (
						<div key={c.productId} className="flex justify-between">
							<div>
								{c.name} x {c.quantity}
							</div>
							<div>৳{c.price * c.quantity}</div>
						</div>
					))}
				</div>
				<div className="mt-3 flex gap-2">
					<button className="btn" onClick={() => setCart([])}>
						Clear
					</button>
					<button
						className="btn btn-primary"
						onClick={() => setCheckoutOpen(true)}
						disabled={!cart.length}
					>
						Checkout
					</button>
				</div>
			</div>

			{checkoutOpen && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center">
					<div className="bg-white p-6 rounded w-96">
						<h3 className="text-lg font-semibold">Checkout</h3>
						<div className="mt-3">
							<label className="block">Name</label>
							<input
								placeholder="Name on card"
								className="w-full border rounded p-2"
								value={payInfo.name}
								onChange={(e) =>
									setPayInfo({
										...payInfo,
										name: e.target.value,
									})
								}
							/>
						</div>
						<div className="mt-3">
							<label className="block">Card</label>
							<input
								placeholder="Card number"
								className="w-full border rounded p-2"
								value={payInfo.card}
								onChange={(e) =>
									setPayInfo({
										...payInfo,
										card: e.target.value,
									})
								}
							/>
						</div>
						<div className="mt-4 flex gap-2 justify-end">
							<button
								className="btn"
								onClick={() => setCheckoutOpen(false)}
							>
								Cancel
							</button>
							<button
								className="btn btn-primary"
								onClick={() => checkout()}
							>
								Pay
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
