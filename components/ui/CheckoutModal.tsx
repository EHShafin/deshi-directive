"use client";
import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CheckoutModal({
	open,
	onOpenChange,
	items,
	sellerId,
	onPaid,
}: any) {
	const [name, setName] = useState("");
	const [card, setCard] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) {
			setName("");
			setCard("");
			setLoading(false);
		}
	}, [open]);

	const total = (items || []).reduce(
		(s: number, it: any) => s + (it.price || 0) * (it.quantity || 1),
		0
	);

	const submit = async (e: any) => {
		e.preventDefault();
		if (!items || !items.length) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/orders`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: items.map((it: any) => ({
						productId: it.productId,
						quantity: it.quantity,
					})),
					payment: {
						success: true,
						method: "card",
						info: { name, card },
					},
				}),
			});
			const d = await res.json();
			setLoading(false);
			if (res.ok) {
				toast.success("Order placed and paid");
				onOpenChange(false);
				onPaid && onPaid(d);
			} else {
				toast.error(d.error || "Payment failed");
			}
		} catch (err) {
			setLoading(false);
			toast.error("Payment failed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Checkout</DialogTitle>
				<form onSubmit={submit} className="space-y-3">
					<div>Total: ৳{total}</div>
					<Input
						placeholder="Name on card"
						value={name}
						onChange={(e: any) => setName(e.target.value)}
					/>
					<Input
						placeholder="Card number"
						value={card}
						onChange={(e: any) => setCard(e.target.value)}
					/>
					<DialogFooter>
						<Button
							type="submit"
							disabled={loading || !items?.length}
						>
							Pay
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
