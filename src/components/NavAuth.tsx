"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function NavAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 rounded-full",
          },
        }}
      />
    );
  }

  return (
    <>
      <Link href="/sign-in" className="nav-link nav-login">Sign In</Link>
      <Link href="/sign-up" className="btn btn-primary btn-sm">Sign Up</Link>
    </>
  );
}

export function MobileNavAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8 rounded-full",
          },
        }}
      />
    );
  }

  return (
    <>
      <Link href="/sign-in" className="mobile-link">Sign In</Link>
      <Link href="/sign-up" className="btn btn-primary">Sign Up</Link>
    </>
  );
}
