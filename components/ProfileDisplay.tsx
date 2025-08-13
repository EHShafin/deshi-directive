"use client";

import NewbieProfile from "./profiles/NewbieProfile";
import VeteranProfile from "./profiles/VeteranProfile";
import BusinessProfile from "./profiles/BusinessProfile";
import AdminProfile from "./profiles/AdminProfile";

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
	profilePicture?: string;
}

interface ProfileDisplayProps {
	user: UserProfile;
	isOwnProfile?: boolean;
}

export default function ProfileDisplay({
	user,
	isOwnProfile = false,
}: ProfileDisplayProps) {
	switch (user.userType) {
		case "newbie":
			return <NewbieProfile user={user} isOwnProfile={isOwnProfile} />;
		case "veteran":
			return <VeteranProfile user={user} isOwnProfile={isOwnProfile} />;
		case "local_shop":
		case "restaurant":
			return (
				<BusinessProfile
					user={user as any}
					isOwnProfile={isOwnProfile}
				/>
			);
		case "local_admin":
		case "admin":
			return (
				<AdminProfile user={user as any} isOwnProfile={isOwnProfile} />
			);
		default:
			return <NewbieProfile user={user} isOwnProfile={isOwnProfile} />;
	}
}
