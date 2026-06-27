import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavAuth, MobileNavAuth } from "@/components/NavAuth";
import ScrollReveal from "@/components/ScrollReveal";

export default async function OnboardingPage() {
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
              Welcome to AliOne
            </h1>
            <p className="text-white/50 text-lg mb-8">
              Your account is ready{user.firstName ? `, ${user.firstName}` : ""}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                { step: "1", title: "Create Your Profile", desc: "Set up your AliOne identity and preferences." },
                { step: "2", title: "Explore Products", desc: "Discover AliBrowser and upcoming services." },
                { step: "3", title: "Stay Updated", desc: "Follow our roadmap and community discussions." },
              ].map((item) => (
                <div key={item.step} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-sm font-semibold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-outfit font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
