"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProfileDisplay from "@/components/ProfileDisplay";
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
}

export default function UserProfile() {
	const params = useParams();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
			</div>
		</div>
	);
}
