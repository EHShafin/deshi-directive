"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && (!user || user.userType !== "admin")) {
			router.push("/");
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen max-h-[calc(100vh-57px)] items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user || user.userType !== "admin") {
		return null;
	}

	return (
		<div className="flex h-screen max-h-[calc(100vh-57px)] overflow-hidden">
			<AdminSidebar />
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
