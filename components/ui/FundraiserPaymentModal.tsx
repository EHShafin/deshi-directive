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

export default function FundraiserPaymentModal({
	open,
	onOpenChange,
	fundraiserId,
	amount,
	onPaid,
}: {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	fundraiserId: string | null;
	amount: number;
	onPaid?: (data?: any) => void;
}) {
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [loading, setLoading] = useState(false);
	const [amountLocal, setAmountLocal] = useState<number>(amount || 0);

	useEffect(() => {
		if (!open) {
			setCardNumber("");
			setCardName("");
			setExpiry("");
			setCvv("");
			setLoading(false);
			setAmountLocal(amount || 0);
		}
	}, [open]);

	async function submit(e: any) {
		e.preventDefault();
		if (!fundraiserId) return;
		if (!amountLocal || amountLocal <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		setLoading(true);
		const res = await fetch(`/api/community/fundraisers/donate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ fundraiserId, amount: amountLocal }),
		});
		const d = await res.json();
		setLoading(false);
		if (res.ok && d.fundraiser) {
			toast.success("Donation successful");
			onOpenChange(false);
			onPaid && onPaid(d.fundraiser);
			return;
		}
		toast.error(d.error || "Donation failed");
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Donate</DialogTitle>
				<form onSubmit={submit} className="space-y-3">
					<div>Amount: ৳{amountLocal}</div>
					<Input
						type="number"
						placeholder="Amount"
						value={amountLocal as any}
						onChange={(e: any) =>
							setAmountLocal(Number(e.target.value))
						}
					/>
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
							Donate
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
