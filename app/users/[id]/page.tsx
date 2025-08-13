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

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`/api/users/${params.id}`);
				if (!response.ok) {
					throw new Error("User not found");
				}
				const data = await response.json();
				setUser(data.user);
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

				{["local_shop", "restaurant"].includes(user.userType) && (
					<div className="mt-6 border rounded-lg p-4 space-y-3">
						<h2 className="text-lg font-semibold">
							Leave Feedback
						</h2>
						<div className="flex items-center gap-2">
							<span className="text-sm">Rating</span>
							<Input
								type="number"
								min={1}
								max={5}
								className="w-24"
								value={rating}
								onChange={(e) =>
									setRating(parseInt(e.target.value || "5"))
								}
							/>
						</div>
						<Textarea
							placeholder="Comment (optional)"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
						/>
						<Button
							onClick={async () => {
								await fetch(`/api/users/${user.id}/feedback`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ rating, comment }),
								});
								setRating(5);
								setComment("");
							}}
						>
							Submit
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
