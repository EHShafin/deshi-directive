"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import BusinessEditForm from "@/components/profiles/BusinessEditForm";
import SellerNav from "@/components/seller/SellerNav";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

export default function SellerSettings() {
	const { user, isLoading } = useAuth();
	const [current, setCurrent] = useState<any | null>(null);
	const [places, setPlaces] = useState<any[]>([]);
	const [selectedPlace, setSelectedPlace] = useState<string | undefined>();
	useEffect(() => {
		if (!isLoading && user) setCurrent(user);
	}, [isLoading, user]);
	useEffect(() => {
		fetch("/api/places")
			.then((r) => r.json())
			.then((d) => setPlaces(d.places || []));
	}, []);
	useEffect(() => {
		if (current?.place?._id) setSelectedPlace(current.place._id);
	}, [current]);
	if (isLoading) return <div className="py-10 text-center">Loading...</div>;
	if (!current) return null;
	return (
		<div className="space-y-4">
			<SellerNav />
			<h1 className="text-xl font-semibold">Shop Information</h1>
			<div className="border rounded-lg p-4 space-y-3">
				<div className="text-sm font-medium">Location</div>
				<div className="max-w-md">
					<Select
						value={selectedPlace}
						onValueChange={async (v) => {
							setSelectedPlace(v);
							const res = await fetch("/api/auth/profile", {
								method: "PUT",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ place: v }),
							});
							if (res.ok) {
								const data = await res.json();
								setCurrent(data.user);
							}
						}}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select place" />
						</SelectTrigger>
						<SelectContent>
							{places.map((p: any) => (
								<SelectItem key={p._id} value={p._id}>
									{p.name} — {p.city}, {p.state}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<BusinessEditForm
				user={current}
				onSave={setCurrent}
				onCancel={() => {}}
			/>
		</div>
	);
}
