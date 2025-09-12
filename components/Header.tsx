"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Plane, UserCircle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Header() {
	const { user, logout, isLoading } = useAuth();
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			toast.success("Logged out successfully");
			setIsMobileMenuOpen(false);
			// redirect to sign in page after logout
			router.push("/signin");
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
					<Link href="/places">
						<span className="text-sm text-muted-foreground hover:text-foreground">
							Places
						</span>
					</Link>
					<Link href="/users">
						<span className="text-sm text-muted-foreground hover:text-foreground">
							Browse
						</span>
					</Link>
					{isLoading ? (
						<div className="flex items-center space-x-4">
							<div className="h-9 w-9 rounded bg-muted" />
							<div className="h-4 w-32 rounded bg-muted" />
						</div>
					) : user ? (
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
					{/* My Orders link for signed-in customers only */}
					{user &&
						(user.userType === "newbie" ||
							user.userType === "veteran") && (
							<Link
								href="/profile/orders"
								className="hidden items-center gap-2 md:flex ml-4"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M3 3h18v4H3zM5 11h14v10H5z"
									/>
								</svg>
								<span className="font-medium">My Orders</span>
							</Link>
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
							{isLoading ? (
								<div className="pb-2">
									<div className="h-10 w-10 rounded bg-muted mb-2" />
									<div className="h-4 w-40 rounded bg-muted" />
								</div>
							) : user ? (
								<div>
									<Link href="/places">
										<Button variant="ghost" size="sm">
											Places
										</Button>
									</Link>

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
										{user &&
											(user.userType === "newbie" ||
												user.userType ===
													"veteran") && (
												<Link
													href="/profile/orders"
													onClick={() =>
														setIsMobileMenuOpen(
															false
														)
													}
												>
													<Button
														variant="ghost"
														size="sm"
														className="w-full justify-start"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-4 w-4 mr-2"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M3 3h18v4H3zM5 11h14v10H5z"
															/>
														</svg>
														My Orders
													</Button>
												</Link>
											)}
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
								</div>
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
