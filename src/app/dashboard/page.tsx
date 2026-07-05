"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Search, Loader2, Sparkles, LogOut, ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const products = [
  {
    id: "search",
    title: "AliSearch",
    tagline: "Anonymous search. No tracking.",
    icon: Search,
    href: "https://alisearch.alione.cc",
    available: true,
    gradient: "from-emerald-500/20",
    shadowColor: "shadow-emerald-500/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "mail",
    title: "AliOne Mail",
    tagline: "Private @alione.cc email.",
    icon: Mail,
    href: "https://mail.alione.cc",
    available: true,
    gradient: "from-blue-500/20",
    shadowColor: "shadow-blue-500/5",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    id: "drive",
    title: "AliDrive",
    tagline: "Cloud storage for your files.",
    icon: HardDrive,
    href: "#",
    available: false,
    gradient: "from-amber-500/20",
    shadowColor: "shadow-amber-500/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "photos",
    title: "AliPhotos",
    tagline: "Your memories, organized.",
    icon: Image,
    href: "#",
    available: false,
    gradient: "from-purple-500/20",
    shadowColor: "shadow-purple-500/5",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isSignedIn) return null;
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress || "";
  const displayName = user?.fullName || email.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1200px] h-[1200px] rounded-full bg-blue-500 opacity-[0.01] blur-[250px] -top-1/2 -left-1/4" />
        <div className="absolute w-[900px] h-[900px] rounded-full bg-purple-500 opacity-[0.01] blur-[220px] -bottom-1/2 -right-1/4" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/alione.png" alt="AliOne" className="w-6 h-6" />
              <span className="text-base font-outfit font-semibold tracking-tight">AliOne</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25 hidden md:block">{email}</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-xs font-medium text-white/60">{initial}</div>
                <button onClick={() => signOut()} className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/40 transition-all" title="Sign out">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-2xl">
            <div className="mb-12">
              <p className="text-xs text-white/20 tracking-widest uppercase mb-4">Welcome back, {displayName.split(" ")[0]}</p>
              <h1 className="text-3xl md:text-4xl font-outfit font-bold tracking-tight">
                Your <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">ecosystem</span>
              </h1>
              <p className="text-sm text-white/25 mt-1">Choose a service to get started.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {products.map((product, i) => {
                const Icon = product.icon;
                return (
                  <div
                    key={product.id}
                    className={`group transition-all duration-500 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                    style={{ transitionDelay: `${i * 0.06}s` }}
                  >
                    {product.available ? (
                      <Link href={product.href} className="block">
                        <CardContent product={product} Icon={Icon} />
                      </Link>
                    ) : (
                      <CardContent product={product} Icon={Icon} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="border-t border-white/[0.04]">
          <div className="max-w-2xl mx-auto px-5 h-10 flex items-center justify-between">
            <p className="text-[11px] text-white/15">AliOne &mdash; {new Date().getFullYear()}</p>
            <a href="https://alione.cc" className="text-[11px] text-white/20 hover:text-white/40 transition">alione.cc</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function CardContent({ product, Icon }: { product: typeof products[0]; Icon: any }) {
  return (
    <div className={`relative px-5 py-4 bg-[#0a0a0a] border border-white/[0.06] rounded-xl transition-all duration-200 ${
      product.available
        ? "hover:border-white/15 hover:bg-[#0c0c0c] active:scale-[0.99]"
        : "opacity-30 cursor-not-allowed"
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-r ${product.gradient} to-transparent`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`shrink-0 w-11 h-11 rounded-xl ${product.iconBg} border border-white/[0.06] flex items-center justify-center`}>
          <Icon size={20} className={product.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-outfit font-semibold">{product.title}</h3>
            <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${product.badge}`}>
              {product.available ? "Live" : "Soon"}
            </span>
          </div>
          <p className="text-xs text-white/30 mt-0.5">{product.tagline}</p>
        </div>
        {product.available && (
          <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/10 transition-all">
            <ArrowUpRight size={14} className="text-white/25 group-hover:text-white/50 transition-colors" />
          </div>
        )}
        {!product.available && (
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
            <Lock size={12} className="text-white/15" />
          </div>
        )}
      </div>
    </div>
  );
}
