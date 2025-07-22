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

interface VeteranEditProps {
	user: {
		id: string;
		name: string;
		email: string;
		phone?: string;
		description?: string;
	};
	onSave: (updatedUser: any) => void;
	onCancel: () => void;
}

const veteranSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		phone: z
			.string()
			.min(10, "Phone number must be at least 10 characters"),
		description: z
			.string()
			.min(10, "Description must be at least 10 characters"),
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

export default function VeteranEditForm({
	user,
	onSave,
	onCancel,
}: VeteranEditProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();

	const form = useForm({
		resolver: zodResolver(veteranSchema),
		defaultValues: {
			name: user.name || "",
			phone: user.phone || "",
			description: user.description || "",
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
				description: data.description,
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
				<CardTitle>Edit Profile</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
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
									<FormLabel>Phone</FormLabel>
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
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>About Your Services</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={4}
											placeholder="Describe your guiding services, experience, specialties, etc."
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
