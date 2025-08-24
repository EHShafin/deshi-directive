"use client";
import React, { useEffect, useState } from "react";
export default function Page() {
	const [places, setPlaces] = useState<any[]>([]);
	useEffect(() => {
		fetch("/api/places")
			.then((r) => r.json())
			.then((d) => setPlaces(d.places || []));
	}, []);
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold">Places</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
				{places.map((p) => (
					<a
						key={p._id}
						href={`/places/${p._id}/products`}
						className="block border rounded overflow-hidden"
					>
						<img
							alt={p.name}
							src={p.image}
							className="w-full h-36 object-cover"
						/>
						<div className="p-3">
							<div className="font-semibold">{p.name}</div>
							<div className="text-sm text-muted-foreground">
								{p.city}, {p.state}
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
