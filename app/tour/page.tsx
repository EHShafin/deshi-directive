"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Page() {
	const [veteranFromQuery, setVeteranFromQuery] = useState("");

	const [newbie, setNewbie] = useState("");
	const [veteran, setVeteran] = useState(veteranFromQuery);
	const [place, setPlace] = useState("");
	const [time, setTime] = useState("");
	const [offer, setOffer] = useState(0);
	const [created, setCreated] = useState<any>(null);
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const params =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search)
				: null;
		const v = params ? params.get("veteran") || "" : "";
		setVeteranFromQuery(v);
		if (v) setVeteran(v);
	}, []);

	async function createRequest(e: any) {
		e.preventDefault();
		setError(null);
		try {
			const res = await fetch("/api/tours/requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					newbie,
					veteran,
					place,
					time,
					newbieOffer: offer,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to create request");
				return;
			}
			setCreated(data.tourRequest);
		} catch (e) {
			setError("Failed to create request");
		}
	}

	async function pay(e: any) {
		e.preventDefault();
		if (!created) return;
		const res = await fetch(`/api/tours/${created._id}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				cardNumber,
				cardName,
				expiry,
				cvv,
				amount: created.estimatePrice || created.newbieOffer || 0,
			}),
		});
		const data = await res.json();
		setCreated(data.tourRequest || created);
		alert(
			data.payment
				? "Payment recorded (fake)"
				: data.error || "Payment failed"
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">Request a Tour</h1>

				<form onSubmit={createRequest} className="space-y-4">
					<label className="block">
						<div className="text-sm mb-1">
							Your user id (newbie)
						</div>
						<Input
							value={newbie}
							onChange={(e: any) => setNewbie(e.target.value)}
						/>
					</label>

					<label className="block">
						<div className="text-sm mb-1">
							Guide user id (veteran)
						</div>
						<Input
							value={veteran}
							onChange={(e: any) => setVeteran(e.target.value)}
						/>
					</label>

					<label className="block">
						<div className="text-sm mb-1">Place id</div>
						<Input
							value={place}
							onChange={(e: any) => setPlace(e.target.value)}
						/>
					</label>

					<label className="block">
						<div className="text-sm mb-1">
							Time (YYYY-MM-DDTHH:MM)
						</div>
						<Input
							value={time}
							onChange={(e: any) => setTime(e.target.value)}
						/>
					</label>

					<label className="block">
						<div className="text-sm mb-1">Your offer (number)</div>
						<Input
							type="number"
							value={offer}
							onChange={(e: any) =>
								setOffer(Number(e.target.value))
							}
						/>
					</label>

					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}

					<Button type="submit">Create Request</Button>
				</form>

				{created && (
					<div className="mt-6">
						<h2 className="text-xl font-semibold mb-2">
							Request created
						</h2>
						<pre className="bg-muted p-3 rounded">
							{JSON.stringify(created, null, 2)}
						</pre>

						<form onSubmit={pay} className="space-y-3 mt-4">
							<Input
								placeholder="Card Number (16 digits)"
								value={cardNumber}
								onChange={(e: any) =>
									setCardNumber(e.target.value)
								}
							/>
							<Input
								placeholder="Name on Card"
								value={cardName}
								onChange={(e: any) =>
									setCardName(e.target.value)
								}
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
							<Button type="submit">Pay (fake)</Button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
