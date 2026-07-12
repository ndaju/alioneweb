"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Inbox, Send, FileText, Settings, Trash2, Reply, Loader2, CheckCircle2, Mail, X, PenBox, RefreshCw, LogOut, Archive } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

type Email = { id: number; from: string; fromName: string; subject: string; preview: string; body: string; html: string; date: string; unread: boolean; seen: boolean; };
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
  const sizes = { sm: "w-9 h-9 text-xs rounded-lg", md: "w-10 h-10 text-sm rounded-xl", lg: "w-12 h-12 text-base rounded-xl" };
  return <div className={`${sizes[size]} bg-gradient-to-br ${c} border border-white/[0.08] flex items-center justify-center font-semibold flex-shrink-0 text-white/80`}>{l}</div>;
}

function Skel() {
  return (
    <div className="flex gap-4 p-5 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="flex justify-between"><div className="h-4 rounded-md bg-white/[0.05] w-36" /><div className="h-3.5 rounded-md bg-white/[0.04] w-12" /></div>
        <div className="h-4 rounded-md bg-white/[0.04] w-3/4" />
        <div className="h-3.5 rounded-md bg-white/[0.03] w-1/2" />
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
      if (d.emails) setEmails(d.emails.map((e: any) => ({ id: e.id, from: e.from, fromName: e.fromName || e.from, subject: e.subject, preview: e.preview || "", body: "", html: "", date: fmt(e.date), unread: !e.seen, seen: e.seen })));
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
  if (!isLoaded) return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center"><Loader2 size={28} className="animate-spin text-white/20" /></div>;

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
    const e = emails.find(x => x.id === sel); if (!e) return;
    setTo(e.from); setSubj(e.subject.startsWith("Re:") ? e.subject : `Re: ${e.subject}`); setCompose(true);
  };

  const isMail = tab !== "settings";
  function sanitize(html: string) { return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, ""); }
  function dn(e: Email) { return (e.fromName && e.fromName !== e.from) ? e.fromName : e.from; }

  if (needClaim) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl border border-[#2A2A2E] bg-[#141416] flex items-center justify-center">
              <img src="/alione.png" className="w-6 h-6" />
            </div>
            <span className="font-outfit text-xl font-bold">AliOne Mail</span>
          </div>
          <h1 className="font-outfit text-3xl font-bold mb-2">Claim your email</h1>
          <p className="text-white/40 text-base mb-8">Choose your @alione.cc address</p>
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/40 mb-2 block font-medium">Email</label>
              <div className="flex">
                <input type="text" placeholder="username" value={uname} onChange={e => setUname(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} className="flex-1 bg-[#1C1C1F] border border-[#2A2A2E] rounded-l-xl px-4 py-3 text-base text-white placeholder:text-white/20 focus:outline-none font-mono" />
                <span className="bg-[#1C1C1F] border border-l-0 border-[#2A2A2E] rounded-r-xl px-4 py-3 text-white/40 text-base font-mono">@alione.cc</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-white/40 mb-2 block font-medium">Password</label>
              <input type="password" placeholder="Strong password" value={pw} onChange={e => setPw(e.target.value)} className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-4 py-3 text-base text-white placeholder:text-white/20 focus:outline-none" />
            </div>
            {claimErr && <p className="text-red-400 text-sm">{claimErr}</p>}
            <button onClick={handleClaim} disabled={claiming || claimOk || !uname || !pw} className="w-full bg-white text-black text-base font-medium rounded-xl py-3 hover:bg-white/90 transition disabled:opacity-40 flex items-center justify-center gap-2">
              {claiming ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : claimOk ? <><CheckCircle2 size={16} /> Claimed!</> : "Claim Email"}
            </button>
            {claimOk && <p className="text-green-400 text-sm text-center">✓ {myEmail} is yours!</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0B] text-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-6 flex-shrink-0 border-b border-[#2A2A2E]" style={{ background: "rgba(14,14,16,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl border border-[#2A2A2E] bg-[#1C1C1F] flex items-center justify-center">
              <img src="/alione.png" className="w-5 h-5" />
            </div>
            <span className="text-base font-outfit font-semibold text-white/50 group-hover:text-white/70 transition-colors">Mail</span>
          </a>
          <div className="w-px h-6 bg-[#2A2A2E]" />
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => setTab(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer border-none ${
                    tab === item.key
                      ? "bg-[#1C1C1F] text-white/80 font-medium"
                      : "bg-transparent text-white/35 hover:text-white/55 hover:bg-[#1C1C1F]/50"
                  }`}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCompose(true)} className="bg-white text-black text-sm font-medium rounded-lg px-5 py-2 hover:bg-white/90 transition flex items-center gap-2 cursor-pointer border-none">
            <PenBox size={15} /> Compose
          </button>
          <button onClick={fetchList} disabled={loading} className="p-2 rounded-lg hover:bg-[#1C1C1F] text-white/25 hover:text-white/50 transition-all disabled:opacity-30 cursor-pointer border-none bg-transparent">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="w-px h-6 bg-[#2A2A2E]" />
          <UserMenu user={user} myEmail={myEmail} signOut={signOut} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0">

        {/* Email list */}
        <div className="w-[440px] min-w-[340px] border-r border-[#2A2A2E] flex flex-col flex-shrink-0 bg-[#111113]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222226] flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/50 uppercase tracking-wider">{tab}</span>
              {isMail && emails.length > 0 && <span className="text-xs text-white/25 bg-[#1C1C1F] border border-[#2A2A2E] px-2.5 py-0.5 rounded-full">{emails.length}</span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isMail ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Settings size={36} className="mx-auto mb-4 text-white/10" />
                  <p className="text-base text-white/25">Settings</p>
                  <p className="text-sm text-white/10 mt-1">Coming soon</p>
                </div>
              </div>
            ) : loading ? (
              <div><Skel /><Skel /><Skel /><Skel /></div>
            ) : error ? (
              <div className="flex items-center justify-center h-full px-6">
                <div className="text-center">
                  <p className="text-sm text-red-400/50">{error}</p>
                  <button onClick={fetchList} className="text-sm text-white/25 hover:text-white/50 mt-3 underline cursor-pointer bg-transparent border-none">Retry</button>
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#1C1C1F] border border-[#2A2A2E] flex items-center justify-center mx-auto mb-5">
                    <Mail size={28} className="text-white/15" />
                  </div>
                  <p className="text-base text-white/30 font-medium">No emails</p>
                  <p className="text-sm text-white/15 mt-1.5">{tab === "inbox" ? "Your inbox is empty" : tab === "sent" ? "No sent emails" : "No drafts"}</p>
                  {tab === "inbox" && (
                    <button onClick={() => setCompose(true)} className="mt-6 text-sm bg-[#1C1C1F] hover:bg-[#222226] text-white/40 border border-[#2A2A2E] px-5 py-2.5 rounded-xl transition cursor-pointer">
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
                    className={`w-full text-left px-5 py-4 border-b border-[#1C1C1F] transition cursor-pointer ${
                      isSel ? "bg-[#1C1C1F]" : "bg-transparent hover:bg-white/[0.02]"
                    }`}>
                    {email.unread && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3B82F6]" />}
                    <div className="flex gap-4">
                      <Avatar email={email.from} name={dn(email)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[15px] truncate ${email.unread ? "font-semibold text-white" : "text-white/50"}`}>{dn(email)}</span>
                          <span className="text-xs text-white/20 flex-shrink-0 ml-4">{email.date}</span>
                        </div>
                        <p className={`text-sm truncate mb-1 ${email.unread ? "font-medium text-white/70" : "text-white/35"}`}>{email.subject}</p>
                        {email.preview && <p className="text-xs text-white/20 truncate">{email.preview}</p>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Reader */}
        <div ref={rRef} className="flex-1 flex flex-col overflow-y-auto bg-[#0A0A0B]">
          {loadingBody ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-white/20" /></div>
          ) : selected && sel ? (
            <>
              <div className="flex items-center gap-2 px-8 py-3 border-b border-[#222226] flex-shrink-0">
                <button onClick={reply} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#1C1C1F] text-white/35 hover:text-white/60 text-sm transition cursor-pointer bg-transparent border-none">
                  <Reply size={16} /> Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#1C1C1F] text-white/35 hover:text-white/60 text-sm transition cursor-pointer bg-transparent border-none">
                  <Archive size={16} /> Archive
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-10 py-10">
                  <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-8 mb-8">
                    <div className="flex items-start gap-5">
                      <Avatar email={selected.from} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h1 className="font-outfit font-semibold text-2xl text-white leading-tight mb-3">{selected.subject || "(no subject)"}</h1>
                        <p className="text-base text-white/50">{selected.from}</p>
                        <p className="text-sm text-white/25 mt-1.5">{fullDate(selected.date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-base leading-[1.9]">
                    {selected.html ? (
                      <div className="prose prose-invert max-w-none text-white/60 [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_img]:max-w-full [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: sanitize(selected.html) }} />
                    ) : selected.body ? (
                      <div className="text-white/50 whitespace-pre-line">{selected.body}</div>
                    ) : (
                      <div className="text-white/15 italic">Empty message</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : emails.length > 0 && !sel ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><Inbox size={48} className="mx-auto mb-5 text-white/8" /><p className="text-base text-white/15">Select a message to read</p></div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><Mail size={48} className="mx-auto mb-5 text-white/[0.06]" /><p className="text-base text-white/10">No message selected</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl bg-[#111113] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#2A2A2E]">
              <h2 className="text-lg font-outfit font-semibold">New message</h2>
              <button onClick={() => { setCompose(false); setSendErr(""); setSendOk(false); }} className="p-1.5 rounded-lg hover:bg-[#1C1C1F] text-white/25 hover:text-white/50 transition cursor-pointer bg-transparent border-none"><X size={20} /></button>
            </div>
            <div className="p-8">
              <div className="space-y-5">
                <input type="email" placeholder="To" value={to} onChange={e => setTo(e.target.value)} className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition" />
                <input type="text" placeholder="Subject" value={subj} onChange={e => setSubj(e.target.value)} className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition" />
                <textarea placeholder="Write your message..." value={body} onChange={e => setBody(e.target.value)} rows={12} className="w-full bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl px-5 py-3.5 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 resize-none leading-relaxed transition" />
                {sendErr && <p className="text-red-400 text-sm">{sendErr}</p>}
                {sendOk && <p className="text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> Sent!</p>}
              </div>
              <div className="flex justify-end gap-4 pt-5">
                <button onClick={() => { setCompose(false); setSendErr(""); setSendOk(false); }} className="px-6 py-2.5 text-base text-white/40 hover:text-white/60 transition cursor-pointer bg-transparent border-none">Cancel</button>
                <button onClick={handleSend} disabled={sending || sendOk || !to || !body} className="px-8 py-2.5 bg-white text-black text-base font-medium rounded-xl hover:bg-white/90 transition disabled:opacity-40 flex items-center gap-2 cursor-pointer border-none">
                  {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, myEmail, signOut }: { user: any; myEmail: string | null; signOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user?.fullName || myEmail?.split("@")[0] || "U";
  const initial = displayName[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-[#2A2A2E] flex items-center justify-center text-sm font-semibold text-white/50 hover:text-white/70 hover:border-white/20 transition-all cursor-pointer">
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-[#141416] border border-[#2A2A2E] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="px-5 py-4 border-b border-[#2A2A2E]">
            <p className="text-sm text-white/60 font-medium">{displayName}</p>
            <p className="text-xs text-white/30 mt-1">{myEmail || "No email"}</p>
          </div>
          <div className="p-1.5">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/40 hover:text-white/70 hover:bg-[#1C1C1F] rounded-lg transition">
              Dashboard
            </a>
            <button onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-[#1C1C1F] rounded-lg transition cursor-pointer bg-transparent border-none text-left">
              <LogOut size={14} /> Sign out
            </button>
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
