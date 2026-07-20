"use client";

import { useAuth } from "@clerk/nextjs";

export function HeroAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <a href="/dashboard" className="btn btn-primary btn-lg">
          Dashboard
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <a href="https://alimail.alione.cc" className="btn btn-secondary btn-lg">
          Open Mail
        </a>
      </>
    );
  }

  return (
    <>
      <a href="/sign-up" className="btn btn-primary btn-lg">
        Get Started
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
      <a href="/sign-in" className="btn btn-secondary btn-lg">
        Sign In
      </a>
    </>
  );
}

export function MobileHeroAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <a href="/dashboard" className="btn btn-primary">Dashboard</a>
        <a href="https://alimail.alione.cc" className="btn btn-secondary">Open Mail</a>
      </>
    );
  }

  return (
    <>
      <a href="/sign-up" className="btn btn-primary">Get Started</a>
      <a href="/sign-in" className="btn btn-secondary">Sign In</a>
    </>
  );
}
