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
    description: "Anonymous search engine. No tracking. Just results.",
    icon: Search,
    href: "https://alisearch.alione.cc",
    online: true,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    borderGlow: "group-hover:border-emerald-500/30",
  },
  {
    id: "mail",
    title: "Mail",
    description: "Private email with your own @alione.cc address.",
    icon: Mail,
    href: "https://mail.alione.cc",
    online: true,
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    borderGlow: "group-hover:border-blue-500/30",
  },
  {
    id: "drive",
    title: "AliDrive",
    description: "Cloud storage. Store, share, and sync your files.",
    icon: HardDrive,
    href: "#",
    online: false,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    borderGlow: "",
  },
  {
    id: "photos",
    title: "AliPhotos",
    description: "Backup and relive your memories. Smart albums.",
    icon: Image,
    href: "#",
    online: false,
    gradient: "from-purple-500/10 to-pink-500/10",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    borderGlow: "",
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
        <div className="absolute w-[1200px] h-[1200px] rounded-full bg-blue-500 opacity-[0.008] blur-[250px] -top-1/2 -left-1/4" />
        <div className="absolute w-[900px] h-[900px] rounded-full bg-purple-500 opacity-[0.008] blur-[220px] -bottom-1/2 -right-1/4" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.08] flex items-center justify-center">
                <img src="/alione.png" alt="AliOne" className="w-5 h-5" />
              </div>
              <span className="text-lg font-outfit font-semibold tracking-tight">AliOne</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/30 hidden md:block">{email}</span>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/12 to-white/5 border border-white/[0.08] flex items-center justify-center text-sm font-medium text-white/70 shadow-lg shadow-black/20">{initial}</div>
                <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-all" title="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-16">
          <div className="w-full max-w-3xl">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/40 mb-5">
                <Sparkles size={12} />
                <span>Welcome back, {displayName.split(" ")[0]}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight mb-3">
                Your{" "}
                <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">ecosystem</span>
              </h1>
              <p className="text-white/30 text-base max-w-md mx-auto">Choose a service to continue.</p>
            </div>

            <div className="flex flex-col gap-4">
              {products.map((product, i) => {
                const Icon = product.icon;
                return (
                  <div
                    key={product.id}
                    className={`group relative rounded-2xl transition-all duration-500 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    } ${product.online ? "cursor-pointer" : "cursor-not-allowed"}`}
                    style={{ transitionDelay: `${i * 0.08}s` }}
                  >
                    {product.online ? (
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
          <div className="max-w-3xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
            <p className="text-xs text-white/15">AliOne &mdash; {new Date().getFullYear()}</p>
            <a href="https://alione.cc" className="text-xs text-white/20 hover:text-white/40 transition">alione.cc</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function CardContent({ product, Icon }: { product: typeof products[0]; Icon: any }) {
  return (
    <div className={`relative pl-6 pr-5 py-5 bg-[#0a0a0a] border rounded-2xl transition-all duration-300 ${
      product.online
        ? `border-white/[0.08] ${product.borderGlow} hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5`
        : "border-white/[0.05] opacity-40"
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${product.gradient}`} />
      <div className="relative z-10 flex items-center gap-5">
        <div className={`shrink-0 w-12 h-12 rounded-xl ${product.iconBg} border border-white/[0.08] flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={22} className={product.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-outfit font-semibold">{product.title}</h3>
            <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tracking-wide ${
              product.online
                ? "text-green-400 bg-green-500/10 border-green-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}>
              {product.online ? "Available" : "Coming Soon"}
            </span>
          </div>
          <p className="text-sm text-white/35 mt-0.5 truncate">{product.description}</p>
        </div>
        {product.online && (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowUpRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
          </div>
        )}
        {!product.online && (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
            <Lock size={14} className="text-white/15" />
          </div>
        )}
      </div>
    </div>
  );
}
