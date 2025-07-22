"use client";

import {
	User,
	Mail,
	Phone,
	MapPin,
	Store,
	FileText,
	Shield,
	Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserProfile {
	id: string;
	name: string;
	email?: string;
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

interface ProfileViewProps {
	user: UserProfile;
	isOwnProfile?: boolean;
}

export default function ProfileView({
	user,
	isOwnProfile = false,
}: ProfileViewProps) {
	const getUserTypeDisplay = (userType: string) => {
		switch (userType) {
			case "newbie":
				return {
					label: "Explorer",
					color: "bg-blue-100 text-blue-800",
					icon: User,
				};
			case "veteran":
				return {
					label: "Tour Guide",
					color: "bg-green-100 text-green-800",
					icon: Shield,
				};
			case "local_shop":
				return {
					label: "Local Shop",
					color: "bg-purple-100 text-purple-800",
					icon: Store,
				};
			case "restaurant":
				return {
					label: "Restaurant",
					color: "bg-orange-100 text-orange-800",
					icon: Store,
				};
			case "local_admin":
				return {
					label: "Local Admin",
					color: "bg-yellow-100 text-yellow-800",
					icon: Shield,
				};
			case "admin":
				return {
					label: "Admin",
					color: "bg-red-100 text-red-800",
					icon: Shield,
				};
			default:
				return {
					label: userType,
					color: "bg-gray-100 text-gray-800",
					icon: User,
				};
		}
	};

	const userTypeInfo = getUserTypeDisplay(user.userType);
	const IconComponent = userTypeInfo.icon;

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
						<div className="p-2 bg-primary/10 rounded-full">
							<IconComponent className="h-6 w-6 text-primary" />
						</div>
						{user.name}
					</CardTitle>
					<Badge className={userTypeInfo.color}>
						{userTypeInfo.label}
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
									{user.place.state}, {user.place.country}
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

					{user.businessName && (
						<div className="flex items-center gap-3">
							<Store className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Business Name
								</p>
								<p className="text-sm text-muted-foreground">
									{user.businessName}
								</p>
							</div>
						</div>
					)}

					{user.businessAddress && (
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Business Address
								</p>
								<p className="text-sm text-muted-foreground">
									{user.businessAddress}
								</p>
							</div>
						</div>
					)}

					{user.businessPhone && (
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Business Phone
								</p>
								<p className="text-sm text-muted-foreground">
									{user.businessPhone}
								</p>
							</div>
						</div>
					)}

					{user.businessHours && (
						<div className="flex items-start gap-3">
							<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium">
									Business Hours
								</p>
								<p className="text-sm text-muted-foreground">
									{user.businessHours}
								</p>
							</div>
						</div>
					)}

					{(user.description || user.businessDescription) && (
						<div className="flex items-start gap-3">
							<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium mb-1">
									{user.userType === "veteran"
										? "About Services"
										: user.businessDescription
										? "Business Description"
										: "Description"}
								</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{user.description ||
										user.businessDescription}
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

				{user.userType === "newbie" && !isOwnProfile && (
					<div className="bg-muted/50 p-4 rounded-lg">
						<h3 className="text-sm font-medium mb-2">Explorer</h3>
						<p className="text-sm text-muted-foreground">
							This user is exploring amazing destinations and
							connecting with local guides and businesses.
						</p>
					</div>
				)}

				{user.userType === "newbie" && isOwnProfile && (
					<div className="bg-muted/50 p-4 rounded-lg">
						<h3 className="text-sm font-medium mb-2">
							Getting Started
						</h3>
						<p className="text-sm text-muted-foreground">
							Welcome to Deshi Directive! Explore amazing
							destinations and connect with local guides and
							businesses.
						</p>
					</div>
				)}

				{["veteran", "local_shop", "restaurant"].includes(
					user.userType
				) && (
					<div className="bg-muted/50 p-4 rounded-lg">
						<h3 className="text-sm font-medium mb-2">
							Service Provider
						</h3>
						<p className="text-sm text-muted-foreground">
							{user.userType === "veteran"
								? `Professional guide helping travelers discover ${
										user.place?.city || "local areas"
								  }.`
								: `Local business serving the ${
										user.place?.city || "local"
								  } community.`}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
