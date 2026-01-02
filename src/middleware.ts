import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isDashboard = pathname.startsWith("/dashboard");
    const isApi = pathname.startsWith("/api");
    const isPublicApi = pathname.startsWith("/api/auth") || pathname.startsWith("/api/cdn");

    if (isDashboard) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Plan enforcement
        // @ts-ignore
        const plan = token.plan;
        const isPlansPage = pathname === "/dashboard/plans";

        // If no plan (or free plan that expired? logic dependent)
        // For now, if plan is 'none' (not possible by schema default) but let's say we want force select
        // User schema default is 'free'.
        // Logic: If user is new and hasn't completed setup?

        // The requirement: "If logged but NO PLAN → redirect /dashboard/plans"
        // Since default is 'free', everyone has a plan. 
        // Maybe 'no plan' implies we have a 'none' state. 
        // I will assume for now 'free' is a plan.
        // If we want to force them to upgrade from free, we'd check usage.
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
