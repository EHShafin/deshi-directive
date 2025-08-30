"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PayPage() {
	const params = useParams();
	const id = params?.id;
	const router = useRouter();
	const [tr, setTr] = useState<any>(null);
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");

	useEffect(() => {
		if (!id) return;
		fetch(`/api/tours/${id}`)
			.then((r) => r.json())
			.then((d) => setTr(d.tourRequest || null));
	}, [id]);

	const amount =
		tr?.veteranOffer ?? tr?.newbieOffer ?? tr?.estimatePrice ?? 0;

	async function submit(e: any) {
		e.preventDefault();
		const res = await fetch(`/api/tours/${id}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cardNumber, cardName, expiry, cvv, amount }),
		});
		const d = await res.json();
		if (res.ok && d.payment) {
			toast.success("Payment successful");
			router.push("/profile/orders");
			return;
		}
		toast.error(d.error || "Payment failed");
	}

	if (!tr) return <div className="p-4">Loading…</div>;

	return (
		<div className="p-4 max-w-lg mx-auto">
			<h1 className="text-2xl font-semibold mb-4">
				Pay for Tour Request
			</h1>
			<div className="mb-4">
				<div className="font-medium">
					Place: {tr.place?.name || "Place"}
				</div>
				<div className="text-sm text-muted-foreground">{`${new Date(
					tr.startTime
				).toLocaleString()} - ${new Date(
					tr.endTime
				).toLocaleString()}`}</div>
				<div className="mt-2">Amount: ৳{amount}</div>
			</div>
			<form onSubmit={submit} className="space-y-3">
				<Input
					placeholder="Card Number (16 digits)"
					value={cardNumber}
					onChange={(e: any) => setCardNumber(e.target.value)}
				/>
				<Input
					placeholder="Name on Card"
					value={cardName}
					onChange={(e: any) => setCardName(e.target.value)}
				/>
				<Input
					placeholder="MM/YY"
					value={expiry}
					onChange={(e: any) => setExpiry(e.target.value)}
				/>
				<Input
					placeholder="CVV"
					value={cvv}
					onChange={(e: any) => setCvv(e.target.value)}
				/>
				<Button type="submit">Pay</Button>
			</form>
		</div>
	);
}
