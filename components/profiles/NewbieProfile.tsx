"use client";

import { User, Mail, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NewbieProfileProps {
	user: {
		id: string;
		name: string;
		email?: string;
		place?: {
			_id: string;
			name: string;
			city: string;
			state: string;
			country: string;
		};
		createdAt?: string;
		profilePicture?: string;
	};
	isOwnProfile?: boolean;
}

export default function NewbieProfile({
	user,
	isOwnProfile = false,
}: NewbieProfileProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-3">
						<Avatar className="h-12 w-12 border-2 border-blue-100">
							{user.profilePicture ? (
								<AvatarImage
									src={user.profilePicture}
									alt={user.name}
								/>
							) : (
								<AvatarFallback className="bg-blue-100 text-blue-600">
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							)}
						</Avatar>
						{user.name}
					</CardTitle>
					<Badge className="bg-blue-100 text-blue-800">
						Explorer
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4">
					{isOwnProfile && user.email && (
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Email</p>
								<p className="text-sm text-muted-foreground">
									{user.email}
								</p>
							</div>
						</div>
					)}

					{user.place && (
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Location</p>
								<p className="text-sm text-muted-foreground">
									{user.place.name}, {user.place.city},{" "}
									{user.place.state}
								</p>
							</div>
						</div>
					)}

					{user.createdAt && (
						<div className="flex items-center gap-3">
							<Calendar className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Member Since
								</p>
								<p className="text-sm text-muted-foreground">
									{formatDate(user.createdAt)}
								</p>
							</div>
						</div>
					)}
				</div>

				{isOwnProfile ? (
					<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
						<h3 className="text-sm font-medium mb-2 text-blue-900">
							Getting Started
						</h3>
						<p className="text-sm text-blue-700">
							Welcome to Deshi Directive! Explore amazing
							destinations and connect with local guides and
							businesses.
						</p>
					</div>
				) : (
					<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
						<h3 className="text-sm font-medium mb-2 text-blue-900">
							Explorer
						</h3>
						<p className="text-sm text-blue-700">
							This user is exploring amazing destinations and
							connecting with local guides and businesses.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
