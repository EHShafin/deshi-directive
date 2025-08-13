"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Store, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
	return (
		<AdminLayout>
			<div className="p-6 space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome to the Deshi Directive admin panel
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Places
							</CardTitle>
							<MapPin className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Managed destinations
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Users
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Registered users
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Businesses
							</CardTitle>
							<Store className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Active businesses
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Growth
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">+0%</div>
							<p className="text-xs text-muted-foreground">
								From last month
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								No recent activity
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-sm text-muted-foreground">
								Manage your platform from the sidebar navigation
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</AdminLayout>
	);
}
