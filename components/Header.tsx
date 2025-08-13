"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Plane, UserCircle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Header() {
	const { user, logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			toast.success("Logged out successfully");
			setIsMobileMenuOpen(false);
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 items-center justify-between px-4">
				<Link href="/" className="flex items-center space-x-2">
					<Plane className="h-6 w-6 text-primary" />
					<span className="text-xl font-bold text-foreground">
						Deshi Directive
					</span>
				</Link>

				<div className="hidden md:flex items-center space-x-4">
					{user ? (
						<div className="flex items-center space-x-4">
							<Avatar className="h-9 w-9 border-2 border-primary/10">
								{user.profilePicture ? (
									<AvatarImage
										src={user.profilePicture}
										alt={user.name}
									/>
								) : (
									<AvatarFallback>
										{user.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex flex-col text-sm">
								<span className="text-foreground font-medium">
									Welcome, {user.name}
								</span>
								<span className="text-xs text-muted-foreground capitalize">
									{user.userType === "local_shop"
										? "Local Shop"
										: user.userType === "local_admin"
										? "Local Admin"
										: user.userType === "newbie"
										? "Explorer"
										: user.userType === "veteran"
										? "Tour Guide"
										: user.userType === "restaurant"
										? "Restaurant"
										: user.userType === "admin"
										? "Administrator"
										: user.userType}
									{user.place &&
										` • ${user.place.city}, ${user.place.state}`}
								</span>
							</div>
							{user.userType === "admin" && (
								<Link href="/admin">
									<Button variant="ghost" size="sm">
										<Shield className="h-4 w-4 mr-2" />
										Admin Panel
									</Button>
								</Link>
							)}
							{(user.userType === "local_shop" ||
								user.userType === "restaurant") && (
								<Link href="/seller">
									<Button variant="ghost" size="sm">
										<Shield className="h-4 w-4 mr-2" />
										Seller
									</Button>
								</Link>
							)}
							<Link href="/profile">
								<Button variant="ghost" size="sm">
									<UserCircle className="h-4 w-4 mr-2" />
									Profile
								</Button>
							</Link>
							<Button
								onClick={handleLogout}
								variant="outline"
								size="sm"
							>
								<LogOut className="h-4 w-4 mr-2" />
								Logout
							</Button>
						</div>
					) : (
						<div className="flex items-center space-x-2">
							<Link href="/signin">
								<Button variant="ghost" size="sm">
									Sign In
								</Button>
							</Link>
							<Link href="/signup">
								<Button size="sm">Sign Up</Button>
							</Link>
						</div>
					)}
				</div>

				<div className="md:hidden">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMobileMenu}
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</Button>
				</div>
			</div>

			{isMobileMenuOpen && (
				<div className="md:hidden border-t bg-background">
					<div className="container mx-auto px-4 py-4">
						<div className="space-y-3">
							{user ? (
								<>
									<div className="flex items-center space-x-3 pb-2">
										<Avatar className="h-10 w-10 border-2 border-primary/10">
											{user.profilePicture ? (
												<AvatarImage
													src={user.profilePicture}
													alt={user.name}
												/>
											) : (
												<AvatarFallback>
													{user.name
														.charAt(0)
														.toUpperCase()}
												</AvatarFallback>
											)}
										</Avatar>
										<div className="space-y-1">
											<p className="text-sm font-medium text-foreground">
												Welcome, {user.name}
											</p>
											<p className="text-xs text-muted-foreground capitalize">
												{user.userType === "local_shop"
													? "Local Shop"
													: user.userType ===
													  "local_admin"
													? "Local Admin"
													: user.userType === "newbie"
													? "Explorer"
													: user.userType ===
													  "veteran"
													? "Tour Guide"
													: user.userType ===
													  "restaurant"
													? "Restaurant"
													: user.userType === "admin"
													? "Administrator"
													: user.userType}
												{user.place &&
													` • ${user.place.city}, ${user.place.state}`}
											</p>
										</div>
									</div>
									<div className="space-y-2">
										{user.userType === "admin" && (
											<Link
												href="/admin"
												onClick={() =>
													setIsMobileMenuOpen(false)
												}
											>
												<Button
													variant="ghost"
													size="sm"
													className="w-full justify-start"
												>
													<Shield className="h-4 w-4 mr-2" />
													Admin Panel
												</Button>
											</Link>
										)}
										{(user.userType === "local_shop" ||
											user.userType === "restaurant") && (
											<Link
												href="/seller"
												onClick={() =>
													setIsMobileMenuOpen(false)
												}
											>
												<Button
													variant="ghost"
													size="sm"
													className="w-full justify-start"
												>
													<Shield className="h-4 w-4 mr-2" />
													Seller
												</Button>
											</Link>
										)}
										<Link
											href="/profile"
											onClick={() =>
												setIsMobileMenuOpen(false)
											}
										>
											<Button
												variant="ghost"
												size="sm"
												className="w-full justify-start"
											>
												<UserCircle className="h-4 w-4 mr-2" />
												Profile
											</Button>
										</Link>
										<Button
											onClick={handleLogout}
											variant="outline"
											size="sm"
											className="w-full justify-start"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Logout
										</Button>
									</div>
								</>
							) : (
								<div className="space-y-2">
									<Link
										href="/signin"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
									>
										<Button
											variant="ghost"
											size="sm"
											className="w-full justify-start"
										>
											Sign In
										</Button>
									</Link>
									<Link
										href="/signup"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
									>
										<Button
											size="sm"
											className="w-full justify-start"
										>
											Sign Up
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
