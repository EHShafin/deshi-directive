import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	const { pathname } = request.nextUrl;

	if (pathname === "/signin" || pathname === "/signup") {
		if (token) {
			try {
				jwt.verify(token, process.env.JWT_SECRET!);
				return NextResponse.redirect(new URL("/", request.url));
			} catch {
				return NextResponse.next();
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/signin", "/signup", "/dashboard/:path*"],
};
