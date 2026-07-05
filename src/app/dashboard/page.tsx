"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Search, Loader2, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const products = [
  {
    id: "search",
    title: "AliSearch",
    description: "Anonymous search engine. No tracking, no profiling.",
    icon: Search,
    href: "https://alisearch.alione.cc",
    available: true,
    color: "emerald",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    cardHover: "hover:shadow-emerald-500/10 hover:border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  {
    id: "mail",
    title: "AliOne Mail",
    description: "Private email with your own @alione.cc address.",
    icon: Mail,
    href: "https://mail.alione.cc",
    available: true,
    color: "blue",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    cardHover: "hover:shadow-blue-500/10 hover:border-blue-500/30",
    dot: "bg-blue-400",
  },
  {
    id: "drive",
    title: "AliDrive",
    description: "Cloud storage. Secure and seamless.",
    icon: HardDrive,
    href: "#",
    available: false,
    color: "amber",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    cardHover: "",
    dot: "bg-amber-400",
  },
  {
    id: "photos",
    title: "AliPhotos",
    description: "Your memories, beautifully organized.",
    icon: Image,
    href: "#",
    available: false,
    color: "purple",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    cardHover: "",
    dot: "bg-purple-400",
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
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-emerald-500 opacity-[0.02] blur-[150px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500 opacity-[0.02] blur-[150px] bottom-[-200px] right-[-100px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="https://alione.cc" className="flex items-center gap-2.5">
            <img src="/alione.png" alt="AliOne" className="w-7 h-7" />
            <span className="text-lg font-outfit font-bold tracking-tight">AliOne</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/25 hidden sm:block">{email}</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm font-semibold text-white/60">
                {initial}
              </div>
              <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-all" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight mb-4">
            Welcome back, <span className="text-white">{displayName.split(" ")[0]}</span>
          </h1>
          <p className="text-white/30 text-lg">Choose a product to get started.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {products.map((product, i) => {
            const Icon = product.icon;
            const isLive = product.available;
            const cardClass = `group block rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-8 transition-all duration-300 ${
              isLive
                ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-white/[0.12]"
                : "opacity-40 cursor-not-allowed"
            } ${product.cardHover} ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`;
            const delay = { transitionDelay: `${i * 0.1}s` };

            const inner = (
              <>
                <div className={`w-14 h-14 rounded-2xl ${product.iconBg} border border-white/[0.06] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className={product.iconColor} />
                </div>
                <h3 className="text-xl font-outfit font-semibold mb-1.5">{product.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{product.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${product.dot}`} />
                    <span className="text-xs text-white/25 font-medium">{isLive ? "Available" : "Coming Soon"}</span>
                  </div>
                  {isLive && (
                    <div className="flex items-center gap-1 text-xs text-white/20 group-hover:text-white/50 transition-colors">
                      <span>Open</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </>
            );

            return isLive ? (
              <Link key={product.id} href={product.href} className={cardClass} style={delay}>
                {inner}
              </Link>
            ) : (
              <div key={product.id} className={cardClass} style={delay}>
                {inner}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
