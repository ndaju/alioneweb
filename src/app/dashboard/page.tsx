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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] rounded-full bg-blue-500 opacity-[0.012] blur-[200px] -top-1/2 -left-1/4" />
        <div className="absolute w-[800px] h-[800px] rounded-full bg-purple-500 opacity-[0.012] blur-[180px] -bottom-1/2 -right-1/4" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/alione.png" alt="AliOne" className="w-8 h-8 rounded-xl" />
              <span className="text-lg font-outfit font-semibold">AliOne</span>
              <span className="hidden sm:block text-xs text-white/20 ml-2 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.04]">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/35 hidden md:block">{user?.primaryEmailAddress?.emailAddress}</span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/[0.06] flex items-center justify-center text-sm font-medium text-white/70">{initial}</div>
                <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition"><LogOut size={16} /></button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-5xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/40 mb-6"><Sparkles size={12} />Your Ecosystem</div>
              <h1 className="text-5xl md:text-6xl font-outfit font-bold tracking-tight mb-4">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">AliOne</span>
              </h1>
              <p className="text-white/35 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">Your unified digital ecosystem. Choose a service below to get started.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => {
                const Icon = product.icon;
                const isAvailable = product.status === "Available";
                return (
                  <div key={product.id} className={`group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 transition-all duration-300 ${isAvailable ? "hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-1 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}>
                    {isAvailable ? (
                      <Link href={product.href} className="block space-y-5">
                        <CardContent product={product} Icon={Icon} isAvailable={isAvailable} />
                      </Link>
                    ) : (
                      <div className="space-y-5"><CardContent product={product} Icon={Icon} isAvailable={isAvailable} /></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

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
      <div className={`w-14 h-14 rounded-2xl ${product.iconBg} border border-white/[0.06] flex items-center justify-center`}>
        <Icon size={26} className={product.iconColor} />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-outfit font-semibold">{product.title}</h3>
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${isAvailable ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>{product.status}</span>
        </div>
        <p className="text-sm text-white/35 leading-relaxed">{product.description}</p>
      </div>
      {isAvailable && (
        <div className="flex items-center gap-2 text-sm text-white/25 group-hover:text-white/50 transition-colors pt-2">
          <span>Open</span><ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </>
  );
}
