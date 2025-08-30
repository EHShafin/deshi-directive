"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProfileDisplay from "@/components/ProfileDisplay";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserProfile {
	id: string;
	name: string;
	userType:
		| "newbie"
		| "veteran"
		| "local_admin"
		| "admin"
		| "local_shop"
		| "restaurant";
	place?: {
		_id: string;
		name: string;
		city: string;
		state: string;
		country: string;
	};
	phone?: string;
	businessName?: string;
	businessDescription?: string;
	businessAddress?: string;
	businessPhone?: string;
	businessHours?: string;
	description?: string;
	createdAt?: string;
	profilePicture?: string;
}

export default function UserProfile() {
	const params = useParams();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [rating, setRating] = useState<number>(5);
	const [comment, setComment] = useState<string>("");
	const [reviews, setReviews] = useState<any[]>([]);
	const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
	const [posting, setPosting] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`/api/users/${params.id}`);
				if (!response.ok) {
					throw new Error("User not found");
				}
				const data = await response.json();
				setUser(data.user);
				// fetch reviews after profile
				fetchReviews();
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load user"
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (params.id) {
			fetchUser();
		}
	}, [params.id]);

	async function fetchReviews() {
		setLoadingReviews(true);
		try {
			const res = await fetch(`/api/users/${params.id}/reviews`);
			if (res.ok) {
				const d = await res.json();
				setReviews(d.reviews || []);
			}
		} catch (e) {
			// ignore
		} finally {
			setLoadingReviews(false);
		}
	}

	useEffect(() => {
		const fetchCurrent = async () => {
			try {
				const res = await fetch("/api/auth/me", { cache: "no-store" });
				if (res.ok) {
					const d = await res.json();
					setCurrentUser(d.user || null);
				} else {
					setCurrentUser(null);
				}
			} catch (e) {
				setCurrentUser(null);
			} finally {
				setAuthLoading(false);
			}
		};

		fetchCurrent();
	}, []);

	const handleSubmitReview = async () => {
		setSubmitError(null);
		if (!currentUser) {
			setSubmitError("You must be signed in to submit a review");
			return;
		}

		setPosting(true);
		try {
			const res = await fetch(`/api/users/${params.id}/reviews`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rating, comment }),
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				setSubmitError(d.error || "Failed to submit review");
				return;
			}

			setComment("");
			setRating(5);
			// refresh reviews
			await fetchReviews();
		} catch (e) {
			setSubmitError("Failed to submit review");
		} finally {
			setPosting(false);
		}
	};

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

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto text-center">
					<h1 className="text-2xl font-bold mb-4">User Not Found</h1>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button asChild>
						<Link href="/">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back Home
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<Button variant="outline" asChild className="mb-4">
						<Link href="/">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
					<h1 className="text-3xl font-bold text-foreground mb-2">
						{user.name}'s Profile
					</h1>
					<p className="text-muted-foreground">
						Public profile information
					</p>
				</div>

				<ProfileDisplay user={user} isOwnProfile={false} />

				{user.userType === "veteran" && (
					<div className="mt-4">
						<Button asChild>
							<Link href={`/tour?veteran=${user.id}`}>
								Request Tour
							</Link>
						</Button>
					</div>
				)}

				{["local_shop", "restaurant"].includes(user.userType) && null}

				{/* Reviews section */}
				<div className="mt-8">
					<h2 className="text-2xl font-semibold mb-3">Reviews</h2>
					{loadingReviews ? (
						<div className="text-sm text-muted-foreground">
							Loading reviews...
						</div>
					) : reviews.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							No reviews yet.
						</div>
					) : (
						<div className="space-y-4">
							{reviews.map((r) => (
								<div key={r.id} className="p-4 border rounded">
									<div className="flex items-center">
										<div className="mr-3">
											{/* simple avatar */}
											<img
												src={
													r.from?.profilePicture ||
													"/placeholder.svg"
												}
												alt={r.from?.name || "Guest"}
												className="h-10 w-10 rounded-full object-cover"
											/>
										</div>
										<div>
											<div className="font-medium">
												{r.from?.name || "Guest"}
											</div>
											<div className="text-sm text-muted-foreground">
												{new Date(
													r.createdAt
												).toLocaleString()}
											</div>
										</div>
									</div>
									<div className="mt-2">
										<div className="font-semibold">
											Rating: {r.rating}/5
										</div>
										{r.comment && (
											<div className="mt-1">
												{r.comment}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Post review form */}
					<div className="mt-6 p-4 border rounded">
						<h3 className="font-medium mb-2">Leave a review</h3>
						{authLoading ? (
							<div className="text-sm text-muted-foreground">
								Checking auth...
							</div>
						) : currentUser ? (
							<>
								<label className="block mb-1">Rating</label>
								<Input
									type="number"
									value={rating}
									onChange={(e) =>
										setRating(Number(e.target.value))
									}
									min={0}
									max={5}
								/>
								<label className="block mt-3 mb-1">
									Comment
								</label>
								<Textarea
									value={comment}
									onChange={(e) => setComment(e.target.value)}
								/>
								<div className="mt-3 flex items-center space-x-2">
									<Button
										onClick={handleSubmitReview}
										disabled={posting}
									>
										{posting
											? "Posting..."
											: "Submit Review"}
									</Button>
									{submitError && (
										<div className="text-sm text-destructive">
											{submitError}
										</div>
									)}
								</div>
							</>
						) : (
							<div className="text-sm">
								You must be signed in to leave a review.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
