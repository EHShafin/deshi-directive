import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center">
			<main className="container mx-auto px-4 py-8">
				<div className="text-center space-y-6">
					<h1 className="text-4xl md:text-6xl font-bold text-foreground">
						Welcome to Deshi Directive
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Discover amazing places, local cuisine, and hidden gems.
						Your ultimate guide to exploring Bangladesh.
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Button asChild size="lg">
							<Link href="/users">Browse Service Providers</Link>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
