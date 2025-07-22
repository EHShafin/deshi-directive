"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface BusinessEditProps {
	user: {
		id: string;
		name: string;
		email: string;
		userType: "local_shop" | "restaurant";
		phone?: string;
		businessName?: string;
		businessDescription?: string;
		businessAddress?: string;
		businessPhone?: string;
		businessHours?: string;
	};
	onSave: (updatedUser: any) => void;
	onCancel: () => void;
}

const businessSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		phone: z
			.string()
			.min(10, "Phone number must be at least 10 characters"),
		businessName: z
			.string()
			.min(2, "Business name must be at least 2 characters"),
		businessDescription: z
			.string()
			.min(10, "Business description must be at least 10 characters"),
		businessAddress: z
			.string()
			.min(5, "Business address must be at least 5 characters"),
		businessPhone: z
			.string()
			.min(10, "Business phone must be at least 10 characters"),
		businessHours: z.string().min(5, "Business hours must be specified"),
		currentPassword: z.string().optional(),
		newPassword: z.string().optional(),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.newPassword && data.newPassword.length > 0) {
				return data.newPassword.length >= 6;
			}
			return true;
		},
		{
			message: "Password must be at least 6 characters",
			path: ["newPassword"],
		}
	)
	.refine(
		(data) => {
			if (data.newPassword || data.confirmPassword) {
				return data.newPassword === data.confirmPassword;
			}
			return true;
		},
		{
			message: "Passwords don't match",
			path: ["confirmPassword"],
		}
	);

export default function BusinessEditForm({
	user,
	onSave,
	onCancel,
}: BusinessEditProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();

	const isRestaurant = user.userType === "restaurant";

	const form = useForm({
		resolver: zodResolver(businessSchema),
		defaultValues: {
			name: user.name || "",
			phone: user.phone || "",
			businessName: user.businessName || "",
			businessDescription: user.businessDescription || "",
			businessAddress: user.businessAddress || "",
			businessPhone: user.businessPhone || "",
			businessHours: user.businessHours || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			const updateData: any = {
				name: data.name,
				phone: data.phone,
				businessName: data.businessName,
				businessDescription: data.businessDescription,
				businessAddress: data.businessAddress,
				businessPhone: data.businessPhone,
				businessHours: data.businessHours,
			};

			if (data.newPassword && data.currentPassword) {
				updateData.currentPassword = data.currentPassword;
				updateData.newPassword = data.newPassword;
			}

			const response = await fetch("/api/auth/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Update failed");
			}

			const result = await response.json();
			login(result.user);
			onSave(result.user);
			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Profile update error:", error);
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update profile"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Edit {isRestaurant ? "Restaurant" : "Business"} Profile
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="grid gap-4">
							<h3 className="text-sm font-medium border-b pb-2">
								Personal Information
							</h3>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Owner Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Personal Phone</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g., +8801234567890"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4">
							<h3 className="text-sm font-medium border-b pb-2">
								{isRestaurant ? "Restaurant" : "Business"}{" "}
								Information
							</h3>

							<FormField
								control={form.control}
								name="businessName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{isRestaurant
												? "Restaurant"
												: "Business"}{" "}
											Name
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="businessDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={4}
												placeholder={
													isRestaurant
														? "Describe your cuisine, specialties, atmosphere, etc."
														: "Describe your products, services, specialties, etc."
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="businessAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={2}
												placeholder="Full business address"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="businessPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business Phone</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="e.g., +8801234567890"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="businessHours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Business Hours</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												rows={3}
												placeholder="e.g., Mon-Fri: 9:00 AM - 8:00 PM&#10;Sat-Sun: 10:00 AM - 6:00 PM"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4 pt-4 border-t">
							<h3 className="text-sm font-medium">
								Change Password (Optional)
							</h3>

							<FormField
								control={form.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>New Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Confirm New Password
										</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex gap-2 pt-4">
							<Button type="submit" disabled={isLoading}>
								<Save className="h-4 w-4 mr-2" />
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isLoading}
							>
								<X className="h-4 w-4 mr-2" />
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
