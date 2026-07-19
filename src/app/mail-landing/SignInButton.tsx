"use client";

import { useAuth } from "@clerk/nextjs";

export function SignInButton() {
  const { isSignedIn } = useAuth();

  return (
    <a
      href={isSignedIn ? "/dashboard" : "/sign-in"}
      style={{
        padding: "14px 32px",
        borderRadius: 14,
        border: "none",
        background: "#F0F0F2",
        color: "#0A0A0B",
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "var(--font-display, system-ui), sans-serif",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "all 200ms",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
      {isSignedIn ? "Go to Mail" : "Sign In"}
    </a>
  );
}
