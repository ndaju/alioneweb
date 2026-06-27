import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavAuth, MobileNavAuth } from "@/components/NavAuth";
import ScrollReveal from "@/components/ScrollReveal";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <ScrollReveal>
      <div className="noise-overlay" />
      <nav className="nav" id="nav">
        <div className="container nav-container">
          <a href="https://alione.cc" className="nav-logo">
            <img src="/alione.png" alt="AliOne" className="logo-img" />
          </a>
          <div className="nav-links">
            <NavAuth />
          </div>
          <MobileNavAuth />
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center pt-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
              <img src="/alione.png" alt="AliOne" className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-4">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-white/50 text-lg mb-2">
              Signed in as {user.emailAddresses?.[0]?.emailAddress ?? user.id}
            </p>
            <p className="text-white/30 text-sm">
              Your AliOne dashboard is coming soon.
            </p>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
