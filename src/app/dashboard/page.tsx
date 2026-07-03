"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const products = [
  {
    id: "mail",
    title: "AliOne Mail",
    description: "Secure email with your own @alione.cc address. Full IMAP access, spam protection, and a modern web interface.",
    icon: Mail,
    href: "/dashboard/mail",
    status: "Available" as const,
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    id: "drive",
    title: "AliDrive",
    description: "Cloud storage for your files. Store, share, and sync across all your devices. End-to-end encrypted.",
    icon: HardDrive,
    href: "#",
    status: "Coming Soon" as const,
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "photos",
    title: "AliPhotos",
    description: "Backup, organize, and relive your memories. Smart albums, face recognition, and seamless sharing.",
    icon: Image,
    href: "#",
    status: "Coming Soon" as const,
    statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  if (!isSignedIn) return null;
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-blue-500 opacity-[0.02] blur-[150px] -top-1/2 -left-1/4" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-500 opacity-[0.02] blur-[120px] -bottom-1/2 -right-1/4" />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <img src="/alione.png" alt="AliOne" className="w-9 h-9 rounded-xl" />
            <span className="text-xl font-outfit font-semibold tracking-tight">AliOne</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40">{user?.primaryEmailAddress?.emailAddress}</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
              {(user?.fullName || user?.primaryEmailAddress?.emailAddress || "?")[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 mb-6">
            <Sparkles size={12} />
            Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
              AliOne
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Your unified digital ecosystem. Choose a service to get started.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {products.map((product) => {
            const Icon = product.icon;
            const isAvailable = product.status === "Available";
            return (
              <div
                key={product.id}
                className={`group relative bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 transition ${
                  isAvailable
                    ? "hover:border-white/20 hover:bg-white/[0.02] cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
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

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-xs text-white/20">
            AliOne Ecosystem &mdash; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardContent({
  product,
  Icon,
  isAvailable,
}: {
  product: typeof products[0];
  Icon: any;
  isAvailable: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center">
          <Icon size={24} className="text-white/60" />
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
            product.statusColor
          }`}
        >
          {product.status}
        </span>
      </div>
      <h3 className="text-lg font-outfit font-semibold mb-1.5">{product.title}</h3>
      <p className="text-sm text-white/40 leading-relaxed mb-4">{product.description}</p>
      {isAvailable && (
        <div className="flex items-center gap-1.5 text-sm text-white/30 group-hover:text-white/60 transition">
          <span>Open</span>
          <ArrowRight size={14} />
        </div>
      )}
    </>
  );
}
