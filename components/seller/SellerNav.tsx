"use client";

import Link from "next/link";

export default function SellerNav() {
	const links = [
		{ href: "/seller", label: "Dashboard" },
		{ href: "/seller/products", label: "Products" },
		{ href: "/seller/orders", label: "Orders" },
		{ href: "/seller/inventory", label: "Inventory" },
		{ href: "/seller/settings", label: "Settings" },
	];
	return (
		<nav className="mb-4 flex gap-3 flex-wrap">
			{links.map((l) => (
				<Link
					key={l.href}
					href={l.href}
					className="text-sm px-3 py-1.5 border rounded hover:bg-muted"
				>
					{l.label}
				</Link>
			))}
		</nav>
	);
}
