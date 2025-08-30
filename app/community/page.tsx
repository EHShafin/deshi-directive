"use client";

import React, { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import FundraiserPaymentModal from "@/components/ui/FundraiserPaymentModal";

export default function Page() {
	const { user } = useAuth();
	const [events, setEvents] = useState<any[]>([]);
	const [fundraisers, setFundraisers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<"events" | "fundraisers">("events");
	const [newEventTitle, setNewEventTitle] = useState("");
	const [newEventDate, setNewEventDate] = useState("");
	const [newEventLocation, setNewEventLocation] = useState("");
	const [newFundTitle, setNewFundTitle] = useState("");
	const [newFundGoal, setNewFundGoal] = useState<number | "">("");
	const [donateOpen, setDonateOpen] = useState(false);
	const [donateAmount, setDonateAmount] = useState(0);
	const [donateTarget, setDonateTarget] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			setLoading(true);
			try {
				const [evRes, fRes] = await Promise.all([
					fetch("/api/community/events"),
					fetch("/api/community/fundraisers"),
				]);
				if (!evRes.ok || !fRes.ok) {
					toast.error("Failed to load community data");
					return;
				}
				const evJson = await evRes.json();
				const fJson = await fRes.json();
				setEvents(evJson.events ?? []);
				setFundraisers(fJson.fundraisers ?? []);
			} catch (err) {
				console.error(err);
				toast.error("Unable to fetch community data");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	const createEvent = async () => {
		if (!user) return toast.error("You must be signed in to create events");
		if (!newEventTitle || !newEventDate)
			return toast.error("Title and date required");
		try {
			const res = await fetch("/api/community/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newEventTitle,
					startDate: newEventDate,
					location: newEventLocation,
				}),
			});
			if (!res.ok) throw new Error("create failed");
			const json = await res.json();
			setEvents((s) => [json.event, ...s]);
			setNewEventTitle("");
			setNewEventDate("");
			setNewEventLocation("");
			toast.success("Event created");
		} catch (err) {
			console.error(err);
			toast.error("Failed to create event");
		}
	};

	const createFundraiser = async () => {
		if (!user)
			return toast.error("You must be signed in to create fundraisers");
		if (!newFundTitle || newFundGoal === "")
			return toast.error("Title and goal required");
		try {
			const res = await fetch("/api/community/fundraisers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newFundTitle,
					goal: Number(newFundGoal),
				}),
			});
			if (!res.ok) throw new Error("create failed");
			const json = await res.json();
			setFundraisers((s) => [json.fundraiser, ...s]);
			setNewFundTitle("");
			setNewFundGoal("");
			toast.success("Fundraiser created");
		} catch (err) {
			console.error(err);
			toast.error("Failed to create fundraiser");
		}
	};

	function openDonate(id: string) {
		if (!user) return toast.error("Sign in to donate");
		setDonateTarget(id);
		setDonateAmount(0);
		setDonateOpen(true);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-2xl font-semibold mb-6">Community</h1>

			<div className="mb-4">
				<div className="flex gap-2">
					<Button
						variant={tab === "events" ? "default" : "ghost"}
						onClick={() => setTab("events")}
					>
						Events
					</Button>
					<Button
						variant={tab === "fundraisers" ? "default" : "ghost"}
						onClick={() => setTab("fundraisers")}
					>
						Fundraisers
					</Button>
				</div>
			</div>

			{tab === "events" ? (
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{loading ? (
							<div>Loading events…</div>
						) : events.length === 0 ? (
							<div className="text-sm text-muted-foreground">
								No events found
							</div>
						) : (
							events.map((e) => (
								<Card key={e._id}>
									<CardHeader>
										<CardTitle>{e.title}</CardTitle>
										<CardDescription>
											{new Date(
												e.startDate
											).toLocaleString()}{" "}
											{e.location
												? `• ${e.location}`
												: ""}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{e.description && (
											<p className="text-sm text-muted-foreground">
												{e.description}
											</p>
										)}
									</CardContent>
									<CardFooter className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											{e.creator?.profilePicture && (
												<img
													src={
														e.creator.profilePicture
													}
													className="w-8 h-8 rounded-full"
													alt={e.creator?.name}
												/>
											)}
											<div className="text-sm">
												{e.creator?.name}
											</div>
										</div>
									</CardFooter>
								</Card>
							))
						)}
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Create event</CardTitle>
							<CardDescription>
								Create an event (signed-in users only)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Input
									placeholder="Event title"
									value={newEventTitle}
									onChange={(e) =>
										setNewEventTitle(e.target.value)
									}
								/>
								<Input
									type="datetime-local"
									value={newEventDate}
									onChange={(e) =>
										setNewEventDate(e.target.value)
									}
								/>
								<Input
									placeholder="Location"
									value={newEventLocation}
									onChange={(e) =>
										setNewEventLocation(e.target.value)
									}
								/>
								<Button onClick={createEvent}>
									Create event
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{loading ? (
							<div>Loading fundraisers…</div>
						) : fundraisers.length === 0 ? (
							<div className="text-sm text-muted-foreground">
								No fundraisers
							</div>
						) : (
							fundraisers.map((f) => {
								const pct =
									f.goal > 0
										? Math.round((f.raised / f.goal) * 100)
										: 0;
								return (
									<Card key={f._id}>
										<CardHeader>
											<CardTitle>{f.title}</CardTitle>
											<CardDescription>
												{f.raised} raised of {f.goal}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="mb-2">
												<Progress value={pct} />
											</div>
											{f.description && (
												<p className="text-sm text-muted-foreground">
													{f.description}
												</p>
											)}
										</CardContent>
										<CardFooter className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												{f.creator?.profilePicture && (
													<img
														src={
															f.creator
																.profilePicture
														}
														className="w-8 h-8 rounded-full"
														alt={f.creator?.name}
													/>
												)}
												<div className="text-sm">
													{f.creator?.name}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													onClick={() =>
														openDonate(f._id)
													}
												>
													Donate
												</Button>
											</div>
										</CardFooter>
									</Card>
								);
							})
						)}
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Create fundraiser</CardTitle>
							<CardDescription>
								Create a fundraiser (signed-in users only)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Input
									placeholder="Fundraiser title"
									value={newFundTitle}
									onChange={(e) =>
										setNewFundTitle(e.target.value)
									}
								/>
								<Input
									placeholder="Goal (number)"
									type="number"
									value={newFundGoal as any}
									onChange={(e) =>
										setNewFundGoal(
											e.target.value === ""
												? ""
												: Number(e.target.value)
										)
									}
								/>
								<Button onClick={createFundraiser}>
									Create fundraiser
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			<FundraiserPaymentModal
				open={donateOpen}
				onOpenChange={setDonateOpen}
				fundraiserId={donateTarget}
				amount={donateAmount}
				onPaid={(updated) => {
					setFundraisers((s) =>
						s.map((f: any) => (f._id === updated._id ? updated : f))
					);
				}}
			/>
		</div>
	);
}
