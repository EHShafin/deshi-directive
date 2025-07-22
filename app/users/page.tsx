"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Store, Shield, Search, MapPin } from "lucide-react";

interface UserListItem {
	id: string;
	name: string;
	userType:
		| "newbie"
		| "veteran"
		| "local_admin"
		| "admin"
		| "local_shop"
		| "restaurant";
	businessName?: string;
	place?: {
		_id: string;
		name: string;
		city: string;
		state: string;
		country: string;
	};
	createdAt: string;
}

interface UsersResponse {
	users: UserListItem[];
	totalPages: number;
	currentPage: number;
	total: number;
}

export default function UsersPage() {
	const [users, setUsers] = useState<UserListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedType, setSelectedType] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const userTypes = [
		{ value: "all", label: "All Users" },
		{ value: "veteran", label: "Tour Guides" },
		{ value: "local_shop", label: "Local Shops" },
		{ value: "restaurant", label: "Restaurants" },
		{ value: "newbie", label: "Explorers" },
	];

	const fetchUsers = async (page = 1) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "12",
				...(selectedType !== "all" && { type: selectedType }),
				...(searchTerm && { search: searchTerm }),
			});

			const response = await fetch(`/api/users?${params}`);
			if (response.ok) {
				const data: UsersResponse = await response.json();
				setUsers(data.users);
				setTotalPages(data.totalPages);
				setCurrentPage(data.currentPage);
			}
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setCurrentPage(1);
			fetchUsers(1);
		}, 300);

		return () => clearTimeout(debounceTimer);
	}, [searchTerm, selectedType]);

	useEffect(() => {
		if (currentPage > 1) {
			fetchUsers(currentPage);
		}
	}, [currentPage]);

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

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Browse Users</h1>
				<p className="text-muted-foreground">
					Connect with tour guides, local businesses, and fellow
					explorers
				</p>
			</div>

			<div className="mb-6 space-y-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search users or businesses..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					{userTypes.map((type) => (
						<Button
							key={type.value}
							variant={
								selectedType === type.value
									? "default"
									: "outline"
							}
							size="sm"
							onClick={() => setSelectedType(type.value)}
						>
							{type.label}
						</Button>
					))}
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
								<div className="h-3 bg-gray-200 rounded w-1/2"></div>
							</CardHeader>
							<CardContent>
								<div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-2/3"></div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{users.map((user) => {
							const typeInfo = getUserTypeDisplay(user.userType);
							const IconComponent = typeInfo.icon;

							return (
								<Link key={user.id} href={`/users/${user.id}`}>
									<Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
										<CardHeader>
											<div className="flex items-start justify-between">
												<CardTitle className="flex items-center gap-2">
													<IconComponent className="h-5 w-5 text-primary" />
													<span className="truncate">
														{user.businessName ||
															user.name}
													</span>
												</CardTitle>
												<Badge
													className={typeInfo.color}
												>
													{typeInfo.label}
												</Badge>
											</div>
											{user.businessName && (
												<p className="text-sm text-muted-foreground">
													by {user.name}
												</p>
											)}
										</CardHeader>
										<CardContent>
											{user.place && (
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<MapPin className="h-4 w-4" />
													<span className="truncate">
														{user.place.city},{" "}
														{user.place.state}
													</span>
												</div>
											)}
										</CardContent>
									</Card>
								</Link>
							);
						})}
					</div>

					{totalPages > 1 && (
						<div className="flex justify-center gap-2">
							<Button
								variant="outline"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(currentPage - 1)}
							>
								Previous
							</Button>
							<span className="px-4 py-2 text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(currentPage + 1)}
							>
								Next
							</Button>
						</div>
					)}

					{users.length === 0 && (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								No users found
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
