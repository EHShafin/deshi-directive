"use client";
import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PaymentModal({
	open,
	onOpenChange,
	requestId,
	amount,
	onPaid,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	requestId: string | null;
	amount: number;
	onPaid?: (data?: any) => void;
}) {
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) {
			setCardNumber("");
			setCardName("");
			setExpiry("");
			setCvv("");
			setLoading(false);
		}
	}, [open]);

	async function submit(e: any) {
		e.preventDefault();
		if (!requestId) return;
		setLoading(true);
		const res = await fetch(`/api/tours/${requestId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cardNumber, cardName, expiry, cvv, amount }),
		});
		const d = await res.json();
		setLoading(false);
		if (res.ok && d.payment) {
			toast.success("Payment successful");
			onOpenChange(false);
			onPaid && onPaid(d);
			return;
		}
		toast.error(d.error || "Payment failed");
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Pay for request</DialogTitle>
				<form onSubmit={submit} className="space-y-3">
					<div>Amount: ৳{amount}</div>
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
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							Pay
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
