import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	const { pathname } = request.nextUrl;

	if (pathname === "/signin" || pathname === "/signup") {
		if (token) {
			try {
				await decode({ token, secret: process.env.JWT_SECRET! });
				return NextResponse.redirect(new URL("/", request.url));
			} catch {
				return NextResponse.next();
			}
		}
	}

	if (pathname.startsWith("/admin")) {
		if (!token) {
			return NextResponse.redirect(new URL("/signin", request.url));
		}

		try {
			const decoded = await decode({
				token,
				secret: process.env.JWT_SECRET!,
			});
			if (!decoded || decoded.userType !== "admin") {
				return NextResponse.redirect(new URL("/", request.url));
			}
		} catch (error) {
			console.error(error);
			return NextResponse.redirect(new URL("/signin", request.url));
		}
	}

	if (pathname.startsWith("/seller")) {
		if (!token) {
			return NextResponse.redirect(new URL("/signin", request.url));
		}

		try {
			const decoded = await decode({
				token,
				secret: process.env.JWT_SECRET!,
			});
			if (
				!decoded ||
				!["local_shop", "restaurant"].includes(
					(decoded as any).userType as string
				)
			) {
				return NextResponse.redirect(new URL("/", request.url));
			}
		} catch (error) {
			return NextResponse.redirect(new URL("/signin", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/signin", "/signup", "/admin/:path*", "/seller/:path*"],
};
