"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, HardDrive, Image, Search, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

const apps = [
  { id: "search", name: "AliSearch", icon: Search, href: "https://alisearch.alione.cc", color: "text-emerald-400", live: true },
  { id: "mail", name: "Mail", icon: Mail, href: "https://mail.alione.cc", color: "text-blue-400", live: true },
  { id: "drive", name: "AliDrive", icon: HardDrive, href: "#", color: "text-amber-400", live: false },
  { id: "photos", name: "AliPhotos", icon: Image, href: "#", color: "text-purple-400", live: false },
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <header className="border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <img src="/alione.png" alt="AliOne" className="w-5 h-5 opacity-60" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/20 hidden sm:block">{email}</span>
            <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-[11px] font-medium text-white/40">{initial}</div>
            <button onClick={() => signOut()} className="p-1 rounded hover:bg-white/[0.04] text-white/20 hover:text-white/40 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <div className="mb-14">
            <h1 className="text-3xl font-outfit font-bold tracking-tight">Your ecosystem</h1>
            <p className="text-sm text-white/25 mt-1">{displayName.split(" ")[0]}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {apps.map((app) => {
              const Icon = app.icon;
              return app.live ? (
                <Link key={app.id} href={app.href} className="group block">
                  <div className="aspect-square rounded-2xl border border-white/[0.06] bg-[#0a0a0a] flex flex-col items-center justify-center gap-3 transition-colors hover:border-white/[0.12]">
                    <Icon size={32} className={`${app.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-xs font-medium text-white/30 group-hover:text-white/50 transition-colors">{app.name}</span>
                  </div>
                </Link>
              ) : (
                <div key={app.id} className="aspect-square rounded-2xl border border-white/[0.04] bg-[#0a0a0a]/50 flex flex-col items-center justify-center gap-3 opacity-30">
                  <Icon size={32} className="text-white/30" />
                  <span className="text-xs font-medium text-white/20">{app.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-6 h-10 flex items-center justify-between">
          <p className="text-[11px] text-white/10">AliOne</p>
          <p className="text-[11px] text-white/10">{new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
