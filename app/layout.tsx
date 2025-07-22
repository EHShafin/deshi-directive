import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Header from "@/components/Header";

export const metadata: Metadata = {
	title: "Deshi Directive",
	description: "One stop solution for all your travel needs",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>
				<AuthProvider>
					<Header />
					{children}
					<Toaster position="top-right" richColors />
				</AuthProvider>
			</body>
		</html>
	);
}
