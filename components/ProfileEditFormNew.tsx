"use client";

import NewbieEditForm from "./profiles/NewbieEditForm";
import VeteranEditForm from "./profiles/VeteranEditForm";
import BusinessEditForm from "./profiles/BusinessEditForm";
import AdminEditForm from "./profiles/AdminEditForm";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	userType:
		| "newbie"
		| "veteran"
		| "local_admin"
		| "admin"
		| "local_shop"
		| "restaurant";
	phone?: string;
	businessName?: string;
	businessDescription?: string;
	businessAddress?: string;
	businessPhone?: string;
	businessHours?: string;
	description?: string;
}

interface ProfileEditFormProps {
	user: UserProfile;
	onSave: (updatedUser: any) => void;
	onCancel: () => void;
}

export default function ProfileEditForm({
	user,
	onSave,
	onCancel,
}: ProfileEditFormProps) {
	switch (user.userType) {
		case "newbie":
			return (
				<NewbieEditForm
					user={user}
					onSave={onSave}
					onCancel={onCancel}
				/>
			);
		case "veteran":
			return (
				<VeteranEditForm
					user={user}
					onSave={onSave}
					onCancel={onCancel}
				/>
			);
		case "local_shop":
		case "restaurant":
			return (
				<BusinessEditForm
					user={user as any}
					onSave={onSave}
					onCancel={onCancel}
				/>
			);
		case "local_admin":
		case "admin":
			return (
				<AdminEditForm
					user={user as any}
					onSave={onSave}
					onCancel={onCancel}
				/>
			);
		default:
			return (
				<NewbieEditForm
					user={user}
					onSave={onSave}
					onCancel={onCancel}
				/>
			);
	}
}
