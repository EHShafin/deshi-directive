"use client";

import { AdminLayout } from "@/components/AdminLayout";

export default function AdminSettings() {
	return (
		<AdminLayout>
			<div className="p-6">
				<h1 className="text-2xl font-semibold">Settings</h1>
				<p className="text-muted-foreground">
					Manage global admin settings here
				</p>
			</div>
		</AdminLayout>
	);
}
