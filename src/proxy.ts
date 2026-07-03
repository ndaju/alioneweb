import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  if (host.startsWith("mail.alione.cc")) {
    // Let API and static files pass through
    if (
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/_next") ||
      url.pathname.startsWith("/favicon") ||
      url.pathname.match(/\.(png|jpg|ico|svg|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // If not signed in and not already on sign-in, redirect to sign-in
    const { userId } = await auth();
    if (!userId && !url.pathname.startsWith("/sign-in") && !url.pathname.startsWith("/sign-up")) {
      const signInUrl = new URL("/sign-in", url.origin);
      signInUrl.searchParams.set("redirect_url", "/dashboard/mail");
      return NextResponse.redirect(signInUrl);
    }

    // If signed in, rewrite everything to /dashboard/mail
    if (url.pathname !== "/dashboard/mail") {
      url.pathname = "/dashboard/mail";
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
