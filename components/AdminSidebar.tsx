"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	MapPin,
	Menu,
	X,
	LayoutDashboard,
	Users,
	Store,
	Settings,
	LogOut,
	ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
	className?: string;
}

const sidebarItems = [
	{
		title: "Dashboard",
		href: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "Place Management",
		href: "/admin/places",
		icon: MapPin,
	},
	{
		title: "User Management",
		href: "/admin/users",
		icon: Users,
	},
	{
		title: "Business Management",
		href: "/admin/businesses",
		icon: Store,
	},
	{
		title: "Settings",
		href: "/admin/settings",
		icon: Settings,
	},
];

export function AdminSidebar({ className }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const pathname = usePathname();
	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		window.location.href = "/signin";
	};

	return (
		<div
			className={cn(
				"relative flex h-full flex-col border-r bg-background",
				isCollapsed ? "w-16" : "w-64",
				className
			)}
		>
			<div className="flex h-14 items-center justify-between px-4 border-b">
				{!isCollapsed && (
					<Link href="/admin" className="flex items-center space-x-2">
						<MapPin className="h-6 w-6 text-primary" />
						<span className="text-lg font-semibold">
							Admin Panel
						</span>
					</Link>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="h-8 w-8"
				>
					{isCollapsed ? (
						<Menu className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</Button>
			</div>

			<ScrollArea className="flex-1 px-3 py-4">
				<nav className="space-y-2">
					{sidebarItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Link key={item.href} href={item.href}>
								<Button
									variant={isActive ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										isCollapsed && "justify-center px-2"
									)}
									title={isCollapsed ? item.title : undefined}
								>
									<Icon className="h-4 w-4" />
									{!isCollapsed && (
										<span className="ml-2">
											{item.title}
										</span>
									)}
								</Button>
							</Link>
						);
					})}
				</nav>
			</ScrollArea>

			<div className="mt-auto p-3">
				<Separator className="mb-3" />
				<div className="space-y-2">
					<Link href="/">
						<Button
							variant="ghost"
							className={cn(
								"w-full justify-start",
								isCollapsed && "justify-center px-2"
							)}
							title={isCollapsed ? "Back to Site" : undefined}
						>
							<ChevronLeft className="h-4 w-4" />
							{!isCollapsed && (
								<span className="ml-2">Back to Site</span>
							)}
						</Button>
					</Link>
					<Button
						variant="ghost"
						onClick={handleLogout}
						className={cn(
							"w-full justify-start text-destructive hover:text-destructive",
							isCollapsed && "justify-center px-2"
						)}
						title={isCollapsed ? "Logout" : undefined}
					>
						<LogOut className="h-4 w-4" />
						{!isCollapsed && <span className="ml-2">Logout</span>}
					</Button>
				</div>
			</div>
		</div>
	);
}
