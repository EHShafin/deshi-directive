"use client";

import { Shield, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface VeteranProfileProps {
	user: {
		id: string;
		name: string;
		email?: string;
		phone?: string;
		description?: string;
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

export default function VeteranProfile({
	user,
	isOwnProfile = false,
}: VeteranProfileProps) {
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
						<Avatar className="h-12 w-12 border-2 border-green-100">
							{user.profilePicture ? (
								<AvatarImage
									src={user.profilePicture}
									alt={user.name}
								/>
							) : (
								<AvatarFallback className="bg-green-100 text-green-600">
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							)}
						</Avatar>
						{user.name}
					</CardTitle>
					<Badge className="bg-green-100 text-green-800">
						Tour Guide
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

					{user.phone && (
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Phone</p>
								<p className="text-sm text-muted-foreground">
									{user.phone}
								</p>
							</div>
						</div>
					)}

					{user.place && (
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Service Area
								</p>
								<p className="text-sm text-muted-foreground">
									{user.place.name}, {user.place.city},{" "}
									{user.place.state}
								</p>
							</div>
						</div>
					)}

					{user.description && (
						<div className="flex items-start gap-3">
							<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium mb-1">
									About My Services
								</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{user.description}
								</p>
							</div>
						</div>
					)}

					{user.createdAt && (
						<div className="flex items-center gap-3">
							<Calendar className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Guide Since
								</p>
								<p className="text-sm text-muted-foreground">
									{formatDate(user.createdAt)}
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="bg-green-50 p-4 rounded-lg border border-green-200">
					<h3 className="text-sm font-medium mb-2 text-green-900">
						Professional Guide
					</h3>
					<p className="text-sm text-green-700">
						Experienced guide helping travelers discover{" "}
						{user.place?.city || "amazing destinations"}
						and providing authentic local experiences.
					</p>
					{/* Removed 'My Tour Requests' link per request */}
				</div>
			</CardContent>
		</Card>
	);
}
