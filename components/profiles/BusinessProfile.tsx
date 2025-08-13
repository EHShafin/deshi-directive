"use client";

import {
	Store,
	Mail,
	Phone,
	MapPin,
	FileText,
	Calendar,
	Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BusinessProfileProps {
	user: {
		id: string;
		name: string;
		email?: string;
		userType: "local_shop" | "restaurant";
		phone?: string;
		businessName?: string;
		businessDescription?: string;
		businessAddress?: string;
		businessPhone?: string;
		businessHours?: string;
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

export default function BusinessProfile({
	user,
	isOwnProfile = false,
}: BusinessProfileProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const isRestaurant = user.userType === "restaurant";
	const badgeColor = isRestaurant
		? "bg-orange-100 text-orange-800"
		: "bg-purple-100 text-purple-800";
	const iconBg = isRestaurant ? "bg-orange-100" : "bg-purple-100";
	const iconColor = isRestaurant ? "text-orange-600" : "text-purple-600";
	const cardBg = isRestaurant
		? "bg-orange-50 border-orange-200"
		: "bg-purple-50 border-purple-200";
	const textColor = isRestaurant ? "text-orange-900" : "text-purple-900";
	const subTextColor = isRestaurant ? "text-orange-700" : "text-purple-700";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-3">
						<Avatar className={`h-12 w-12 border-2 ${iconBg}`}>
							{user.profilePicture ? (
								<AvatarImage
									src={user.profilePicture}
									alt={user.businessName || user.name}
								/>
							) : (
								<AvatarFallback
									className={`${iconBg} ${iconColor}`}
								>
									{(user.businessName || user.name)
										.charAt(0)
										.toUpperCase()}
								</AvatarFallback>
							)}
						</Avatar>
						{user.businessName || user.name}
					</CardTitle>
					<Badge className={badgeColor}>
						{isRestaurant ? "Restaurant" : "Local Shop"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4">
					{user.businessName && user.businessName !== user.name && (
						<div className="flex items-center gap-3">
							<Store className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Owner</p>
								<p className="text-sm text-muted-foreground">
									{user.name}
								</p>
							</div>
						</div>
					)}

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

					{user.phone && user.phone !== user.businessPhone && (
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									Personal Phone
								</p>
								<p className="text-sm text-muted-foreground">
									{user.phone}
								</p>
							</div>
						</div>
					)}

					{user.businessAddress && (
						<div className="flex items-start gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<p className="text-sm font-medium">Address</p>
								<p className="text-sm text-muted-foreground">
									{user.businessAddress}
								</p>
							</div>
						</div>
					)}

					{user.place && (
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Area</p>
								<p className="text-sm text-muted-foreground">
									{user.place.name}, {user.place.city},{" "}
									{user.place.state}
								</p>
							</div>
						</div>
					)}

					{user.businessHours && (
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium">
									Business Hours
								</p>
								<p className="text-sm text-muted-foreground whitespace-pre-line">
									{user.businessHours}
								</p>
							</div>
						</div>
					)}

					{user.businessDescription && (
						<div className="flex items-start gap-3">
							<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="text-sm font-medium mb-1">
									About Our Business
								</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{user.businessDescription}
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

				<div className={`p-4 rounded-lg border ${cardBg}`}>
					<h3 className={`text-sm font-medium mb-2 ${textColor}`}>
						{isRestaurant ? "Local Restaurant" : "Local Business"}
					</h3>
					<p className={`text-sm ${subTextColor}`}>
						{isRestaurant
							? `Serving delicious local cuisine in ${
									user.place?.city || "the area"
							  }. Experience authentic flavors and hospitality.`
							: `Supporting the local community in ${
									user.place?.city || "the area"
							  }. Discover unique products and services.`}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
