"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import OffersModal from "@/components/ui/OffersModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GuideRequestsPage() {
	const [user, setUser] = useState<any>(null);
	const [requests, setRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [offersOpen, setOffersOpen] = useState(false);
	const [activeRequest, setActiveRequest] = useState<any>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const me = await fetch("/api/auth/me", { cache: "no-store" });
				if (!me.ok) {
					setUser(null);
					setLoading(false);
					return;
				}
				const m = await me.json();
				setUser(m.user || null);

				const res = await fetch("/api/tours/requests");
				const d = await res.json();
				setRequests(d.requests || []);
			} catch (e) {
				setError("Failed to load");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	async function updateStatus(id: string, status: string) {
		try {
			const res = await fetch(`/api/tours/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			const d = await res.json();
			if (res.ok) {
				setRequests((r) =>
					r.map((x) => (x._id === id ? d.tourRequest || x : x))
				);
			} else {
				alert(d.error || "Failed to update");
			}
		} catch (e) {
			alert("Failed to update");
		}
	}

	if (loading) return <div>Loading...</div>;
	if (!user) return <div>Please sign in as a guide to view requests.</div>;
	if (user.userType !== "veteran")
		return <div>Only tour guides can view this page.</div>;

	const my = requests.filter((r) => {
		const vetId = r.veteran ? r.veteran._id ?? r.veteran : null;
		return String(vetId) === String(user.id);
	});

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Tour Requests</h1>
			{my.length === 0 && <div>No requests yet.</div>}
			<div className="grid gap-3">
				{my.map((r) => {
					const lastOffer = (r.offers || []).slice(-1)[0];
					const lastWho = lastOffer ? lastOffer.who : null;
					const newbieId = r.newbie ? r.newbie._id ?? r.newbie : null;
					const vetId = r.veteran ? r.veteran._id ?? r.veteran : null;
					const isNewbie = String(user.id) === String(newbieId);
					const isVeteran = String(user.id) === String(vetId);
					const actionable =
						r.status === "requested" || r.status === "offered";
					const myTurn = (() => {
						if (!actionable) return false;
						if (!lastWho) return isVeteran ? true : false; // if no offers yet, newbie starts, so veteran waits
						if (lastWho === "newbie") return isVeteran;
						if (lastWho === "veteran") return isNewbie;
						return false;
					})();

					return (
						<Card key={r._id} data-request={r._id}>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<div className="font-medium">
											{r.newbie?.name || r.newbie}
										</div>
										<div className="text-sm text-muted-foreground">
											{r.place?.name || "Place"}
										</div>
										<div className="text-sm text-muted-foreground">{`${new Date(
											r.startTime
										).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})} - ${new Date(
											r.endTime
										).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})}`}</div>
									</div>
									<div className="space-y-2">
										<div className="text-sm flex items-center gap-2">
											<span>
												{r.status === "completed" && (
													<Badge variant="secondary">
														Paid
													</Badge>
												)}
												Status:{" "}
												<strong>{r.status}</strong>
											</span>
											{r.status === "confirmed" && (
												<Badge variant="secondary">
													Confirmed
												</Badge>
											)}
										</div>
										<div className="text-sm">
											Offer history:
										</div>
										<div className="space-y-1">
											{Array.isArray(r.offers) &&
											r.offers.length ? (
												r.offers.map(
													(o: any, i: number) => (
														<div
															key={i}
															className="text-sm"
														>
															<strong>
																{o.who}
															</strong>
															: ৳{o.amount} •{" "}
															{new Date(
																o.at
															).toLocaleString()}
														</div>
													)
												)
											) : (
												<div className="text-sm text-muted-foreground">
													No offers yet
												</div>
											)}
										</div>
										{myTurn && (
											<div className="flex gap-2 items-center mt-2">
												<div className="flex items-center gap-2">
													<Button
														onClick={() => {
															setActiveRequest(r);
															setOffersOpen(true);
														}}
													>
														View Offers
													</Button>
												</div>
												<Button
													onClick={() =>
														updateStatus(
															r._id,
															"confirmed"
														)
													}
												>
													Confirm
												</Button>
												<Button
													onClick={() =>
														updateStatus(
															r._id,
															"cancelled"
														)
													}
												>
													Cancel
												</Button>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<OffersModal
				open={offersOpen}
				onOpenChange={(v: boolean) => {
					setOffersOpen(v);
					if (!v) setActiveRequest(null);
				}}
				request={activeRequest}
				currentUser={user}
				onUpdated={(tr: any) => {
					setRequests((arr) =>
						arr.map((x) => (x._id === tr._id ? tr : x))
					);
				}}
			/>
		</div>
	);
}
