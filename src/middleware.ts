import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Specify that this middleware uses Node.js runtime
export const runtime = 'nodejs';

async function checkUserRole(userId: string): Promise<string | null> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select('role status').lean();
    if (!user) return null;
    if (user.status !== 'active') return null;
    return user.role as string;
  } catch (error) {
    console.error('Middleware: Error checking user role:', error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api");
  const isPublicApi = pathname.startsWith("/api/auth") || pathname.startsWith("/api/cdn");

  if (isDashboard) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Admin route protection - check from database
  if (isAdmin && !pathname.startsWith("/admin/api")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Fetch role from database
    const role = await checkUserRole(token.sub as string);
    
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};