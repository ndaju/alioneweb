"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";

export function NavAuth() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <UserDropdown />;
  return (
    <>
      <a href="/sign-in" className="nav-link nav-login">Sign In</a>
      <a href="/sign-up" className="btn btn-primary btn-sm">Sign Up</a>
    </>
  );
}

export function MobileNavAuth() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <UserDropdown />;
  return (
    <>
      <a href="/sign-in" className="mobile-link">Sign In</a>
      <a href="/sign-up" className="btn btn-primary">Sign Up</a>
    </>
  );
}

function UserDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const name = user?.fullName || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const initial = name[0].toUpperCase();
  const imageUrl = user?.imageUrl;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, borderRadius: "50%", background: imageUrl ? "transparent" : "linear-gradient(135deg, #3B82F6, #8B5CF6)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", padding: 0 }}>
        {imageUrl ? <img src={imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{initial}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 12, width: 280, background: "#111113", border: "1px solid #2A2A2E", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 200 }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #2A2A2E", display: "flex", alignItems: "center", gap: 12 }}>
            {imageUrl ? <img src={imageUrl} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "white" }}>{initial}</div>}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#F0F0F2", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 13, color: "#636370", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
            </div>
          </div>
          <div style={{ padding: 6 }}>
            <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#F0F0F2", textDecoration: "none", fontWeight: 500, transition: "background 150ms" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9.5" y="1.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
              Dashboard
            </a>
            <a href={`https://dashboard.clerk.com/Y2xlcmsuYWxpb25lLmNjJA/users/${user?.id || ""}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#9A9AA8", textDecoration: "none", transition: "background 150ms" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 4a1.25 1.25 0 110 2.5A1.25 1.25 0 018 4zm0 7.5a5 5 0 01-3.125-1.1c.025-.725 2.1-1.1 3.125-1.1s3.1.375 3.125 1.1A5 5 0 018 11.5z" fill="currentColor"/></svg>
              Manage Account
            </a>
            <div style={{ height: 1, background: "#2A2A2E", margin: "4px 0" }} />
            <button onClick={() => signOut()} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#9A9AA8", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 150ms" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2m4-10l3-3m0 0l-3-3m3 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sign out
            </button>
          </div>
          <div style={{ padding: "8px 20px", borderTop: "1px solid #2A2A2E", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "#3D3D42" }}>Secured by Clerk</span>
          </div>
        </div>
      )}
    </div>
  );
}
