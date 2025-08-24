"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileDisplay from "@/components/ProfileDisplay";
import ProfileEditForm from "@/components/ProfileEditForm";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

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

				<div className="mt-6">
					<h2 className="text-lg font-semibold">
						Your Tour Requests
					</h2>
					<YourBookings />
					<div className="mt-4 flex gap-3">
						{user?.place && (
							<button
								className="btn"
								onClick={() =>
									window.location.assign(
										`/places/${user.place}/products`
									)
								}
							>
								View Local Products
							</button>
						)}
						{(user.userType === "newbie" ||
							user.userType === "veteran") && (
							<button
								className="btn btn-primary"
								onClick={() =>
									window.location.assign(`/profile/orders`)
								}
							>
								My Orders
							</button>
						)}
						*** End Patch
					</div>
				</div>
			</div>
		</div>
	);
}

function YourBookings() {
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
				<div key={t._id} className="p-3 border rounded">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-semibold">
								{t.place?.name || "Place"}
							</div>
							<div className="text-sm text-muted-foreground">
								{new Date(t.time).toLocaleString()}
							</div>
						</div>
						<div className="text-sm">{t.status}</div>
					</div>
				</div>
			))}
		</div>
	);
}
