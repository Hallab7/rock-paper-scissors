import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log("Middleware running for path:", pathname);

  // Skip API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    console.log("Skipping API or _next route");
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  console.log("Token found:", !!token);

  if (!token && ["/", "/game", "/multiplayer", "/result"].includes(pathname)) {
    console.log("No token and protected route, redirecting to login");
    return NextResponse.redirect(new URL("/landing-page", req.url));
  }

  if (token) {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set in environment");
      return NextResponse.redirect(new URL("/landing-page", req.url));
    }

    try {
      // jwtVerify requires a Uint8Array key
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      console.log("Token valid");
      return NextResponse.next();
    } catch (err) {
      console.log("Invalid token, redirecting to login", err.message);
      return NextResponse.redirect(new URL("/landing-page", req.url));
    }
  }

  console.log("No token and not a protected route, proceeding");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/game", "/multiplayer", "/result"],
};
