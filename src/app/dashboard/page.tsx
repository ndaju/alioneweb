"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Loader2, ArrowRight, Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

const products = [
  {
    id: "mail",
    title: "AliOne Mail",
    description: "Secure, private email with your own @alione.cc address. Full IMAP access, spam protection, and a modern web interface.",
    icon: Mail,
    href: "/dashboard/mail",
    status: "Available" as const,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    borderGlow: "group-hover:border-blue-500/30",
  },
  {
    id: "drive",
    title: "AliDrive",
    description: "Cloud storage for your files. Store, share, and sync seamlessly across all your devices with end-to-end encryption.",
    icon: HardDrive,
    href: "#",
    status: "Coming Soon" as const,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    borderGlow: "",
  },
  {
    id: "photos",
    title: "AliPhotos",
    description: "Backup, organize, and relive your memories. Smart albums and seamless sharing — all in one place.",
    icon: Image,
    href: "#",
    status: "Coming Soon" as const,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    borderGlow: "",
  },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isSignedIn) return null;
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  const initial = (user?.fullName || user?.primaryEmailAddress?.emailAddress || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[900px] h-[900px] rounded-full bg-blue-500 opacity-[0.015] blur-[180px] -top-1/2 -left-1/4" />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-500 opacity-[0.015] blur-[150px] -bottom-1/2 -right-1/4" />
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
                <img src="/alione.png" alt="AliOne" className="w-6 h-6" />
              </div>
              <span className="text-base font-outfit font-semibold tracking-tight">AliOne</span>
              <span className="hidden sm:inline text-xs text-white/20 ml-2 px-2 py-0.5 rounded-full bg-white/[0.03]">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/35 hidden md:block">{user?.primaryEmailAddress?.emailAddress}</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.06] flex items-center justify-center text-sm font-medium text-white/70">
                  {initial}
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-5xl">
            {/* Hero */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/40 mb-7">
                <Sparkles size={12} />
                Your Ecosystem
              </div>
              <h1 className="text-5xl md:text-6xl font-outfit font-bold tracking-tight mb-5">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
                  AliOne
                </span>
              </h1>
              <p className="text-white/35 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Your unified digital ecosystem. Choose a service below to get started.
              </p>
            </div>

            {/* Product Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {products.map((product) => {
                const Icon = product.icon;
                const isAvailable = product.status === "Available";
                return (
                  <div
                    key={product.id}
                    className={`group relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 ${
                      isAvailable
                        ? `hover:border-white/20 hover:bg-white/[0.02] hover:-translate-y-0.5 cursor-pointer ${product.borderGlow}`
                        : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {isAvailable ? (
                      <Link href={product.href} className="block">
                        <CardContent product={product} Icon={Icon} isAvailable={isAvailable} />
                      </Link>
                    ) : (
                      <CardContent product={product} Icon={Icon} isAvailable={isAvailable} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-8 h-12 flex items-center justify-between">
            <p className="text-xs text-white/15">AliOne Ecosystem &mdash; {new Date().getFullYear()}</p>
            <a href="https://alione.cc" className="text-xs text-white/20 hover:text-white/40 transition">alione.cc</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function CardContent({ product, Icon, isAvailable }: { product: typeof products[0]; Icon: any; isAvailable: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between mb-5">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.gradient} border border-white/[0.06] flex items-center justify-center`}>
          <Icon size={26} className={product.iconColor} />
        </div>
        <span className={`text-[11px] font-medium px-3 py-1 rounded-full border ${
          isAvailable
            ? "text-green-400 bg-green-500/10 border-green-500/20"
            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
        }`}>
          {product.status}
        </span>
      </div>
      <h3 className="text-xl font-outfit font-semibold mb-2">{product.title}</h3>
      <p className="text-sm text-white/35 leading-relaxed mb-6 min-h-[40px]">{product.description}</p>
      {isAvailable && (
        <div className="flex items-center gap-2 text-sm text-white/25 group-hover:text-white/50 transition-colors">
          <span>Open</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </>
  );
}
