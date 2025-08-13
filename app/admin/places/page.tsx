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
import { FileUpload } from "@/components/ui/file-upload";
import { UploadedFile } from "@/hooks/use-file-upload";
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
	MapPin,
	Eye,
	EyeOff,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

interface Place {
	_id: string;
	name: string;
	description: string;
	city: string;
	state: string;
	country: string;
	image: string;
	isActive: boolean;
	createdAt: string;
}

interface PlacesResponse {
	places: Place[];
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

export default function AdminPlaces() {
	const [places, setPlaces] = useState<Place[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
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
	const [editingPlace, setEditingPlace] = useState<Place | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		city: "",
		state: "",
		country: "Bangladesh",
		image: "",
		isActive: true,
	});
	const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isImageUploading, setIsImageUploading] = useState(false);

	useEffect(() => {
		fetchPlaces();
	}, [searchTerm, statusFilter, currentPage]);

	const fetchPlaces = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: "10",
				...(searchTerm && { search: searchTerm }),
				...(statusFilter !== "all" && { isActive: statusFilter }),
			});

			const response = await fetch(`/api/admin/places?${params}`);
			if (response.ok) {
				const data: PlacesResponse = await response.json();
				setPlaces(data.places);
				setPagination(data.pagination);
				setStats(data.stats);
			} else {
				toast.error("Failed to fetch places");
			}
		} catch (error) {
			toast.error("Failed to fetch places");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			city: "",
			state: "",
			country: "Bangladesh",
			image: "",
			isActive: true,
		});
		setUploadedImages([]);
		setEditingPlace(null);
		setIsImageUploading(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting || isImageUploading) return;

		const imageUrl = uploadedImages[0]?.secure_url || formData.image || "";

		const submitData = {
			...formData,
			image: imageUrl,
		};

		setIsSubmitting(true);
		try {
			const url = editingPlace
				? `/api/admin/places/${editingPlace._id}`
				: "/api/admin/places";
			const method = editingPlace ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				toast.success(
					editingPlace
						? "Place updated successfully"
						: "Place created successfully"
				);
				if (editingPlace) {
					setIsEditDialogOpen(false);
				} else {
					setIsAddDialogOpen(false);
				}
				resetForm();
				fetchPlaces();
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to save place");
			}
		} catch (error) {
			toast.error("Failed to save place");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (place: Place) => {
		setFormData({
			name: place.name,
			description: place.description,
			city: place.city,
			state: place.state,
			country: place.country,
			image: place.image,
			isActive: place.isActive,
		});
		setEditingPlace(place);
		setIsEditDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/places/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Place deleted successfully");
				fetchPlaces();
			} else {
				toast.error("Failed to delete place");
			}
		} catch (error) {
			toast.error("Failed to delete place");
		}
	};

	const handleStatusToggle = async (place: Place) => {
		try {
			const response = await fetch(`/api/admin/places/${place._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...place,
					isActive: !place.isActive,
				}),
			});

			if (response.ok) {
				toast.success("Place status updated");
				fetchPlaces();
			} else {
				toast.error("Failed to update place status");
			}
		} catch (error) {
			toast.error("Failed to update place status");
		}
	};

	return (
		<AdminLayout>
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Place Management</h1>
						<p className="text-muted-foreground">
							Manage destinations and tourist places
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
									resetForm(); // Reset form data before opening the dialog
								}}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Place
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add New Place</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="name"
											className="block mb-3"
										>
											Place Name *
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
											htmlFor="country"
											className="block mb-3"
										>
											Country *
										</Label>
										<Input
											id="country"
											value={formData.country}
											onChange={(e) =>
												setFormData({
													...formData,
													country: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="state"
											className="block mb-3"
										>
											State/Division *
										</Label>
										<Input
											id="state"
											value={formData.state}
											onChange={(e) =>
												setFormData({
													...formData,
													state: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<Label
											htmlFor="city"
											className="block mb-3"
										>
											City *
										</Label>
										<Input
											id="city"
											value={formData.city}
											onChange={(e) =>
												setFormData({
													...formData,
													city: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

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
										rows={4}
										required
									/>
								</div>

								<div>
									<Label className="block mb-2">
										Place Image
									</Label>
									<FileUpload
										value={uploadedImages}
										onChange={(files) => {
											// Only keep the latest uploaded image
											setUploadedImages(files.slice(-1));
										}}
										maxFiles={1}
										folder="places"
										placeholder={
											isImageUploading
												? "Uploading..."
												: "Upload place image"
										}
										showPreview={false}
										disabled={
											isImageUploading || isSubmitting
										}
										onUploadStart={() =>
											setIsImageUploading(true)
										}
										onUploadComplete={() =>
											setIsImageUploading(false)
										}
									/>
									{uploadedImages.length > 0 && (
										<div className="mt-2">
											<p className="text-sm text-muted-foreground mb-2">
												New image:
											</p>
											<img
												src={
													uploadedImages[0].secure_url
												}
												alt="New place"
												className="w-32 h-32 object-cover rounded border"
											/>
										</div>
									)}
								</div>

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
											setIsAddDialogOpen(false)
										}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={
											isSubmitting || isImageUploading
										}
									>
										{isSubmitting
											? "Saving..."
											: "Save Place"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					{/* Edit Place Dialog */}
					<Dialog
						open={isEditDialogOpen}
						onOpenChange={(open) => {
							setIsEditDialogOpen(open);
							if (!open) resetForm();
						}}
					>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Edit Place</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="edit-name"
											className="block mb-3"
										>
											Place Name *
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
											htmlFor="edit-country"
											className="block mb-3"
										>
											Country *
										</Label>
										<Input
											id="edit-country"
											value={formData.country}
											onChange={(e) =>
												setFormData({
													...formData,
													country: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label
											htmlFor="edit-state"
											className="block mb-3"
										>
											State/Division *
										</Label>
										<Input
											id="edit-state"
											value={formData.state}
											onChange={(e) =>
												setFormData({
													...formData,
													state: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<Label
											htmlFor="edit-city"
											className="block mb-3"
										>
											City *
										</Label>
										<Input
											id="edit-city"
											value={formData.city}
											onChange={(e) =>
												setFormData({
													...formData,
													city: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>

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
										rows={4}
										required
									/>
								</div>

								<div>
									<Label className="block mb-2">
										Place Image
									</Label>
									<FileUpload
										value={uploadedImages}
										onChange={(files) => {
											// Only keep the latest uploaded image
											setUploadedImages(files.slice(-1));
										}}
										maxFiles={1}
										folder="places"
										placeholder={
											isImageUploading
												? "Uploading..."
												: "Upload place image"
										}
										showPreview={false}
										disabled={
											isImageUploading || isSubmitting
										}
										onUploadStart={() =>
											setIsImageUploading(true)
										}
										onUploadComplete={() =>
											setIsImageUploading(false)
										}
									/>
									{uploadedImages.length > 0 ? (
										<div className="mt-2">
											<p className="text-sm text-muted-foreground mb-2">
												New image:
											</p>
											<img
												src={
													uploadedImages[0].secure_url
												}
												alt="New place"
												className="w-32 h-32 object-cover rounded border"
											/>
										</div>
									) : (
										formData.image && (
											<div className="mt-2">
												<p className="text-sm text-muted-foreground mb-2">
													Current image:
												</p>
												<img
													src={formData.image}
													alt="Current place"
													className="w-32 h-32 object-cover rounded border"
												/>
											</div>
										)
									)}
								</div>

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
										disabled={
											isSubmitting || isImageUploading
										}
									>
										{isSubmitting
											? "Saving..."
											: "Update Place"}
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
								Total Places
							</CardTitle>
							<MapPin className="h-4 w-4 text-muted-foreground" />
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
								Active Places
							</CardTitle>
							<Eye className="h-4 w-4 text-green-600" />
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
								Inactive Places
							</CardTitle>
							<EyeOff className="h-4 w-4 text-red-600" />
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
							<CardTitle>All Places</CardTitle>
							<div className="flex items-center space-x-2">
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search places..."
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="pl-8 w-64"
									/>
								</div>
								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<SelectTrigger className="w-32">
										<SelectValue />
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
											<TableHead>Image</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Created</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{places.map((place) => (
											<TableRow key={place._id}>
												<TableCell>
													<img
														src={place.image}
														alt={place.name}
														className="w-12 h-12 object-cover rounded"
													/>
												</TableCell>
												<TableCell className="font-medium">
													{place.name}
												</TableCell>
												<TableCell>
													{place.city}, {place.state}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															place.isActive
																? "default"
																: "secondary"
														}
														className="cursor-pointer"
														onClick={() =>
															handleStatusToggle(
																place
															)
														}
													>
														{place.isActive
															? "Active"
															: "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													{new Date(
														place.createdAt
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleEdit(
																	place
																)
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
																		Place
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		Are you
																		sure you
																		want to
																		delete "
																		{
																			place.name
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
																				place._id
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
											Showing {places.length} of{" "}
											{pagination.total} places
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
