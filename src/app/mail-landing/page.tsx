import { SignInButton } from "./SignInButton";

export default function MailLanding() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #1A1A1D 0%, #141416 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F0F0F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display, system-ui), sans-serif",
          fontSize: 44,
          fontWeight: 700,
          color: "#F0F0F2",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          AliMail
        </h1>

        <p style={{
          fontSize: 18,
          color: "#9A9AA8",
          lineHeight: 1.7,
          marginBottom: 12,
          maxWidth: 420,
          margin: "0 auto 32px",
        }}>
          Private email by AliOne. Your address at <span style={{ color: "#F0F0F2" }}>@alione.cc</span> — secure, modern, and built for you.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <SignInButton />
          <a href="https://alione.cc" style={{
            padding: "14px 28px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#9A9AA8",
            fontSize: 16,
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 200ms",
          }}>
            About AliOne
          </a>
        </div>

        <div style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          textAlign: "left",
        }}>
          {[
            { title: "Private", desc: "End-to-end encrypted, no tracking, no ads." },
            { title: "Fast", desc: "IMAP-based with real-time sync across devices." },
            { title: "Yours", desc: "Yourname@alione.cc — own your identity." },
          ].map(f => (
            <div key={f.title} style={{
              padding: 20,
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F2", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#636370", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 64,
          padding: "20px 24px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 13,
          color: "#636370",
          lineHeight: 1.6,
        }}>
          Part of the <a href="https://alione.cc" style={{ color: "#9A9AA8", textDecoration: "none" }}>AliOne</a> ecosystem.
          <span style={{ display: "block", marginTop: 4 }}>
            Secure • Private • Open
          </span>
        </div>
      </div>
    </div>
  );
}
