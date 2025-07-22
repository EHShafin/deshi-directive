"use client";

import { Shield, Mail, MapPin, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminProfileProps {
	user: {
		id: string;
		name: string;
		email?: string;
		userType: "local_admin" | "admin";
		place?: {
			_id: string;
			name: string;
			city: string;
			state: string;
			country: string;
		};
		createdAt?: string;
	};
	isOwnProfile?: boolean;
}

export default function AdminProfile({
	user,
	isOwnProfile = false,
}: AdminProfileProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const isGlobalAdmin = user.userType === "admin";
	const badgeColor = isGlobalAdmin
		? "bg-red-100 text-red-800"
		: "bg-yellow-100 text-yellow-800";
	const iconBg = isGlobalAdmin ? "bg-red-100" : "bg-yellow-100";
	const iconColor = isGlobalAdmin ? "text-red-600" : "text-yellow-600";
	const cardBg = isGlobalAdmin
		? "bg-red-50 border-red-200"
		: "bg-yellow-50 border-yellow-200";
	const textColor = isGlobalAdmin ? "text-red-900" : "text-yellow-900";
	const subTextColor = isGlobalAdmin ? "text-red-700" : "text-yellow-700";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-3">
						<div className={`p-2 ${iconBg} rounded-full`}>
							<Shield className={`h-6 w-6 ${iconColor}`} />
						</div>
						{user.name}
					</CardTitle>
					<Badge className={badgeColor}>
						{isGlobalAdmin ? "Administrator" : "Local Admin"}
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

					{user.place && !isGlobalAdmin && (
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Administrative Area
								</p>
								<p className="text-sm text-muted-foreground">
									{user.place.name}, {user.place.city},{" "}
									{user.place.state}
								</p>
							</div>
						</div>
					)}

					{isGlobalAdmin && (
						<div className="flex items-center gap-3">
							<Users className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Scope</p>
								<p className="text-sm text-muted-foreground">
									Platform-wide administration
								</p>
							</div>
						</div>
					)}

					{user.createdAt && (
						<div className="flex items-center gap-3">
							<Calendar className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Admin Since
								</p>
								<p className="text-sm text-muted-foreground">
									{formatDate(user.createdAt)}
								</p>
							</div>
						</div>
					)}
				</div>

				<div className={`p-4 rounded-lg border ${cardBg}`}>
					<h3 className={`text-sm font-medium mb-2 ${textColor}`}>
						{isGlobalAdmin
							? "System Administrator"
							: "Local Administrator"}
					</h3>
					<p className={`text-sm ${subTextColor}`}>
						{isGlobalAdmin
							? "Managing platform operations, user accounts, and ensuring the best experience for all community members."
							: `Overseeing local operations and supporting businesses and guides in ${
									user.place?.city || "the area"
							  }.`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
