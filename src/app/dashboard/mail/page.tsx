"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Inbox, Send, FileText, Settings, Trash2, Reply,
  Loader2, CheckCircle2, Mail, X, PenBox, RefreshCw, LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

type Email = {
  id: number; from: string; fromName: string; subject: string;
  preview: string; body: string; html: string; date: string;
  unread: boolean; seen: boolean;
};

type NavItem = "inbox" | "sent" | "drafts" | "settings";

const NAV_ITEMS: { key: NavItem; label: string; icon: any }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

const COLORS = [
  "from-sky-400/30 to-blue-500/30", "from-fuchsia-400/30 to-purple-500/30",
  "from-amber-400/30 to-orange-500/30", "from-emerald-400/30 to-teal-500/30",
  "from-rose-400/30 to-pink-500/30", "from-violet-400/30 to-indigo-500/30",
];

function h(e: string) { let n = 0; for (let i = 0; i < e.length; i++) n = ((n << 5) - n + e.charCodeAt(i)) | 0; return Math.abs(n); }

function Avatar({ email, name, size = "md" }: { email: string; name?: string; size?: "sm" | "md" | "lg" }) {
  const c = COLORS[h(email) % COLORS.length];
  const l = (name || email || "?")[0].toUpperCase();
  const d = { sm: "w-8 h-8 text-xs rounded-lg", md: "w-10 h-10 text-sm rounded-xl", lg: "w-12 h-12 text-base rounded-xl" };
  return <div className={`${d[size]} bg-gradient-to-br ${c} border border-white/[0.08] flex items-center justify-center font-semibold flex-shrink-0 text-white/80`}>{l}</div>;
}

function Skel() {
  return (
    <div className="flex gap-4 p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="flex justify-between"><div className="h-3.5 rounded-md bg-white/[0.04] w-32" /><div className="h-3 rounded-md bg-white/[0.04] w-10" /></div>
        <div className="h-3.5 rounded-md bg-white/[0.03] w-3/4" />
      </div>
    </div>
  );
}

type Rd = { body: string; html: string; from: string; subject: string; date: string };

