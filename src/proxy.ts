import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  // mail.alione.cc subdomain → rewrite to /dashboard/mail
  if (host.startsWith("mail.alione.cc")) {
    // Let sign-in, sign-up, API, and static files pass through
    if (
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/_next") ||
      url.pathname.startsWith("/favicon") ||
      url.pathname.match(/\.(png|jpg|ico|svg|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Rewrite root to /dashboard/mail
    if (url.pathname === "/" || url.pathname !== "/dashboard/mail") {
      url.pathname = "/dashboard/mail";
      return NextResponse.rewrite(url);
    }
  }

  // Clerk auth protection for non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
