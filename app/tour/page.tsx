"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Page() {
	const [veteranFromQuery, setVeteranFromQuery] = useState("");

	const [newbie, setNewbie] = useState("");
	const [veteran, setVeteran] = useState(veteranFromQuery);
	const [place, setPlace] = useState("");
	const [places, setPlaces] = useState<{ _id: string; name: string }[]>([]);
	const [isPlaceLocked, setIsPlaceLocked] = useState(false);
	const [placeName, setPlaceName] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [offer, setOffer] = useState(0);
	const [created, setCreated] = useState<any>(null);
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const params =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search)
				: null;
		const v = params ? params.get("veteran") || "" : "";
		setVeteranFromQuery(v);
		if (v) setVeteran(v);
	}, []);

	const { user, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && user) {
			setNewbie(user.id);
		}
	}, [isLoading, user]);

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const res = await fetch("/api/places");
				if (!res.ok) return;
				const data = await res.json();
				setPlaces(
					(Array.isArray(data.places) ? data.places : data).map(
						(p: any) => ({
							_id: p._id || p.id || p._id,
							name: p.name || p.businessName || "(unknown)",
						})
					)
				);
			} catch (e) {
				console.error("Failed to load places", e);
			}
		};

		fetchPlaces();
	}, []);

	useEffect(() => {
		const loadGuide = async () => {
			if (!veteranFromQuery) {
				setIsPlaceLocked(false);
				setPlaceName("");
				return;
			}

			try {
				const res = await fetch(`/api/users/${veteranFromQuery}`);
				if (!res.ok) {
					setIsPlaceLocked(false);
					return;
				}
				const data = await res.json();
				const guide = data.user;
				if (guide && guide.place) {
					const pid =
						guide.place._id || guide.place.id || guide.place;
					const pname =
						guide.place.name ||
						[guide.place.city, guide.place.state]
							.filter(Boolean)
							.join(", ") ||
						"(place)";
					setPlace(pid);
					setPlaceName(pname);
					setIsPlaceLocked(true);

					setPlaces((prev) =>
						prev.some((p) => p._id === pid)
							? prev
							: [{ _id: pid, name: pname }, ...prev]
					);
				} else {
					setIsPlaceLocked(false);
					setPlaceName("");
				}
			} catch (e) {
				console.error("Failed to load guide profile", e);
				setIsPlaceLocked(false);
			}
		};

		loadGuide();
	}, [veteranFromQuery]);

	async function createRequest(e: any) {
		e.preventDefault();
		setError(null);
		try {
			const res = await fetch("/api/tours/requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					...(newbie ? { newbie } : {}),
					...(veteran ? { veteran } : {}),
					place,
					startTime,
					endTime,
					newbieOffer: offer,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to create request");
				return;
			}
			const tr = data.tourRequest;
			if (tr) {
				// if created request is already confirmed, open payment UI on orders page
				const payParam =
					tr.status === "confirmed" ? `?pay=${tr._id}` : "";
				router.push(`/profile/orders${payParam}`);
				return;
			}
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
		if (res.ok && data.payment) {
			toast.success("Payment recorded");
			router.push("/profile/orders");
			return;
		}
		toast.error(data.error || "Payment failed");
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold mb-4">Request a Tour</h1>

				<form onSubmit={createRequest} className="space-y-4">
					{user ? (
						<div className="mb-2 text-sm text-muted-foreground">
							Logged in as: <strong>{user.name}</strong> (id
							hidden)
						</div>
					) : (
						<label className="block">
							<div className="text-sm mb-1">
								Your user id (newbie)
							</div>
							<Input
								value={newbie}
								onChange={(e: any) => setNewbie(e.target.value)}
							/>
						</label>
					)}

					{veteranFromQuery ? null : (
						<label className="block">
							<div className="text-sm mb-1">
								Guide user id (veteran) — optional
							</div>
							<Input
								value={veteran}
								onChange={(e: any) =>
									setVeteran(e.target.value)
								}
							/>
						</label>
					)}

					<label className="block">
						<div className="text-sm mb-1">Place</div>
						<select
							className="w-full border rounded px-2 py-1"
							value={place}
							onChange={(e: any) => setPlace(e.target.value)}
							disabled={isPlaceLocked}
						>
							<option value="">Select a place</option>
							{places.map((p) => (
								<option key={p._id} value={p._id}>
									{p.name}
								</option>
							))}
						</select>
						{isPlaceLocked && (
							<p className="text-sm text-muted-foreground mt-1">
								Place set from guide:{" "}
								<strong>{placeName || "(locked)"}</strong>
							</p>
						)}
					</label>

					<label className="block">
						<div className="text-sm mb-1">Start time</div>
						<Input
							type="datetime-local"
							value={startTime}
							onChange={(e: any) => setStartTime(e.target.value)}
						/>
					</label>

					<label className="block">
						<div className="text-sm mb-1">End time</div>
						<Input
							type="datetime-local"
							value={endTime}
							onChange={(e: any) => setEndTime(e.target.value)}
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
						<div className="text-sm text-muted-foreground">
							Your request was created. You can manage and pay for
							confirmed requests from the Tour Requests page.
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
