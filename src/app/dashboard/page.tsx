"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Search, Loader2, ArrowRight, Sparkles, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const products = [
  {
    id: "search",
    title: "AliSearch",
    description: "Anonymous search engine. No profiling. No tracking. Just results.",
    icon: Search,
    href: "https://alisearch.alione.cc",
    status: "Available" as const,
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    id: "mail",
    title: "AliOne Mail",
    description: "Secure, private email with your own @alione.cc address. Full IMAP access, spam protection, and a modern web interface.",
    icon: Mail,
    href: "https://mail.alione.cc",
    status: "Available" as const,
    gradient: "from-blue-500/15 to-cyan-500/15",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    id: "drive",
    title: "AliDrive",
    description: "Cloud storage for your files. Store, share, and sync seamlessly across all your devices with end-to-end encryption.",
    icon: HardDrive,
    href: "#",
    status: "Coming Soon" as const,
    gradient: "from-amber-500/15 to-orange-500/15",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    id: "photos",
    title: "AliPhotos",
    description: "Backup, organize, and relive your memories. Smart albums and seamless sharing — all in one place.",
    icon: Image,
    href: "#",
    status: "Coming Soon" as const,
    gradient: "from-purple-500/15 to-pink-500/15",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
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
  const initial = (displayName)[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1200px] h-[1200px] rounded-full bg-blue-500 opacity-[0.008] blur-[250px] -top-1/2 -left-1/4" />
        <div className="absolute w-[900px] h-[900px] rounded-full bg-purple-500 opacity-[0.008] blur-[220px] -bottom-1/2 -right-1/4" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="border-b border-white/[0.04] bg-[#050505]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.06] flex items-center justify-center">
                <img src="/alione.png" alt="AliOne" className="w-5 h-5" />
              </div>
              <span className="text-lg font-outfit font-semibold tracking-tight">AliOne</span>
              <span className="hidden sm:block text-[11px] text-white/20 ml-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04]">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/30 hidden md:block">{email}</span>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/12 to-white/5 border border-white/[0.06] flex items-center justify-center text-sm font-medium text-white/70 shadow-lg shadow-black/20">{initial}</div>
                <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-all" title="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/40 mb-4">
                  <Sparkles size={12} />
                  <span>Welcome back, {displayName.split(" ")[0]}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">
                  Your{" "}
                  <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">ecosystem</span>
                </h1>
                <p className="text-white/30 text-base mt-2 max-w-lg">Choose a service to continue. All products work together through your AliOne account.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-white/20">
                <div className="w-2 h-2 rounded-full bg-green-400/60"></div>
                All systems operational
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product, i) => {
                const Icon = product.icon;
                const isAvailable = product.status === "Available";
                return (
                  <div
                    key={product.id}
                    className={`group relative rounded-2xl transition-all duration-500 ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    } ${isAvailable ? "cursor-pointer" : "cursor-not-allowed"}`}
                    style={{ animationDelay: `${i * 0.1}s`, transitionDelay: `${i * 0.08}s` }}
                  >
                    {isAvailable ? (
                      <Link href={product.href} className="block h-full">
                        <CardContent product={product} Icon={Icon} isAvailable={isAvailable} />
                      </Link>
                    ) : (
                      <div className="h-full">
                        <CardContent product={product} Icon={Icon} isAvailable={isAvailable} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
            <p className="text-xs text-white/15">AliOne Ecosystem &mdash; {new Date().getFullYear()}</p>
            <div className="flex items-center gap-4">
              <a href="https://alione.cc" className="text-xs text-white/20 hover:text-white/40 transition">Home</a>
              <span className="text-white/10">/</span>
              <a href="https://alione.cc" className="text-xs text-white/20 hover:text-white/40 transition">alione.cc</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function CardContent({ product, Icon, isAvailable }: { product: typeof products[0]; Icon: any; isAvailable: boolean }) {
  return (
    <div className={`relative h-full bg-white/[0.02] border rounded-2xl p-6 transition-all duration-300 overflow-hidden ${
      isAvailable
        ? "border-white/[0.06] group-hover:border-white/20 group-hover:bg-white/[0.03] group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-black/30"
        : "border-white/[0.04] opacity-40"
    }`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${product.gradient} rounded-2xl`} />
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.03), transparent 40%)" }} />
      {isAvailable && (
        <div className="absolute top-0 right-0 w-24 h-24 translate-x-8 -translate-y-8">
          <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
        </div>
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${product.iconBg} border border-white/[0.06] flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={22} className={product.iconColor} />
          </div>
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
            isAvailable
              ? "text-green-400 bg-green-500/10 border-green-500/20"
              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
          }`}>{product.status}</span>
        </div>
        <h3 className="text-lg font-outfit font-semibold mb-2">{product.title}</h3>
        <p className="text-sm text-white/35 leading-relaxed flex-1">{product.description}</p>
        {isAvailable && (
          <div className="flex items-center gap-1.5 text-sm text-white/20 group-hover:text-white/50 transition-colors mt-5 pt-4 border-t border-white/[0.04]">
            <span>Open</span>
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
