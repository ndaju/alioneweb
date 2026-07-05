"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Search, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

const products = [
  {
    id: "search",
    name: "AliSearch",
    desc: "Anonymous search engine. No profiling. No tracking. Just results.",
    icon: Search,
    href: "https://alisearch.alione.cc",
    iconClass: "product-icon product-icon-search",
    status: "live",
    features: ["Anonymous", "No Profiling", "Fast Results", "Transparent Ranking"],
  },
  {
    id: "mail",
    name: "AliOne Mail",
    desc: "Private email with your own @alione.cc address. Full IMAP access.",
    icon: Mail,
    href: "https://mail.alione.cc",
    iconClass: "product-icon product-icon-mail",
    status: "live",
    features: ["E2E Encryption", "Custom Domains", "Spam Protection", "IMAP Access"],
  },
  {
    id: "drive",
    name: "AliDrive",
    desc: "Cloud storage for your files. Store, share, and sync seamlessly.",
    icon: HardDrive,
    href: "#",
    iconClass: "product-icon product-icon-drive",
    status: "soon",
    features: ["Encrypted Storage", "File Syncing", "Auto Backups", "Cross-platform"],
  },
  {
    id: "photos",
    name: "AliPhotos",
    desc: "Backup, organize, and relive your memories. Smart albums.",
    icon: Image,
    href: "#",
    iconClass: "product-icon product-icon-photos",
    status: "soon",
    features: ["AI Organization", "Shared Albums", "Family Libraries", "Privacy Controls"],
  },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isSignedIn) return null;
  if (!isLoaded) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><Loader2 size={20} className="animate-spin text-white/30" /></div>;

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const displayName = user?.fullName || email.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen text-white" style={{ background: "var(--bg, #0A0A0B)" }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(20, 184, 166, 0.08), transparent 70%)", filter: "blur(100px)", top: "-100px", right: "-100px" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.06), transparent 70%)", filter: "blur(100px)", bottom: "-100px", left: "-100px" }} />
      </div>

      <header className="relative z-10" style={{ borderBottom: "1px solid var(--border, #2A2A2E)", background: "rgba(10, 10, 11, 0.8)", backdropFilter: "blur(20px)" }}>
        <div className="container" style={{ height: "var(--nav-height, 72px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="flex items-center gap-3">
            <img src="/alione.png" alt="AliOne" style={{ height: 28, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>AliOne</span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)", display: "none" }} className="sm:block">{email}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md, 12px)", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "var(--text-secondary, #9A9AA8)" }}>{initial}</div>
              <button onClick={() => signOut()} style={{ padding: 8, borderRadius: "var(--radius-md, 12px)", color: "var(--text-tertiary, #636370)", cursor: "pointer", background: "none", border: "none", transition: "color 150ms" }} onMouseEnter={e => e.currentTarget.style.color = "var(--text, #F0F0F2)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 48px)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 12 }}>
              Your <span style={{ background: "linear-gradient(135deg, var(--privacy-light, #2DD4BF), var(--community-light, #60A5FA))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ecosystem</span>
            </h1>
            <p style={{ fontSize: 17, color: "var(--text-secondary, #9A9AA8)" }}>Welcome back, {displayName.split(" ")[0]}</p>
          </div>

          <div className="product-grid" style={{ maxWidth: 800, margin: "0 auto" }}>
            {products.map((product) => {
              const Icon = product.icon;
              const isLive = product.status === "live";
              const cardClass = `product-card ${isLive ? "" : "product-card-soon"}`;
              const cardStyle = { textDecoration: "none", color: "inherit", display: "block" } as const;

              const inner = (
                <>
                  <div className="product-card-glow"></div>
                  <div className="product-card-inner">
                    <div className="product-card-header">
                      <div className={product.iconClass}>
                        <Icon size={24} />
                      </div>
                      <span className={`product-status ${isLive ? "product-status-live" : "product-status-soon"}`}>
                        {isLive ? "Available" : "Coming Soon"}
                      </span>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-features">
                      {product.features.map((f) => (
                        <span key={f} className="product-feature">{f}</span>
                      ))}
                    </div>
                    <div className="product-card-visual">
                      {product.id === "search" && (
                        <div className="search-mockup">
                          <div className="search-logo-text">AliSearch</div>
                          <div className="search-bar-mock">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="10" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            <span>Search privately...</span>
                          </div>
                          <div className="search-results-mock">
                            <div className="search-result-line w-full"></div>
                            <div className="search-result-line w-3-4"></div>
                            <div className="search-result-line w-1-2"></div>
                          </div>
                        </div>
                      )}
                      {product.id === "mail" && (
                        <div className="mail-mockup">
                          <div className="mail-sidebar">
                            <div className="mail-folder active"></div>
                            <div className="mail-folder"></div>
                            <div className="mail-folder"></div>
                          </div>
                          <div className="mail-list">
                            <div className="mail-item">
                              <div className="mail-item-dot"></div>
                              <div className="mail-item-lines"><div className="mail-line w-3-4"></div><div className="mail-line w-1-2"></div></div>
                            </div>
                            <div className="mail-item">
                              <div className="mail-item-lines"><div className="mail-line w-full"></div><div className="mail-line w-2-3"></div></div>
                            </div>
                            <div className="mail-item">
                              <div className="mail-item-lines"><div className="mail-line w-2-3"></div><div className="mail-line w-1-3"></div></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {(product.id === "drive" || product.id === "photos") && (
                        <div style={{ color: "var(--text-tertiary, #636370)", fontSize: 13 }}>Coming soon</div>
                      )}
                    </div>
                  </div>
                </>
              );

              return isLive ? (
                <Link key={product.id} href={product.href} className={cardClass} style={cardStyle}>
                  {inner}
                </Link>
              ) : (
                <div key={product.id} className={cardClass} style={cardStyle}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
