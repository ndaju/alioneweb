"use client";

import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

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
      <SignInButton mode="redirect">
        <button className="nav-link nav-login">Sign In</button>
      </SignInButton>
      <SignUpButton mode="redirect">
        <button className="btn btn-primary btn-sm">Sign Up</button>
      </SignUpButton>
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
      <SignInButton mode="redirect">
        <button className="mobile-link">Sign In</button>
      </SignInButton>
      <SignUpButton mode="redirect">
        <button className="btn btn-primary">Sign Up</button>
      </SignUpButton>
    </>
  );
}
