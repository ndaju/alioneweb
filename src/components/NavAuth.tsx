"use client";

import { useAuth, UserButton } from "@clerk/nextjs";

const userButtonAppearance = {
  variables: {
    colorBackground: "#0a0a0a",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.5)",
    colorInputBackground: "rgba(255,255,255,0.05)",
    colorInputBorder: "rgba(255,255,255,0.1)",
    colorPrimary: "#ffffff",
    colorTextOnPrimary: "#000000",
    colorDanger: "#f87171",
  },
  elements: {
    avatarBox: "w-8 h-8 rounded-full",
    userButtonPopulatorCard:
      "bg-[#0a0a0a] border border-white/[0.06] shadow-2xl shadow-black/50 rounded-xl",
    userButtonPopulatorCardFooter: "hidden",
    userPreviewMainIdentifier: "text-white",
    userPreviewSecondaryIdentifier: "text-white/50",
    userButtonPopulatorActionButton:
      "text-white hover:bg-white/5 rounded-lg",
    userButtonPopulatorActionButtonText: "text-white",
    userButtonPopulatorActionButtonIcon: "text-white/50",
  },
};

export function NavAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="w-20 h-8" />;
  }

  if (isSignedIn) {
    return <UserButton appearance={userButtonAppearance as any} />;
  }

  return (
    <>
      <a href="/sign-in" className="nav-link nav-login">Sign In</a>
      <a href="/sign-up" className="btn btn-primary btn-sm">Sign Up</a>
    </>
  );
}

export function MobileNavAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="w-20 h-10" />;
  }

  if (isSignedIn) {
    return <UserButton appearance={userButtonAppearance as any} />;
  }

  return (
    <>
      <a href="/sign-in" className="mobile-link">Sign In</a>
      <a href="/sign-up" className="btn btn-primary">Sign Up</a>
    </>
  );
}
