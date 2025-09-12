"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Product = {
	_id: string;
	name: string;
	price: number;
	images: string[];
	seller?: any;
};

type Place = {
	_id: string;
	name: string;
	city?: string;
	state?: string;
	country?: string;
	image?: string;
};

type Guide = {
	id: string;
	name: string;
	businessName?: string;
	place?: any;
};

export default function Home() {
	const [products, setProducts] = useState<Product[]>([]);
	const [places, setPlaces] = useState<Place[]>([]);
	const [guides, setGuides] = useState<Guide[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		async function load() {
			setLoading(true);
			try {
				const [pRes, plRes, gRes] = await Promise.all([
					fetch(`/api/products?limit=6`).then((r) => r.json()),
					fetch(`/api/places`).then((r) => r.json()),
					fetch(`/api/users?type=veteran&limit=6`).then((r) =>
						r.json()
					),
				]);
				if (!mounted) return;
				setProducts(pRes.products || []);
				setPlaces((plRes.places || []).slice(0, 6));
				setGuides(gRes.users || []);
			} catch (e) {
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="min-h-[calc(100vh-57px)]">
			<header className="bg-gradient-to-r from-primary/80 to-secondary/80 py-16">
				<div className="container mx-auto px-6 text-center">
					<h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
						Explore local goods, places and guides
					</h1>
					<p className="mt-4 text-white/90 max-w-2xl mx-auto">
						Discover top products, beautiful destinations, and
						trusted tour guides recommended by the community.
					</p>
					<div className="mt-6 flex items-center justify-center gap-3">
						<Link href="/places">
							<Button size="lg">Browse Places</Button>
						</Link>
						<Link href="/users">
							<Button variant="outline" size="lg">
								Find Guides
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-6 py-10 space-y-12">
				<section>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">Top Products</h2>
						<Link
							href="/products"
							className="text-sm text-muted-foreground"
						>
							See all
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{(loading ? Array.from({ length: 6 }) : products).map(
							(p: any, i: number) => (
								<Card
									key={p?._id || i}
									className="overflow-hidden transform transition hover:scale-105 hover:shadow-2xl"
								>
									<div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
										{p?.images?.[0] ? (
											<img
												src={p.images[0]}
												alt={p.name}
												className="object-cover w-full h-full"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
										)}
										<div className="absolute top-3 left-3 bg-white/80 text-xs px-2 py-1 rounded-md font-semibold">
											{i < 2 ? "Top" : "Popular"}
										</div>
										<div className="absolute top-3 right-3 bg-gradient-to-br from-primary to-secondary text-white text-sm px-3 py-1 rounded-md font-semibold">
											৳ {p?.price ?? ""}
										</div>
									</div>

									<CardContent>
										<CardTitle className="text-lg truncate">
											{p?.name || (
												<div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
											)}
										</CardTitle>
										<CardDescription className="mt-2 text-sm text-muted-foreground">
											{p ? (
												p.seller?.businessName ||
												"Local Seller"
											) : (
												<div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
											)}
										</CardDescription>
									</CardContent>

									<CardFooter className="items-center">
										<div className="flex-1 text-sm text-foreground/80">
											{p ? (
												"Available"
											) : (
												<div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
											)}
										</div>
										<Button asChild size="sm">
											<Link
												href={
													p
														? `/products/${p._id}`
														: "#"
												}
											>
												View
											</Link>
										</Button>
									</CardFooter>
								</Card>
							)
						)}
					</div>
				</section>

				<section>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">
							Top Destinations
						</h2>
						<Link
							href="/places"
							className="text-sm text-muted-foreground"
						>
							See all
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{(loading ? Array.from({ length: 6 }) : places).map(
							(pl: any, i: number) => (
								<Card
									key={pl?._id || i}
									className={`${
										i === 0
											? "md:col-span-2 md:row-span-1"
											: ""
									} overflow-hidden`}
								>
									<div className="relative h-52">
										{pl?.image ? (
											<img
												src={pl.image}
												alt={pl.name}
												className="object-cover w-full h-full"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100" />
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
										<div className="absolute left-6 bottom-6 text-white">
											<div className="text-lg font-semibold">
												{pl?.name || (
													<div className="h-4 w-40 bg-white/30 rounded animate-pulse" />
												)}
											</div>
											<div className="text-sm opacity-90">
												{pl?.city
													? `${pl.city}, ${pl.state}`
													: pl?.country || ""}
											</div>
										</div>
									</div>

									<CardFooter>
										<Button asChild size="sm">
											<Link
												href={
													pl
														? `/places/${pl._id}/products`
														: "#"
												}
											>
												Explore
											</Link>
										</Button>
										<div className="ml-auto text-sm text-muted-foreground">
											{i === 0 ? "Featured" : "Popular"}
										</div>
									</CardFooter>
								</Card>
							)
						)}
					</div>
				</section>

				<section>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">
							Featured Tour Guides
						</h2>
						<Link
							href="/users?type=veteran"
							className="text-sm text-muted-foreground"
						>
							See all
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{(loading ? Array.from({ length: 6 }) : guides).map(
							(g: any, i: number) => (
								<Card
									key={g?.id || i}
									className="overflow-hidden border-l-4 border-primary/60"
								>
									<div className="flex items-center gap-4 px-6 py-4">
										<div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-semibold">
											{g?.name ? (
												g.name.charAt(0)
											) : (
												<div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
											)}
										</div>
										<div className="flex-1">
											<div className="font-semibold">
												{g?.name || (
													<div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												{g?.businessName ||
													(g?.place?.name
														? g.place.name
														: "Local Guide")}
											</div>
										</div>

										<div className="flex flex-col gap-2">
											<Button asChild size="sm">
												<Link
													href={
														g
															? `/users/${g.id}`
															: "#"
													}
												>
													Profile
												</Link>
											</Button>
											<Button
												variant="outline"
												asChild
												size="sm"
											>
												<Link
													href={
														g
															? `/tour?veteran=${g.id}`
															: "#"
													}
												>
													Request
												</Link>
											</Button>
										</div>
									</div>

									<CardFooter>
										<div className="text-xs text-muted-foreground">
											{i < 2
												? "Highly recommended"
												: "Verified"}
										</div>
									</CardFooter>
								</Card>
							)
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
