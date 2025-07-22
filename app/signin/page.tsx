"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, Plane, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const { login } = useAuth();
	const router = useRouter();

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				login(data.user);
				toast.success("Welcome back!");
				router.push("/");
			} else {
				toast.error(data.error || "Sign in failed");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const bgImage =
		"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";

	return (
		<div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4 bg-signin-bg bg-cover bg-center bg-no-repeat">
			<style jsx>{`
				.bg-signin-bg {
					background-image: linear-gradient(
							rgba(0, 0, 0, 0.4),
							rgba(0, 0, 0, 0.4)
						),
						url("${bgImage}");
				}
			`}</style>
			<div className="w-full max-w-md">
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
							Welcome Back
						</CardTitle>
						<CardDescription>
							Sign in to your Deshi Directive account
						</CardDescription>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
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

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Enter your password"
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

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? "Signing In..." : "Sign In"}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<div className="text-sm text-center text-muted-foreground">
							Don't have an account?{" "}
							<Link
								href="/signup"
								className="text-primary hover:underline"
							>
								Sign up here
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
