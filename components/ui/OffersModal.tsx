"use client";

import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OffersModal({
	open,
	onOpenChange,
	request,
	currentUser,
	onUpdated,
}: any) {
	const [offerValue, setOfferValue] = useState(0);
	useEffect(() => {
		setOfferValue(0);
	}, [request, open]);

	if (!request) return null;

	const lastOffer = (request.offers || []).slice(-1)[0];
	const lastWho = lastOffer ? lastOffer.who : null;
	const isNewbie = String(currentUser?.id) === String(request.newbie?._id);
	const isVeteran = String(currentUser?.id) === String(request.veteran?._id);

	const actionable =
		request.status === "requested" || request.status === "offered";

	const myTurn = (() => {
		if (!actionable) return false;
		if (!lastWho) {
			return isNewbie; // newbie starts
		}
		if (lastWho === "newbie") return isVeteran;
		if (lastWho === "veteran") return isNewbie;
		return false;
	})();

	const sendOffer = async (who: "newbie" | "veteran", amount: number) => {
		const body =
			who === "newbie"
				? { newbieOffer: amount }
				: { veteranOffer: amount };
		const res = await fetch(`/api/tours/${request._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const d = await res.json();
		if (res.ok && d.tourRequest) {
			toast.success("Offer sent");
			onUpdated && onUpdated(d.tourRequest);
			// auto-close when request became confirmed or cancelled
			if (
				d.tourRequest.status === "confirmed" ||
				d.tourRequest.status === "cancelled"
			) {
				onOpenChange(false);
			}
		} else {
			toast.error(d.error || "Failed");
		}
	};

	const accept = async () => {
		const res = await fetch(`/api/tours/${request._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: "confirmed" }),
		});
		const d = await res.json();
		if (res.ok && d.tourRequest) {
			toast.success("Accepted");
			onUpdated && onUpdated(d.tourRequest);
			onOpenChange(false);
		} else {
			toast.error(d.error || "Failed");
		}
	};

	const reject = async () => {
		const res = await fetch(`/api/tours/${request._id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: "cancelled" }),
		});
		const d = await res.json();
		if (res.ok && d.tourRequest) {
			toast.success("Rejected");
			onUpdated && onUpdated(d.tourRequest);
			onOpenChange(false);
		} else {
			toast.error(d.error || "Failed");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Offers</DialogTitle>
				</DialogHeader>

				<div className="space-y-3">
					<div className="text-sm font-medium">Offer history</div>
					<div className="space-y-1 max-h-60 overflow-auto">
						{(request.offers || []).map((o: any, i: number) => (
							<div
								key={i}
								className="flex justify-between text-sm"
							>
								<div>{o.who}</div>
								<div>৳{o.amount}</div>
								<div className="text-muted-foreground">
									{new Date(o.at).toLocaleString()}
								</div>
							</div>
						))}
					</div>

					<div className="pt-2">
						<div className="text-sm">
							Your turn: {myTurn ? "Yes" : "No"}
						</div>
						<div className="mt-2 flex gap-2">
							<input
								placeholder="amount"
								type="number"
								value={offerValue || ""}
								onChange={(e) =>
									setOfferValue(Number(e.target.value))
								}
								className="border px-2 py-1 rounded"
							/>
							<Button
								onClick={() =>
									sendOffer(
										isNewbie ? "newbie" : "veteran",
										offerValue
									)
								}
								disabled={!myTurn || !offerValue}
							>
								Send Offer
							</Button>
							<Button onClick={accept} disabled={!myTurn}>
								Accept
							</Button>
							<Button onClick={reject}>Reject</Button>
						</div>
					</div>
				</div>

				<DialogFooter>
					<div />
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
