"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileDisplay from "@/components/ProfileDisplay";
import ProfileEditForm from "@/components/ProfileEditForm";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
	const { user, isLoading } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/signin");
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 rounded w-1/4"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	const handleSave = (updatedUser: any) => {
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">
							Profile
						</h1>
						<p className="text-muted-foreground">
							Manage your account information and preferences
						</p>
					</div>
					{!isEditing && (
						<Button onClick={() => setIsEditing(true)}>
							<Edit className="h-4 w-4 mr-2" />
							Edit Profile
						</Button>
					)}
				</div>

				{isEditing ? (
					<ProfileEditForm
						user={user}
						onSave={handleSave}
						onCancel={handleCancel}
					/>
				) : (
					<ProfileDisplay user={user} isOwnProfile={true} />
				)}
			</div>
		</div>
	);
}

function YourBookings({ currentUserId }: { currentUserId: string }) {
	const [list, setList] = useState<any[]>([]);

	useEffect(() => {
		fetch("/api/tours/my")
			.then((r) => r.json())
			.then((d) => setList(d.requests || []));
	}, []);

	if (!list.length)
		return <p className="text-muted-foreground">No bookings yet.</p>;

	return (
		<div className="space-y-3">
			{list.map((t) => (
				<div
					key={t._id}
					data-request={t._id}
					className="p-3 border rounded"
				>
					<div className="flex items-center justify-between">
						<div>
							<div className="font-semibold">
								{t.place?.name || "Place"}
							</div>
							<div className="text-sm text-muted-foreground">
								{`${new Date(t.startTime).toLocaleString(
									undefined,
									{ dateStyle: "medium", timeStyle: "short" }
								)} - ${new Date(t.endTime).toLocaleString(
									undefined,
									{ dateStyle: "medium", timeStyle: "short" }
								)}`}
							</div>
						</div>
						<div className="text-sm">{t.status}</div>
					</div>
					<div className="mt-3">
						<div className="mb-2 font-medium">Offer history</div>
						{Array.isArray(t.offers) && t.offers.length ? (
							<div className="space-y-1">
								{t.offers.map((o: any, i: number) => (
									<div key={i} className="text-sm">
										<strong>{o.who}</strong>: ৳{o.amount} •{" "}
										{new Date(o.at).toLocaleString()}
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-muted-foreground">
								No offers yet
							</div>
						)}
						<div className="mt-2 flex gap-2">
							{String(currentUserId) === String(t.newbie?._id) &&
								t.status !== "confirmed" && (
									<>
										<div className="flex items-center gap-2">
											<input
												type="number"
												placeholder="Your offer"
												data-offer-input
												className="border px-2 py-1 rounded"
											/>
											<button
												className="btn"
												onClick={async (e) => {
													const btn =
														e.currentTarget as HTMLButtonElement;
													const container =
														btn.closest(
															"[data-request]"
														) as HTMLElement | null;
													const el = container
														? (container.querySelector(
																"[data-offer-input]"
														  ) as HTMLInputElement | null)
														: null;
													const v = el
														? Number(el.value)
														: NaN;
													if (!v || isNaN(v)) {
														toast.error(
															"Enter a valid amount"
														);
														return;
													}
													const res = await fetch(
														`/api/tours/${t._id}`,
														{
															method: "PATCH",
															headers: {
																"Content-Type":
																	"application/json",
															},
															body: JSON.stringify(
																{
																	newbieOffer:
																		v,
																}
															),
														}
													);
													const d = await res.json();
													if (
														res.ok &&
														d.tourRequest
													) {
														setList((arr) =>
															arr.map((x) =>
																x._id === t._id
																	? d.tourRequest
																	: x
															)
														);
														toast.success(
															"Offer sent"
														);
													} else {
														toast.error(
															d.error || "Failed"
														);
													}
												}}
											>
												Send Offer
											</button>
										</div>
										<button
											className="btn"
											onClick={async () => {
												const res = await fetch(
													`/api/tours/${t._id}`,
													{
														method: "PATCH",
														headers: {
															"Content-Type":
																"application/json",
														},
														body: JSON.stringify({
															status: "confirmed",
														}),
													}
												);
												const d = await res.json();
												if (res.ok && d.tourRequest) {
													setList((arr) =>
														arr.map((x) =>
															x._id === t._id
																? d.tourRequest
																: x
														)
													);
													toast.success("Accepted");
												} else {
													toast.error(
														d.error || "Failed"
													);
												}
											}}
										>
											Accept
										</button>
									</>
								)}
							{String(currentUserId) === String(t.veteran?._id) &&
								t.status !== "confirmed" && (
									<>
										<div className="flex items-center gap-2">
											<input
												type="number"
												placeholder="Counter offer"
												data-offer-input
												className="border px-2 py-1 rounded"
											/>
											<button
												className="btn"
												onClick={async (e) => {
													const btn =
														e.currentTarget as HTMLButtonElement;
													const container =
														btn.closest(
															"[data-request]"
														) as HTMLElement | null;
													const el = container
														? (container.querySelector(
																"[data-offer-input]"
														  ) as HTMLInputElement | null)
														: null;
													const v = el
														? Number(el.value)
														: NaN;
													if (!v || isNaN(v)) {
														toast.error(
															"Enter a valid amount"
														);
														return;
													}
													const res = await fetch(
														`/api/tours/${t._id}`,
														{
															method: "PATCH",
															headers: {
																"Content-Type":
																	"application/json",
															},
															body: JSON.stringify(
																{
																	veteranOffer:
																		v,
																}
															),
														}
													);
													const d = await res.json();
													if (
														res.ok &&
														d.tourRequest
													) {
														setList((arr) =>
															arr.map((x) =>
																x._id === t._id
																	? d.tourRequest
																	: x
															)
														);
														toast.success(
															"Offer sent"
														);
													} else {
														toast.error(
															d.error || "Failed"
														);
													}
												}}
											>
												Send Offer
											</button>
										</div>
									</>
								)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
