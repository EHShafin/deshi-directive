"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload, UploadedFile } from "@/hooks/use-file-upload";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	Plane,
	ArrowLeft,
	User as UserIcon,
	Phone,
	MapPin,
	Store,
	Users,
	UtensilsCrossed,
	UserCheck,
	Shield,
	ShieldCheck,
	Building,
	Clock,
	Upload,
} from "lucide-react";
import { toast } from "sonner";

type UserType =
	| "newbie"
	| "veteran"
	| "local_admin"
	| "admin"
	| "local_shop"
	| "restaurant";

interface Place {
	_id: string;
	name: string;
	city: string;
	state: string;
	country: string;
}

export default function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [userType, setUserType] = useState<UserType>("newbie");
	const [place, setPlace] = useState("");
	const [phone, setPhone] = useState("");
	const [businessName, setBusinessName] = useState("");
	const [businessDescription, setBusinessDescription] = useState("");
	const [businessAddress, setBusinessAddress] = useState("");
	const [businessPhone, setBusinessPhone] = useState("");
	const [businessHours, setBusinessHours] = useState("");
	const [description, setDescription] = useState("");
	const [profilePicture, setProfilePicture] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [placesLoading, setPlacesLoading] = useState(false);
	const [places, setPlaces] = useState<Place[]>([]);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const { login } = useAuth();
	const router = useRouter();

	// File upload hook
	const {
		uploadFiles,
		isUploading: isUploadingProfile,
		uploadedFiles,
	} = useFileUpload({
		folder: "profile_pictures",
		maxFiles: 1,
		acceptedFileTypes: ["image/jpeg", "image/png", "image/webp"],
		maxFileSize: 2 * 1024 * 1024, // 2MB
		onUploadComplete: (files: UploadedFile[]) => {
			if (files.length > 0) {
				setProfilePicture(files[0].secure_url);
				setErrors((prev) => ({ ...prev, profilePicture: "" }));
			}
		},
		onUploadError: (error: string) => {
			toast.error(error);
			setErrors((prev) => ({
				...prev,
				profilePicture: "Failed to upload profile picture",
			}));
		},
	});

	const userTypes = [
		{
			value: "newbie",
			label: "General User (Newbie)",
			description: "Explore Bangladesh and discover amazing places",
			category: "personal",
			icon: UserIcon,
			color: "bg-blue-100 text-blue-800",
		},
		{
			value: "veteran",
			label: "Tour Guide (Veteran)",
			description: "Provide tour guide services in your area",
			category: "personal",
			icon: UserCheck,
			color: "bg-green-100 text-green-800",
		},
		{
			value: "local_shop",
			label: "Local Shop",
			description: "Sell local products and souvenirs",
			category: "business",
			icon: Store,
			color: "bg-orange-100 text-orange-800",
		},
		{
			value: "restaurant",
			label: "Restaurant",
			description: "Provide food and dining services",
			category: "business",
			icon: UtensilsCrossed,
			color: "bg-yellow-100 text-yellow-800",
		},
	];

	useEffect(() => {
		if (["veteran", "local_shop", "restaurant"].includes(userType)) {
			fetchPlaces();
		}
	}, [userType]);

	const fetchPlaces = async () => {
		setPlacesLoading(true);
		try {
			const response = await fetch("/api/places");
			if (response.ok) {
				const data = await response.json();
				setPlaces(data.places);
			} else {
				toast.error("Failed to load places");
			}
		} catch (error) {
			toast.error("Failed to load places");
		} finally {
			setPlacesLoading(false);
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!name) {
			newErrors.name = "Name is required";
		} else if (name.length < 2) {
			newErrors.name = "Name must be at least 2 characters long";
		}

		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters long";
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!userType) {
			newErrors.userType = "Please select a user type";
		}

		if (["veteran", "local_shop", "restaurant"].includes(userType)) {
			if (!place) {
				newErrors.place = "Please select a place";
			}
			if (!phone) {
				newErrors.phone = "Phone number is required";
			} else if (phone.length < 10) {
				newErrors.phone = "Please enter a valid phone number";
			}

			if (userType === "veteran") {
				if (!description) {
					newErrors.description = "Description is required";
				} else if (description.length < 10) {
					newErrors.description =
						"Description must be at least 10 characters long";
				}
			}
		}

		if (["local_shop", "restaurant"].includes(userType)) {
			if (!businessName) {
				newErrors.businessName = "Business name is required";
			} else if (businessName.length < 2) {
				newErrors.businessName =
					"Business name must be at least 2 characters long";
			}

			if (!businessDescription) {
				newErrors.businessDescription =
					"Business description is required";
			} else if (businessDescription.length < 10) {
				newErrors.businessDescription =
					"Business description must be at least 10 characters long";
			}

			if (!businessAddress) {
				newErrors.businessAddress = "Business address is required";
			} else if (businessAddress.length < 5) {
				newErrors.businessAddress =
					"Business address must be at least 5 characters long";
			}

			if (!businessPhone) {
				newErrors.businessPhone = "Business phone is required";
			} else if (businessPhone.length < 10) {
				newErrors.businessPhone =
					"Please enter a valid business phone number";
			}

			if (!businessHours) {
				newErrors.businessHours = "Business hours are required";
			} else if (businessHours.length < 5) {
				newErrors.businessHours = "Please specify your business hours";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const requestData: any = {
				name,
				email,
				password,
				userType,
				profilePicture,
			};

			if (["veteran", "local_shop", "restaurant"].includes(userType)) {
				requestData.place = place;
				requestData.phone = phone;

				if (userType === "veteran") {
					requestData.description = description;
				}
			}

			if (["local_shop", "restaurant"].includes(userType)) {
				requestData.businessName = businessName;
				requestData.businessDescription = businessDescription;
				requestData.businessAddress = businessAddress;
				requestData.businessPhone = businessPhone;
				requestData.businessHours = businessHours;
			}

			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			const data = await response.json();

			if (response.ok) {
				login(data.user);
				toast.success(
					"Account created successfully! Welcome to Deshi Directive!"
				);
				router.push("/");
			} else {
				toast.error(data.error || "Sign up failed");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const selectedUserType = userTypes.find((type) => type.value === userType);
	const requiresLocationAndContact = [
		"veteran",
		"local_shop",
		"restaurant",
	].includes(userType);
	const requiresBusinessInfo = ["local_shop", "restaurant"].includes(
		userType
	);

	const bgImage =
		"https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";

	return (
		<div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4 bg-signup-bg bg-cover bg-center bg-no-repeat">
			<style jsx>{`
				.bg-signup-bg {
					background-image: linear-gradient(
							rgba(0, 0, 0, 0.4),
							rgba(0, 0, 0, 0.4)
						),
						url("${bgImage}");
				}
			`}</style>

			<div className="w-full max-w-2xl">
				<div className="mb-6">
					<Link
						href="/"
						className="inline-flex items-center text-white hover:text-white/80 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Home
					</Link>
				</div>

				<Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border/50">
					<CardHeader className="space-y-1 text-center">
						<div className="flex justify-center mb-4">
							<div className="p-3 bg-primary/10 rounded-full">
								<Plane className="h-8 w-8 text-primary" />
							</div>
						</div>
						<CardTitle className="text-2xl font-bold">
							Join Deshi Directive
						</CardTitle>
						<CardDescription>
							Create your account to start your journey
						</CardDescription>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-4">
								<div>
									<Label className="text-base font-medium">
										Choose Your Account Type
									</Label>
									<p className="text-sm text-muted-foreground mb-3">
										Select the type that best describes how
										you'll use Deshi Directive
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{userTypes.map((type) => (
											<div
												key={type.value}
												className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
													userType === type.value
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/50"
												}`}
												onClick={() => {
													setUserType(
														type.value as UserType
													);
													setPlace("");
													setPhone("");
													setBusinessName("");
													setBusinessDescription("");
													setBusinessAddress("");
													setBusinessPhone("");
													setBusinessHours("");
													setDescription("");
												}}
											>
												<div className="flex items-start space-x-3">
													<div
														className={`p-2 rounded-lg ${type.color}`}
													>
														<type.icon className="h-5 w-5" />
													</div>
													<div className="flex-1">
														<div className="flex items-center space-x-2 mb-1">
															<h3 className="font-medium text-sm">
																{type.label}
															</h3>
															<Badge
																variant="outline"
																className="text-xs"
															>
																{type.category}
															</Badge>
														</div>
														<p className="text-xs text-muted-foreground">
															{type.description}
														</p>
													</div>
													{userType ===
														type.value && (
														<div className="absolute top-2 right-2">
															<div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
																<div className="w-2 h-2 bg-white rounded-full"></div>
															</div>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
									{errors.userType && (
										<p className="text-sm text-destructive mt-2">
											{errors.userType}
										</p>
									)}
								</div>

								{selectedUserType && (
									<div className="p-4 bg-muted/30 rounded-lg border">
										<div className="flex items-center space-x-2 mb-2">
											<selectedUserType.icon className="h-4 w-4 text-primary" />
											<span className="font-medium text-sm">
												You selected:{" "}
												{selectedUserType.label}
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											{selectedUserType.description}
										</p>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<div className="relative">
									<UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="name"
										type="text"
										placeholder="Enter your full name"
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										className={`pl-10 ${
											errors.name
												? "border-destructive"
												: ""
										}`}
										disabled={isLoading}
									/>
								</div>
								{errors.name && (
									<p className="text-sm text-destructive">
										{errors.name}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label>Profile Picture</Label>
								<div className="flex items-center gap-4">
									<div className="border rounded-full overflow-hidden w-16 h-16 flex-shrink-0 bg-muted">
										<Avatar className="w-16 h-16">
											{profilePicture ? (
												<AvatarImage
													src={profilePicture}
													alt="Profile preview"
												/>
											) : (
												<AvatarFallback className="text-lg">
													{name
														? name
																.charAt(0)
																.toUpperCase()
														: "U"}
												</AvatarFallback>
											)}
										</Avatar>
									</div>
									<div className="flex-1">
										<Button
											type="button"
											variant="outline"
											className="w-full"
											disabled={
												isUploadingProfile || isLoading
											}
											onClick={() => {
												const input =
													document.createElement(
														"input"
													);
												input.type = "file";
												input.accept =
													"image/jpeg,image/png,image/webp";
												input.onchange = (e) => {
													const target =
														e.target as HTMLInputElement;
													if (
														target.files &&
														target.files.length > 0
													) {
														uploadFiles(
															Array.from(
																target.files
															)
														);
													}
												};
												input.click();
											}}
										>
											<Upload className="mr-2 h-4 w-4" />
											{isUploadingProfile
												? "Uploading..."
												: "Upload Photo"}
										</Button>
										<p className="text-xs text-muted-foreground mt-1">
											JPEG, PNG or WebP, max 2MB
										</p>
									</div>
								</div>
								{errors.profilePicture && (
									<p className="text-sm text-destructive">
										{errors.profilePicture}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className={`pl-10 ${
											errors.email
												? "border-destructive"
												: ""
										}`}
										disabled={isLoading}
									/>
								</div>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email}
									</p>
								)}
							</div>

							{requiresBusinessInfo && (
								<div className="space-y-4 p-4 border rounded-lg bg-muted/20">
									<div className="flex items-center space-x-2 mb-2">
										<Building className="h-4 w-4 text-primary" />
										<h3 className="font-medium">
											Business Information
										</h3>
									</div>

									<div className="space-y-2">
										<Label htmlFor="businessName">
											Business Name
										</Label>
										<div className="relative">
											<Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="businessName"
												type="text"
												placeholder="Enter your business name"
												value={businessName}
												onChange={(e) =>
													setBusinessName(
														e.target.value
													)
												}
												className={`pl-10 ${
													errors.businessName
														? "border-destructive"
														: ""
												}`}
												disabled={isLoading}
											/>
										</div>
										{errors.businessName && (
											<p className="text-sm text-destructive">
												{errors.businessName}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="businessDescription">
											Business Description
										</Label>
										<Textarea
											id="businessDescription"
											placeholder="Describe your business, what you offer, and what makes you unique..."
											value={businessDescription}
											onChange={(e) =>
												setBusinessDescription(
													e.target.value
												)
											}
											className={
												errors.businessDescription
													? "border-destructive"
													: ""
											}
											disabled={isLoading}
											rows={3}
										/>
										{errors.businessDescription && (
											<p className="text-sm text-destructive">
												{errors.businessDescription}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="businessAddress">
											Business Address
										</Label>
										<div className="relative">
											<MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="businessAddress"
												type="text"
												placeholder="Enter your full business address"
												value={businessAddress}
												onChange={(e) =>
													setBusinessAddress(
														e.target.value
													)
												}
												className={`pl-10 ${
													errors.businessAddress
														? "border-destructive"
														: ""
												}`}
												disabled={isLoading}
											/>
										</div>
										{errors.businessAddress && (
											<p className="text-sm text-destructive">
												{errors.businessAddress}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="businessPhone">
												Business Phone
											</Label>
											<div className="relative">
												<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="businessPhone"
													type="tel"
													placeholder="Business phone number"
													value={businessPhone}
													onChange={(e) =>
														setBusinessPhone(
															e.target.value
														)
													}
													className={`pl-10 ${
														errors.businessPhone
															? "border-destructive"
															: ""
													}`}
													disabled={isLoading}
												/>
											</div>
											{errors.businessPhone && (
												<p className="text-sm text-destructive">
													{errors.businessPhone}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="businessHours">
												Business Hours
											</Label>
											<div className="relative">
												<Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="businessHours"
													type="text"
													placeholder="e.g., Mon-Sun 9AM-9PM"
													value={businessHours}
													onChange={(e) =>
														setBusinessHours(
															e.target.value
														)
													}
													className={`pl-10 ${
														errors.businessHours
															? "border-destructive"
															: ""
													}`}
													disabled={isLoading}
												/>
											</div>
											{errors.businessHours && (
												<p className="text-sm text-destructive">
													{errors.businessHours}
												</p>
											)}
										</div>
									</div>
								</div>
							)}

							{requiresLocationAndContact && (
								<div className="space-y-4 p-4 border rounded-lg bg-muted/20">
									<div className="flex items-center space-x-2 mb-2">
										<MapPin className="h-4 w-4 text-primary" />
										<h3 className="font-medium">
											Location & Contact
										</h3>
									</div>

									<div className="space-y-2">
										<Label htmlFor="place">
											Select Your Service Location
										</Label>
										<Select
											value={place}
											onValueChange={setPlace}
											disabled={placesLoading}
										>
											<SelectTrigger
												className={
													errors.place
														? "border-destructive"
														: ""
												}
											>
												<SelectValue
													placeholder={
														placesLoading
															? "Loading places..."
															: "Select your service location"
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{places.map((placeOption) => (
													<SelectItem
														key={placeOption._id}
														value={placeOption._id}
													>
														<div className="flex items-center gap-2">
															<MapPin className="h-4 w-4" />
															<span>
																{
																	placeOption.name
																}
																,{" "}
																{
																	placeOption.city
																}
																,{" "}
																{
																	placeOption.state
																}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.place && (
											<p className="text-sm text-destructive">
												{errors.place}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="phone">
											Personal Phone Number
										</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="phone"
												type="tel"
												placeholder="Enter your phone number"
												value={phone}
												onChange={(e) =>
													setPhone(e.target.value)
												}
												className={`pl-10 ${
													errors.phone
														? "border-destructive"
														: ""
												}`}
												disabled={isLoading}
											/>
										</div>
										{errors.phone && (
											<p className="text-sm text-destructive">
												{errors.phone}
											</p>
										)}
									</div>

									{userType === "veteran" && (
										<div className="space-y-2">
											<Label htmlFor="description">
												About Your Tour Guide Services
											</Label>
											<Textarea
												id="description"
												placeholder="Describe the tour guide services you provide, your experience, and what makes your tours special..."
												value={description}
												onChange={(e) =>
													setDescription(
														e.target.value
													)
												}
												className={
													errors.description
														? "border-destructive"
														: ""
												}
												disabled={isLoading}
												rows={3}
											/>
											{errors.description && (
												<p className="text-sm text-destructive">
													{errors.description}
												</p>
											)}
										</div>
									)}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="Create a password"
											value={password}
											onChange={(e) =>
												setPassword(e.target.value)
											}
											className={`pl-10 pr-10 ${
												errors.password
													? "border-destructive"
													: ""
											}`}
											disabled={isLoading}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											disabled={isLoading}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
									{errors.password && (
										<p className="text-sm text-destructive">
											{errors.password}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">
										Confirm Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="confirmPassword"
											type={
												showConfirmPassword
													? "text"
													: "password"
											}
											placeholder="Confirm your password"
											value={confirmPassword}
											onChange={(e) =>
												setConfirmPassword(
													e.target.value
												)
											}
											className={`pl-10 pr-10 ${
												errors.confirmPassword
													? "border-destructive"
													: ""
											}`}
											disabled={isLoading}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() =>
												setShowConfirmPassword(
													!showConfirmPassword
												)
											}
											disabled={isLoading}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
									{errors.confirmPassword && (
										<p className="text-sm text-destructive">
											{errors.confirmPassword}
										</p>
									)}
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || placesLoading}
							>
								{isLoading
									? "Creating Account..."
									: "Create Account"}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<div className="text-sm text-center text-muted-foreground">
							Already have an account?{" "}
							<Link
								href="/signin"
								className="text-primary hover:underline"
							>
								Sign in here
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
