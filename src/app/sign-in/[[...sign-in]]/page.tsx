import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#0a0a0a] border border-white/[0.06] shadow-2xl shadow-black/50 rounded-2xl",
            headerTitle: "text-white font-outfit text-2xl",
            headerSubtitle: "text-white/50",
            formButtonPrimary:
              "bg-white text-black hover:bg-white/90 rounded-xl py-2.5 text-sm font-medium normal-case shadow-none",
            formFieldInput:
              "bg-white/5 border-white/10 text-white rounded-xl py-2.5 px-4 text-sm placeholder:text-white/30 focus:border-white/20 focus:ring-0",
            formFieldLabel: "text-white/60 text-sm font-normal",
            footerActionLink: "text-white hover:text-white/80",
            footerActionText: "text-white/40",
            dividerLine: "bg-white/10",
            dividerText: "text-white/30",
            socialButtonsBlockButton:
              "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl",
            socialButtonsBlockButtonText: "text-white",
            formResendCodeLink: "text-white hover:text-white/80",
            alert: "bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl",
            identityPreviewEditButton: "text-white hover:text-white/80",
            otpCodeFieldInput:
              "bg-white/5 border-white/10 text-white rounded-xl focus:border-white/20",
          },
        }}
      />
    </div>
  );
}