export default function MailDashboard() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [tab, setTab] = useState<NavItem>("inbox");
  const [sel, setSel] = useState<number | null>(null);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimErr, setClaimErr] = useState("");
  const [claimOk, setClaimOk] = useState(false);
  const [uname, setUname] = useState("");
  const [pw, setPw] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rd, setRd] = useState<Rd | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [sendOk, setSendOk] = useState(false);
  const rRef = useRef<HTMLDivElement>(null);

  const metaEmail = user?.publicMetadata?.claimedEmail as string | undefined;
  const myEmail = claimedEmail || metaEmail || null;
  const needClaim = !myEmail && !claimOk;

  const mb: Record<NavItem, string> = { inbox: "INBOX", sent: "Sent", drafts: "Drafts", settings: "INBOX" };

  const fetchList = useCallback(async () => {
    setLoading(true); setError(""); setSel(null); setRd(null);
    const m = mb[tab];
    if (!m || tab === "settings") { setLoading(false); setEmails([]); return; }
    try {
      const r = await fetch(`/api/mail/list?mailbox=${encodeURIComponent(m)}`);
      const d = await r.json();
      if (d.emails) setEmails(d.emails.map((e: any) => ({
        id: e.id, from: e.from, fromName: e.fromName || e.from, subject: e.subject,
        preview: e.preview || "", body: "", html: "", date: fmt(e.date),
        unread: !e.seen, seen: e.seen,
      })));
      else if (d.error) setError(d.error);
    } catch { setError("Connection error"); } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { if (myEmail && isLoaded) fetchList(); }, [myEmail, isLoaded, fetchList]);

  useEffect(() => {
    if (!sel || !isLoaded || !myEmail) return;
    setLoadingBody(true); setRd(null);
    fetch(`/api/mail/read?uid=${sel}`).then(r => r.json()).then(d => {
      if (d.body || d.html) { setRd(d); setEmails(p => p.map(e => e.id === sel ? { ...e, body: d.body, html: d.html, unread: false } : e)); }
    }).catch(() => {}).finally(() => setLoadingBody(false));
  }, [sel, isLoaded, myEmail]);

  useEffect(() => { if (rRef.current) rRef.current.scrollTop = 0; }, [sel]);

  if (!isSignedIn) return null;
  if (!isLoaded) return <div className="min-h-screen" style={{ background: "var(--bg, #0A0A0B)" }}><div className="flex items-center justify-center min-h-screen"><Loader2 size={24} className="animate-spin" style={{ color: "var(--text-tertiary, #636370)" }} /></div></div>;

  const selected = rd;

  const handleClaim = async () => {
    if (!uname || !pw) return;
    setClaiming(true); setClaimErr(""); setClaimOk(false);
    try {
      const r = await fetch("/api/claim-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: uname, domain: "alione.cc", password: pw }) });
      const d = await r.json();
      if (d.success) { setClaimedEmail(d.email); setClaimOk(true); } else setClaimErr(d.error || "Failed");
    } catch { setClaimErr("Connection error"); } finally { setClaiming(false); }
  };

  const handleSend = async () => {
    if (!to || !body) return;
    setSending(true); setSendErr(""); setSendOk(false);
    try {
      const r = await fetch("/api/mail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, subject: subj, text: body }) });
      const d = await r.json();
      if (d.success) { setSendOk(true); setTimeout(() => { setCompose(false); setTo(""); setSubj(""); setBody(""); setSendOk(false); }, 1500); }
      else setSendErr(d.error || "Failed");
    } catch { setSendErr("Connection error"); } finally { setSending(false); }
  };

  const reply = () => {
    if (!selected || !sel) return;
    const e = emails.find(x => x.id === sel);
    if (!e) return;
    setTo(e.from); setSubj(e.subject.startsWith("Re:") ? e.subject : `Re: ${e.subject}`); setCompose(true);
  };

  const isMail = tab !== "settings";

  function sanitize(html: string) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, "");
  }

  function dn(e: Email) { return (e.fromName && e.fromName !== e.from) ? e.fromName : e.from; }

  // Claim form
  if (needClaim) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg, #0A0A0B)" }}>
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10" style={{ fontFamily: "var(--font-display)" }}>
              <img src="/alione.png" className="w-9 h-9 rounded-xl" style={{ border: "1px solid var(--border, #2A2A2E)" }} />
              <span style={{ fontSize: 18, fontWeight: 700 }}>AliOne Mail</span>
            </div>
            <h1 style={{ fontSize: 24, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 4 }}>Claim your email</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)", marginBottom: 32 }}>Choose your @alione.cc address</p>
            <div className="space-y-4" style={{ maxWidth: 400 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", marginBottom: 6, display: "block" }}>Email</label>
                <div className="flex" style={{ fontFamily: "var(--font-body)" }}>
                  <input type="text" placeholder="username" value={uname} onChange={e => setUname(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                    style={{ flex: 1, background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderRight: "none", borderRadius: "var(--radius-md, 12px) 0 0 var(--radius-md, 12px)", padding: "10px 16px", fontSize: 14, color: "var(--text, #F0F0F2)", outline: "none" }}
                    className="font-mono" />
                  <span style={{ background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderLeft: "none", borderRadius: "0 var(--radius-md, 12px) var(--radius-md, 12px) 0", padding: "10px 12px", fontSize: 14, color: "var(--text-tertiary, #636370)" }} className="font-mono">@alione.cc</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", marginBottom: 6, display: "block" }}>Password</label>
                <input type="password" placeholder="Strong password" value={pw} onChange={e => setPw(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-md, 12px)", padding: "10px 16px", fontSize: 14, color: "var(--text, #F0F0F2)", outline: "none", fontFamily: "var(--font-body)" }} />
              </div>
              {claimErr && <p style={{ color: "#f87171", fontSize: 12 }}>{claimErr}</p>}
              <button onClick={handleClaim} disabled={claiming || claimOk || !uname || !pw}
                className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                {claiming ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : claimOk ? <><CheckCircle2 size={14} /> Claimed!</> : "Claim Email"}
              </button>
              {claimOk && <p style={{ color: "#34D399", fontSize: 12, textAlign: "center" }}>✓ {myEmail} is yours!</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg, #0A0A0B)" }}>

      {/* Header */}
      <header style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, background: "rgba(20, 20, 22, 0.9)", borderBottom: "1px solid var(--border, #2A2A2E)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-5">
          <a href="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/alione.png" className="w-6 h-6 rounded-md" style={{ border: "1px solid var(--border, #2A2A2E)" }} />
            <span style={{ fontSize: 14, fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text-secondary, #9A9AA8)" }} className="group-hover" onMouseEnter={e => e.currentTarget.style.color = "var(--text, #F0F0F2)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"}>AliOne Mail</span>
          </a>
          <div style={{ width: 1, height: 20, background: "var(--border, #2A2A2E)" }} />
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: "var(--radius-md, 12px)", fontSize: 13, transition: "all 150ms", cursor: "pointer", border: "none", color: tab === item.key ? "var(--text, #F0F0F2)" : "var(--text-tertiary, #636370)", fontWeight: tab === item.key ? 500 : 400, background: tab === item.key ? "var(--bg-subtle, #1C1C1F)" : "transparent" }}>
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCompose(true)} className="btn btn-primary btn-sm">
            <PenBox size={13} /> Compose
          </button>
          <button onClick={fetchList} disabled={loading}
            style={{ padding: 8, borderRadius: "var(--radius-md, 12px)", cursor: "pointer", background: "none", border: "none", color: "var(--text-tertiary, #636370)", transition: "color 150ms" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div style={{ width: 1, height: 20, background: "var(--border, #2A2A2E)" }} />
          <span style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", display: "none" }} className="lg:block">{myEmail}</span>
          <button onClick={() => signOut()}
            style={{ padding: 8, borderRadius: "var(--radius-md, 12px)", cursor: "pointer", background: "none", border: "none", color: "var(--text-tertiary, #636370)", transition: "color 150ms" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0">

        {/* Email list */}
        <div className="w-[420px] min-w-[320px] flex flex-col flex-shrink-0" style={{ borderRight: "1px solid var(--border, #2A2A2E)", background: "var(--bg-elevated, #141416)" }}>
          {/* List header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle, #222226)" }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary, #9A9AA8)" }}>{tab}</span>
              {isMail && emails.length > 0 && (
                <span style={{ fontSize: 11, color: "var(--text-tertiary, #636370)", padding: "1px 8px", borderRadius: "var(--radius-full, 9999px)", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)" }}>{emails.length}</span>
              )}
            </div>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto">
            {!isMail ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Settings size={32} className="mx-auto mb-3" style={{ color: "var(--text-tertiary, #636370)", opacity: 0.3 }} />
                  <p style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)", opacity: 0.5 }}>Settings</p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", marginTop: 4, opacity: 0.5 }}>Coming soon</p>
                </div>
              </div>
            ) : loading ? (
              <div><Skel /><Skel /><Skel /></div>
            ) : error ? (
              <div className="flex items-center justify-center h-full px-6">
                <div className="text-center">
                  <p style={{ fontSize: 14, color: "#f87171", opacity: 0.5 }}>{error}</p>
                  <button onClick={fetchList} style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", cursor: "pointer", background: "none", border: "none", textDecoration: "underline", marginTop: 12 }}>Retry</button>
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-10">
                  <div style={{ width: 56, height: 56, borderRadius: "var(--radius-xl, 20px)", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Mail size={24} style={{ color: "var(--text-tertiary, #636370)", opacity: 0.3 }} />
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)", fontWeight: 500 }}>No emails</p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", marginTop: 4 }}>{tab === "inbox" ? "Your inbox is empty" : tab === "sent" ? "No sent emails" : "No drafts"}</p>
                  {tab === "inbox" && (
                    <button onClick={() => setCompose(true)}
                      style={{ marginTop: 20, fontSize: 12, color: "var(--text-secondary, #9A9AA8)", cursor: "pointer", padding: "8px 16px", borderRadius: "var(--radius-md, 12px)", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", transition: "all 150ms" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated, #141416)"; e.currentTarget.style.color = "var(--text, #F0F0F2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle, #1C1C1F)"; e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"; }}>
                      Compose your first email
                    </button>
                  )}
                </div>
              </div>
            ) : (
              emails.map(email => {
                const isSel = sel === email.id;
                return (
                  <button key={email.id} onClick={() => setSel(email.id)}
                    style={{ width: "100%", textAlign: "left", padding: "16px 20px", cursor: "pointer", background: "none", border: "none", borderBottom: "1px solid var(--border-subtle, #222226)", color: "var(--text, #F0F0F2)", position: "relative", transition: "background 150ms" }}
                    onMouseEnter={e => e.currentTarget.style.background = isSel ? "var(--bg-subtle, #1C1C1F)" : "rgba(255,255,255,0.015)"}
                    onMouseLeave={e => e.currentTarget.style.background = isSel ? "var(--bg-subtle, #1C1C1F)" : "transparent"}>
                    {email.unread && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--community, #3B82F6)" }} />}
                    <div className="flex gap-3">
                      <Avatar email={email.from} name={dn(email)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontSize: 14, fontWeight: email.unread ? 600 : 400, color: email.unread ? "var(--text, #F0F0F2)" : "var(--text-secondary, #9A9AA8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dn(email)}</span>
                          <span style={{ fontSize: 11, color: "var(--text-tertiary, #636370)", flexShrink: 0, marginLeft: 12 }}>{email.date}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: email.unread ? 500 : 400, color: email.unread ? "rgba(255,255,255,0.7)" : "var(--text-tertiary, #636370)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 1 }}>{email.subject}</p>
                        {email.preview && <p style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.preview}</p>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Reader */}
        <div ref={rRef} className="flex-1 flex flex-col overflow-y-auto" style={{ background: "var(--bg, #0A0A0B)" }}>
          {loadingBody ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={22} className="animate-spin" style={{ color: "var(--text-tertiary, #636370)" }} />
            </div>
          ) : selected && sel ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-6 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-subtle, #222226)" }}>
                <button onClick={reply}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-md, 12px)", cursor: "pointer", background: "none", border: "none", fontSize: 13, color: "var(--text-tertiary, #636370)", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
                  <Reply size={14} /> Reply
                </button>
                <button
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-md, 12px)", cursor: "pointer", background: "none", border: "none", fontSize: 13, color: "var(--text-tertiary, #636370)", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px" }}>
                  {/* Header card */}
                  <div style={{ background: "var(--bg-elevated, #141416)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-xl, 20px)", padding: 24, marginBottom: 32 }}>
                    <div className="flex items-start gap-4">
                      <Avatar email={selected.from} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--text, #F0F0F2)", lineHeight: 1.2, marginBottom: 8 }}>{selected.subject || "(no subject)"}</h1>
                        <p style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)" }}>{selected.from}</p>
                        <p style={{ fontSize: 12, color: "var(--text-tertiary, #636370)", marginTop: 4 }}>{fullDate(selected.date)}</p>
                      </div>
                    </div>
                  </div>
                  {/* Body */}
                  <div>
                    {selected.html ? (
                      <div className="prose prose-invert max-w-none text-sm leading-[1.8]" style={{ color: "rgba(255,255,255,0.6)" }}
                        dangerouslySetInnerHTML={{ __html: sanitize(selected.html) }} />
                    ) : selected.body ? (
                      <div style={{ color: "rgba(255,255,255,0.5)", whiteSpace: "pre-line", fontSize: 14, lineHeight: 1.8 }}>{selected.body}</div>
                    ) : (
                      <div style={{ color: "var(--text-tertiary, #636370)", fontSize: 14, fontStyle: "italic" }}>Empty message</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : emails.length > 0 && !sel ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Inbox size={40} className="mx-auto mb-4" style={{ color: "var(--text-tertiary, #636370)", opacity: 0.15 }} />
                <p style={{ fontSize: 14, color: "var(--text-secondary, #9A9AA8)", opacity: 0.4 }}>Select a message to read</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail size={40} className="mx-auto mb-4" style={{ color: "var(--text-tertiary, #636370)", opacity: 0.1 }} />
                <p style={{ fontSize: 14, color: "var(--text-tertiary, #636370)", opacity: 0.3 }}>No message selected</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-xl" style={{ background: "var(--bg-elevated, #141416)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-xl, 20px)", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border, #2A2A2E)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>New message</h2>
              <button onClick={() => { setCompose(false); setSendErr(""); setSendOk(false); }}
                style={{ padding: 4, cursor: "pointer", background: "none", border: "none", color: "var(--text-tertiary, #636370)", transition: "color 150ms" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text, #F0F0F2)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary, #636370)"}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="space-y-4">
                <input type="email" placeholder="To" value={to} onChange={e => setTo(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-md, 12px)", padding: "10px 16px", fontSize: 14, color: "var(--text, #F0F0F2)", outline: "none", fontFamily: "var(--font-body)" }} />
                <input type="text" placeholder="Subject" value={subj} onChange={e => setSubj(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-md, 12px)", padding: "10px 16px", fontSize: 14, color: "var(--text, #F0F0F2)", outline: "none", fontFamily: "var(--font-body)" }} />
                <textarea placeholder="Write your message..." value={body} onChange={e => setBody(e.target.value)} rows={10}
                  style={{ width: "100%", background: "var(--bg-subtle, #1C1C1F)", border: "1px solid var(--border, #2A2A2E)", borderRadius: "var(--radius-md, 12px)", padding: "10px 16px", fontSize: 14, color: "var(--text, #F0F0F2)", outline: "none", fontFamily: "var(--font-body)", resize: "none", lineHeight: 1.6 }} />
                {sendErr && <p style={{ color: "#f87171", fontSize: 13 }}>{sendErr}</p>}
                {sendOk && <p style={{ color: "#34D399", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={14} />Sent!</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setCompose(false); setSendErr(""); setSendOk(false); }}
                  style={{ padding: "10px 20px", fontSize: 14, color: "var(--text-secondary, #9A9AA8)", cursor: "pointer", background: "none", border: "none", borderRadius: "var(--radius-md, 12px)", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text, #F0F0F2)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary, #9A9AA8)"}>Cancel</button>
                <button onClick={handleSend} disabled={sending || sendOk || !to || !body}
                  className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {sending ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(d: string): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd}d`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(d: string): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
