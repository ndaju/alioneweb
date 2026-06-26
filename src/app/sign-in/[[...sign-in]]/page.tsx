import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const appearance = {
    variables: {
      colorBackground: "#0a0a0a",
      colorText: "#ffffff",
      colorTextSecondary: "rgba(255,255,255,0.5)",
      colorInputBackground: "rgba(255,255,255,0.05)",
      colorInputBorder: "rgba(255,255,255,0.1)",
      colorPrimary: "#ffffff",
      colorTextOnPrimary: "#000000",
      colorDanger: "#f87171",
    },
    elements: {
      rootBox: "mx-auto",
      card: "border border-white/[0.06] shadow-2xl shadow-black/50 rounded-2xl",
      headerTitle: "font-outfit text-2xl",
      formButtonPrimary:
        "rounded-xl py-2.5 text-sm font-medium normal-case shadow-none hover:opacity-90",
      formFieldInput:
        "rounded-xl py-2.5 px-4 text-sm focus:ring-0",
      formFieldLabel: "text-sm font-normal",
      socialButtonsBlockButton: "rounded-xl hover:opacity-90",
      alert: "rounded-xl",
      otpCodeFieldInput: "rounded-xl",
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#ffffff] opacity-[0.03] blur-[120px] -top-1/2 -left-1/4" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#ffffff] opacity-[0.02] blur-[100px] -bottom-1/2 -right-1/4" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <a href="https://alione.cc">
          <img src="/alione.png" alt="AliOne" className="w-14 h-14 rounded-xl" />
        </a>
        <SignIn appearance={appearance as any} />
      </div>
    </div>
  );
}
