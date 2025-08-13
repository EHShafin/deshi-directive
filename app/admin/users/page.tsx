"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Users,
	UserCheck,
	UserX,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

interface Place {
	_id: string;
	name: string;
	city: string;
	state: string;
}

interface User {
	_id: string;
	name: string;
	email: string;
	userType: string;
	place?: Place;
	phone?: string;
	businessName?: string;
	isActive: boolean;
	createdAt: string;
	profilePicture?: string;
}

interface UsersResponse {
	users: User[];
	pagination: {
		currentPage: number;
		totalPages: number;
		total: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	stats: {
		total: number;
		active: number;
		inactive: number;
	};
}

export default function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [places, setPlaces] = useState<Place[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [userTypeFilter, setUserTypeFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		total: 0,
		hasNext: false,
		hasPrev: false,
	});
	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		inactive: 0,
	});
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		userType: "newbie",
		place: "",
		phone: "",
		businessName: "",
		businessDescription: "",
		businessAddress: "",
		businessPhone: "",
		businessHours: "",
		description: "",
		isActive: true,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchUsers();
		fetchPlaces();
	}, [searchTerm, userTypeFilter, statusFilter, currentPage]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: "10",
				...(searchTerm && { search: searchTerm }),
				...(userTypeFilter !== "all" && { userType: userTypeFilter }),
				...(statusFilter !== "all" && { isActive: statusFilter }),
			});

			const response = await fetch(`/api/admin/users?${params}`);
			if (response.ok) {
				const data: UsersResponse = await response.json();
				setUsers(data.users);
				setPagination(data.pagination);
				setStats(data.stats);
			} else {
				toast.error("Failed to fetch users");
			}
		} catch (error) {
			toast.error("Failed to fetch users");
		} finally {
			setLoading(false);
		}
	};

	const fetchPlaces = async () => {
		try {
			const response = await fetch(`/api/admin/places?limit=100`);
			if (response.ok) {
				const data = await response.json();
				setPlaces(data.places);
			}
		} catch (error) {
			toast.error("Failed to fetch places");
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			password: "",
			userType: "newbie",
			place: "",
			phone: "",
			businessName: "",
			businessDescription: "",
			businessAddress: "",
			businessPhone: "",
			businessHours: "",
			description: "",
			isActive: true,
		});
		setEditingUser(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		const requiredFields = getRequiredFields();
		for (const field of requiredFields) {
			if (!formData[field as keyof typeof formData]) {
				toast.error(
					`${
						field.charAt(0).toUpperCase() +
						field.slice(1).replace(/([A-Z])/g, " $1")
					} is required`
				);
				return;
			}
		}

		setIsSubmitting(true);
		try {
			// Create a new object with the form data, omitting password if editing and it's empty
			const submitData =
				editingUser && !formData.password
					? Object.fromEntries(
							Object.entries(formData).filter(
								([key]) => key !== "password"
							)
					  )
					: { ...formData };

			const url = editingUser
				? `/api/admin/users/${editingUser._id}`
				: "/api/admin/users";
			const method = editingUser ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				toast.success(
					editingUser
						? "User updated successfully"
						: "User created successfully"
				);
				if (editingUser) {
					setIsEditDialogOpen(false);
				} else {
					setIsAddDialogOpen(false);
				}
				resetForm();
				fetchUsers();
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to save user");
			}
		} catch (error) {
			toast.error("Failed to save user");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getRequiredFields = () => {
		const userType = formData.userType;
		const baseFields = ["name", "email"];

		if (!editingUser) {
			baseFields.push("password");
		}

		if (
			["veteran", "local_admin", "local_shop", "restaurant"].includes(
				userType
			)
		) {
			baseFields.push("place");
		}

		if (["veteran", "local_shop", "restaurant"].includes(userType)) {
			baseFields.push("phone");
		}

		if (["local_shop", "restaurant"].includes(userType)) {
			baseFields.push(
				"businessName",
				"businessDescription",
				"businessAddress",
				"businessPhone",
				"businessHours"
			);
		}

		if (userType === "veteran") {
			baseFields.push("description");
		}

		return baseFields;
	};

	const handleEdit = async (user: User) => {
		try {
			const response = await fetch(`/api/admin/users/${user._id}`);
			if (response.ok) {
				const data = await response.json();
				const userData = data.user;

				setFormData({
					name: userData.name,
					email: userData.email,
					password: "", // Clear password field for editing
					userType: userData.userType,
					place: userData.place?._id || "",
					phone: userData.phone || "",
					businessName: userData.businessName || "",
					businessDescription: userData.businessDescription || "",
					businessAddress: userData.businessAddress || "",
					businessPhone: userData.businessPhone || "",
					businessHours: userData.businessHours || "",
					description: userData.description || "",
					isActive: userData.isActive,
				});
				setEditingUser(user);
				setIsEditDialogOpen(true);
			} else {
				toast.error("Failed to fetch user details");
			}
		} catch (error) {
			toast.error("Failed to fetch user details");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/users/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("User deleted successfully");
				fetchUsers();
			} else {
				toast.error("Failed to delete user");
			}
		} catch (error) {
			toast.error("Failed to delete user");
		}
	};

	const handleStatusToggle = async (user: User) => {
		try {
			const response = await fetch(`/api/admin/users/${user._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					isActive: !user.isActive,
				}),
			});

			if (response.ok) {
				toast.success("User status updated");
				fetchUsers();
			} else {
				toast.error("Failed to update user status");
			}
		} catch (error) {
			toast.error("Failed to update user status");
		}
	};

	const formatUserType = (type: string) => {
		switch (type) {
			case "newbie":
				return "Newbie";
			case "veteran":
				return "Veteran";
			case "local_admin":
				return "Local Admin";
			case "admin":
				return "Admin";
			case "local_shop":
				return "Local Shop";
			case "restaurant":
				return "Restaurant";
			default:
				return type;
		}
	};

	return (
		<AdminLayout>
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">User Management</h1>
						<p className="text-muted-foreground">
							Manage users and their access
						</p>
					</div>
					<Dialog
						open={isAddDialogOpen}
						onOpenChange={(open) => {
							setIsAddDialogOpen(open);
							if (!open) resetForm();
						}}
					>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									resetForm();
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add User
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add New User</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="name"
											className="block mb-3"
										>
											Full Name *
										</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<Label
											htmlFor="email"
											className="block mb-3"
										>
											Email *
										</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({
													...formData,
													email: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="password"
											className="block mb-3"
										>
											Password *
										</Label>
										<Input
											id="password"
											type="password"
											value={formData.password}
											onChange={(e) =>
												setFormData({
													...formData,
													password: e.target.value,
												})
											}
											required={!editingUser}
											placeholder={
												editingUser
													? "Leave blank to keep current password"
													: ""
											}
										/>
									</div>
									<div>
										<Label
											htmlFor="userType"
											className="block mb-3"
										>
											User Type *
										</Label>
										<Select
											value={formData.userType}
											onValueChange={(value) =>
												setFormData({
													...formData,
													userType: value,
												})
											}
										>
											<SelectTrigger id="userType">
												<SelectValue placeholder="Select user type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="newbie">
													Newbie
												</SelectItem>
												<SelectItem value="veteran">
													Veteran
												</SelectItem>
												<SelectItem value="local_admin">
													Local Admin
												</SelectItem>
												<SelectItem value="admin">
													Admin
												</SelectItem>
												<SelectItem value="local_shop">
													Local Shop
												</SelectItem>
												<SelectItem value="restaurant">
													Restaurant
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{[
									"veteran",
									"local_admin",
									"local_shop",
									"restaurant",
								].includes(formData.userType) && (
									<div>
										<Label
											htmlFor="place"
											className="block mb-3"
										>
											Place *
										</Label>
										<Select
											value={formData.place}
											onValueChange={(value) =>
												setFormData({
													...formData,
													place: value,
												})
											}
										>
											<SelectTrigger id="place">
												<SelectValue placeholder="Select place" />
											</SelectTrigger>
											<SelectContent>
												{places.map((place) => (
													<SelectItem
														key={place._id}
														value={place._id}
													>
														{place.name} (
														{place.city},{" "}
														{place.state})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{[
									"veteran",
									"local_shop",
									"restaurant",
								].includes(formData.userType) && (
									<div>
										<Label
											htmlFor="phone"
											className="block mb-3"
										>
											Phone *
										</Label>
										<Input
											id="phone"
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value,
												})
											}
										/>
									</div>
								)}

								{formData.userType === "veteran" && (
									<div>
										<Label
											htmlFor="description"
											className="block mb-3"
										>
											Description *
										</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows={3}
										/>
									</div>
								)}

								{["local_shop", "restaurant"].includes(
									formData.userType
								) && (
									<>
										<div>
											<Label
												htmlFor="businessName"
												className="block mb-3"
											>
												Business Name *
											</Label>
											<Input
												id="businessName"
												value={formData.businessName}
												onChange={(e) =>
													setFormData({
														...formData,
														businessName:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="businessDescription"
												className="block mb-3"
											>
												Business Description *
											</Label>
											<Textarea
												id="businessDescription"
												value={
													formData.businessDescription
												}
												onChange={(e) =>
													setFormData({
														...formData,
														businessDescription:
															e.target.value,
													})
												}
												rows={3}
											/>
										</div>

										<div>
											<Label
												htmlFor="businessAddress"
												className="block mb-3"
											>
												Business Address *
											</Label>
											<Input
												id="businessAddress"
												value={formData.businessAddress}
												onChange={(e) =>
													setFormData({
														...formData,
														businessAddress:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="businessPhone"
												className="block mb-3"
											>
												Business Phone *
											</Label>
											<Input
												id="businessPhone"
												value={formData.businessPhone}
												onChange={(e) =>
													setFormData({
														...formData,
														businessPhone:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="businessHours"
												className="block mb-3"
											>
												Business Hours *
											</Label>
											<Input
												id="businessHours"
												value={formData.businessHours}
												onChange={(e) =>
													setFormData({
														...formData,
														businessHours:
															e.target.value,
													})
												}
												placeholder="e.g. Mon-Fri: 9AM-5PM, Sat: 10AM-3PM"
											/>
										</div>
									</>
								)}

								<div className="flex items-center space-x-2">
									<Switch
										id="isActive"
										checked={formData.isActive}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isActive: checked,
											})
										}
									/>
									<Label htmlFor="isActive">Active</Label>
								</div>

								<div className="flex justify-end space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											editingUser
												? setIsEditDialogOpen(false)
												: setIsAddDialogOpen(false)
										}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
									>
										{isSubmitting
											? "Saving..."
											: editingUser
											? "Update User"
											: "Save User"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					{/* Edit User Dialog - Reusing the same form with dialog state change */}
					<Dialog
						open={isEditDialogOpen}
						onOpenChange={(open) => {
							setIsEditDialogOpen(open);
							if (!open) resetForm();
						}}
					>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Edit User</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Form fields are the same as the Add form */}
								{/* This is intentionally duplicated for clarity, but reuses the same form state and handlers */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="edit-name"
											className="block mb-3"
										>
											Full Name *
										</Label>
										<Input
											id="edit-name"
											value={formData.name}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<Label
											htmlFor="edit-email"
											className="block mb-3"
										>
											Email *
										</Label>
										<Input
											id="edit-email"
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({
													...formData,
													email: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="edit-password"
											className="block mb-3"
										>
											Password
										</Label>
										<Input
											id="edit-password"
											type="password"
											value={formData.password}
											onChange={(e) =>
												setFormData({
													...formData,
													password: e.target.value,
												})
											}
											placeholder="Leave blank to keep current password"
										/>
									</div>
									<div>
										<Label
											htmlFor="edit-userType"
											className="block mb-3"
										>
											User Type *
										</Label>
										<Select
											value={formData.userType}
											onValueChange={(value) =>
												setFormData({
													...formData,
													userType: value,
												})
											}
										>
											<SelectTrigger id="edit-userType">
												<SelectValue placeholder="Select user type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="newbie">
													Newbie
												</SelectItem>
												<SelectItem value="veteran">
													Veteran
												</SelectItem>
												<SelectItem value="local_admin">
													Local Admin
												</SelectItem>
												<SelectItem value="admin">
													Admin
												</SelectItem>
												<SelectItem value="local_shop">
													Local Shop
												</SelectItem>
												<SelectItem value="restaurant">
													Restaurant
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{[
									"veteran",
									"local_admin",
									"local_shop",
									"restaurant",
								].includes(formData.userType) && (
									<div>
										<Label
											htmlFor="edit-place"
											className="block mb-3"
										>
											Place *
										</Label>
										<Select
											value={formData.place}
											onValueChange={(value) =>
												setFormData({
													...formData,
													place: value,
												})
											}
										>
											<SelectTrigger id="edit-place">
												<SelectValue placeholder="Select place" />
											</SelectTrigger>
											<SelectContent>
												{places.map((place) => (
													<SelectItem
														key={place._id}
														value={place._id}
													>
														{place.name} (
														{place.city},{" "}
														{place.state})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{[
									"veteran",
									"local_shop",
									"restaurant",
								].includes(formData.userType) && (
									<div>
										<Label
											htmlFor="edit-phone"
											className="block mb-3"
										>
											Phone *
										</Label>
										<Input
											id="edit-phone"
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value,
												})
											}
										/>
									</div>
								)}

								{formData.userType === "veteran" && (
									<div>
										<Label
											htmlFor="edit-description"
											className="block mb-3"
										>
											Description *
										</Label>
										<Textarea
											id="edit-description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows={3}
										/>
									</div>
								)}

								{["local_shop", "restaurant"].includes(
									formData.userType
								) && (
									<>
										<div>
											<Label
												htmlFor="edit-businessName"
												className="block mb-3"
											>
												Business Name *
											</Label>
											<Input
												id="edit-businessName"
												value={formData.businessName}
												onChange={(e) =>
													setFormData({
														...formData,
														businessName:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="edit-businessDescription"
												className="block mb-3"
											>
												Business Description *
											</Label>
											<Textarea
												id="edit-businessDescription"
												value={
													formData.businessDescription
												}
												onChange={(e) =>
													setFormData({
														...formData,
														businessDescription:
															e.target.value,
													})
												}
												rows={3}
											/>
										</div>

										<div>
											<Label
												htmlFor="edit-businessAddress"
												className="block mb-3"
											>
												Business Address *
											</Label>
											<Input
												id="edit-businessAddress"
												value={formData.businessAddress}
												onChange={(e) =>
													setFormData({
														...formData,
														businessAddress:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="edit-businessPhone"
												className="block mb-3"
											>
												Business Phone *
											</Label>
											<Input
												id="edit-businessPhone"
												value={formData.businessPhone}
												onChange={(e) =>
													setFormData({
														...formData,
														businessPhone:
															e.target.value,
													})
												}
											/>
										</div>

										<div>
											<Label
												htmlFor="edit-businessHours"
												className="block mb-3"
											>
												Business Hours *
											</Label>
											<Input
												id="edit-businessHours"
												value={formData.businessHours}
												onChange={(e) =>
													setFormData({
														...formData,
														businessHours:
															e.target.value,
													})
												}
												placeholder="e.g. Mon-Fri: 9AM-5PM, Sat: 10AM-3PM"
											/>
										</div>
									</>
								)}

								<div className="flex items-center space-x-2">
									<Switch
										id="edit-isActive"
										checked={formData.isActive}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isActive: checked,
											})
										}
									/>
									<Label htmlFor="edit-isActive">
										Active
									</Label>
								</div>

								<div className="flex justify-end space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setIsEditDialogOpen(false)
										}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
									>
										{isSubmitting
											? "Saving..."
											: "Update User"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Users
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.total}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Users
							</CardTitle>
							<UserCheck className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600">
								{stats.active}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Inactive Users
							</CardTitle>
							<UserX className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600">
								{stats.inactive}
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>All Users</CardTitle>
							<div className="flex items-center space-x-2">
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search users..."
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="pl-8 w-64"
									/>
								</div>
								<Select
									value={userTypeFilter}
									onValueChange={setUserTypeFilter}
								>
									<SelectTrigger className="w-36">
										<SelectValue placeholder="User Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Types
										</SelectItem>
										<SelectItem value="newbie">
											Newbie
										</SelectItem>
										<SelectItem value="veteran">
											Veteran
										</SelectItem>
										<SelectItem value="local_admin">
											Local Admin
										</SelectItem>
										<SelectItem value="admin">
											Admin
										</SelectItem>
										<SelectItem value="local_shop">
											Local Shop
										</SelectItem>
										<SelectItem value="restaurant">
											Restaurant
										</SelectItem>
									</SelectContent>
								</Select>
								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="true">
											Active
										</SelectItem>
										<SelectItem value="false">
											Inactive
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Profile</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>User Type</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Created</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user._id}>
												<TableCell>
													<Avatar className="h-10 w-10 border border-primary/10">
														{user.profilePicture ? (
															<AvatarImage src={user.profilePicture} alt={user.name} />
														) : (
															<AvatarFallback>
																{user.name.charAt(0).toUpperCase()}
															</AvatarFallback>
														)}
													</Avatar>
												</TableCell>
												<TableCell className="font-medium">
													{user.name}
												</TableCell>
												<TableCell>
													{user.email}
												</TableCell>
												<TableCell>
													{formatUserType(
														user.userType
													)}
												</TableCell>
												<TableCell>
													{user.place
														? `${user.place.city}, ${user.place.state}`
														: "N/A"}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															user.isActive
																? "default"
																: "secondary"
														}
														className="cursor-pointer"
														onClick={() =>
															handleStatusToggle(
																user
															)
														}
													>
														{user.isActive
															? "Active"
															: "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													{new Date(
														user.createdAt
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEdit(user)
															}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<AlertDialog>
															<AlertDialogTrigger
																asChild
															>
																<Button
																	variant="outline"
																	size="sm"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Delete
																		User
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you
																		sure you
																		want to
																		delete "
																		{
																			user.name
																		}
																		"? This
																		action
																		cannot
																		be
																		undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		Cancel
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleDelete(
																				user._id
																			)
																		}
																		className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																	>
																		Delete
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								{pagination.totalPages > 1 && (
									<div className="flex items-center justify-between mt-4">
										<p className="text-sm text-muted-foreground">
											Showing {users.length} of{" "}
											{pagination.total} users
										</p>
										<div className="flex items-center space-x-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setCurrentPage(
														currentPage - 1
													)
												}
												disabled={!pagination.hasPrev}
											>
												<ChevronLeft className="h-4 w-4" />
												Previous
											</Button>
											<span className="text-sm">
												Page {pagination.currentPage} of{" "}
												{pagination.totalPages}
											</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setCurrentPage(
														currentPage + 1
													)
												}
												disabled={!pagination.hasNext}
											>
												Next
												<ChevronRight className="h-4 w-4" />
											</Button>
										</div>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</AdminLayout>
	);
}
