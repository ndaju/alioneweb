import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/mail-landing"]);

const MAIL_HOSTS = ["mail.alione.cc", "alimail.alione.cc"];

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  const isMailHost = MAIL_HOSTS.some(h => host.startsWith(h));

  if (isMailHost) {
    // Let API, static files, and landing page pass through
    if (
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/_next") ||
      url.pathname.startsWith("/favicon") ||
      url.pathname.startsWith("/mail-landing") ||
      url.pathname.match(/\.(png|jpg|ico|svg|css|js)$/)
    ) {
      return NextResponse.next();
    }

    const { userId } = await auth();

    // If not signed in, show landing at root
    if (!userId) {
      if (url.pathname === "/") {
        url.pathname = "/mail-landing";
        return NextResponse.rewrite(url);
      }
      if (!url.pathname.startsWith("/sign-in") && !url.pathname.startsWith("/sign-up")) {
        const signInUrl = new URL("/sign-in", url.origin);
        signInUrl.searchParams.set("redirect_url", "/dashboard/mail");
        return NextResponse.redirect(signInUrl);
      }
      return NextResponse.next();
    }

    // If signed in, rewrite to appropriate route
    const isDashboardRoute = url.pathname.startsWith("/dashboard/mail");
    if (!isDashboardRoute) {
      // Preserve admin path
      if (url.pathname === "/admin" || url.pathname.startsWith("/admin")) {
        url.pathname = "/dashboard/mail/admin";
      } else {
        url.pathname = "/dashboard/mail";
      }
      return NextResponse.rewrite(url);
    }
  }

  // Clerk auth: protect non-public routes for all domains
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
