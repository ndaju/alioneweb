"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Inbox, Send, FileText, Settings, Trash2, Reply, Sparkles,
  Loader2, CheckCircle2, Mail, X, PenBox, RefreshCw, LogOut,
  ChevronRight, ChevronLeft, Search, Paperclip, Clock, Star,
  Inbox as InboxIcon,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

type Email = {
  id: number; from: string; fromName: string; subject: string;
  preview: string; body: string; html: string; date: string; dateRaw: string;
  starred: boolean; unread: boolean; seen: boolean;
};

type NavItem = "inbox" | "sent" | "drafts" | "settings";
type TabItem = { key: NavItem; label: string; icon: any; count?: number };

const NAV_ITEMS: TabItem[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

const AVATAR_GRADIENTS = [
  "from-sky-400/30 to-blue-500/30", "from-fuchsia-400/30 to-purple-500/30",
  "from-amber-400/30 to-orange-500/30", "from-emerald-400/30 to-teal-500/30",
  "from-rose-400/30 to-pink-500/30", "from-violet-400/30 to-indigo-500/30",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Avatar({ email, name, size = "md" }: { email: string; name?: string; size?: "sm" | "md" | "lg" }) {
  const idx = hashStr(email) % AVATAR_GRADIENTS.length;
  const letter = (name || email || "?")[0].toUpperCase();
  const map = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-xl" };
  return (
    <div className={`${map[size]} rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[idx]} border border-white/[0.08] flex items-center justify-center font-semibold flex-shrink-0 text-white/80`}>
      {letter}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="px-6 py-5 flex gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-white/[0.03] flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="flex justify-between"><div className="h-3.5 rounded-md bg-white/[0.03] w-36" /><div className="h-3 rounded-md bg-white/[0.03] w-12" /></div>
        <div className="h-3.5 rounded-md bg-white/[0.03] w-4/5" />
        <div className="h-3 rounded-md bg-white/[0.03] w-3/5" />
      </div>
    </div>
  );
}

type ReaderData = { body: string; html: string; from: string; subject: string; date: string };

export default function MailDashboard() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [tab, setTab] = useState<NavItem>("inbox");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rd, setRd] = useState<ReaderData | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [sendOk, setSendOk] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const metaEmail = user?.publicMetadata?.claimedEmail as string | undefined;
  const myEmail = claimedEmail || metaEmail || null;
  const needClaim = !myEmail && !claimSuccess;

  const mailbox: Record<NavItem, string> = { inbox: "INBOX", sent: "Sent", drafts: "Drafts", settings: "INBOX" };

  const fetchList = useCallback(async () => {
    setLoading(true); setError(""); setSelectedId(null); setRd(null);
    const mb = mailbox[tab];
    if (!mb || tab === "settings") { setLoading(false); setEmails([]); return; }
    try {
      const r = await fetch(`/api/mail/list?mailbox=${encodeURIComponent(mb)}`);
      const d = await r.json();
      if (d.emails) setEmails(d.emails.map((e: any) => ({
        id: e.id, from: e.from, fromName: e.fromName || e.from, subject: e.subject,
        preview: e.preview || "", body: "", html: "", date: fmt(e.date), dateRaw: e.date,
        starred: false, unread: !e.seen, seen: e.seen,
      })));
      else if (d.error) setError(d.error);
    } catch { setError("Connection error"); } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { if (myEmail && isLoaded) fetchList(); }, [myEmail, isLoaded, fetchList]);

  useEffect(() => {
    if (!selectedId || !isLoaded || !myEmail) return;
    setLoadingBody(true); setRd(null);
    fetch(`/api/mail/read?uid=${selectedId}`).then(r => r.json()).then(d => {
      if (d.body || d.html) { setRd(d); setEmails(p => p.map(e => e.id === selectedId ? { ...e, body: d.body, html: d.html, unread: false } : e)); }
    }).catch(() => {}).finally(() => setLoadingBody(false));
  }, [selectedId, isLoaded, myEmail]);

  useEffect(() => { if (readerRef.current) readerRef.current.scrollTop = 0; }, [selectedId]);

  if (!isSignedIn) return null;
  if (!isLoaded) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 size={24} className="animate-spin text-white/30" /></div>;

  const selected = rd;

  const handleClaim = async () => {
    if (!username || !password1) return;
    setClaiming(true); setClaimError(""); setClaimSuccess(false);
    try {
      const r = await fetch("/api/claim-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, domain: "alione.cc", password: password1 }) });
      const d = await r.json();
      if (d.success) { setClaimedEmail(d.email); setClaimSuccess(true); } else setClaimError(d.error || "Failed");
    } catch { setClaimError("Connection error"); } finally { setClaiming(false); }
  };

  const handleSend = async () => {
    if (!to || !body) return;
    setSending(true); setSendErr(""); setSendOk(false);
    try {
      const r = await fetch("/api/mail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, subject: subj, text: body }) });
      const d = await r.json();
      if (d.success) { setSendOk(true); setTimeout(() => { setComposeOpen(false); setTo(""); setSubj(""); setBody(""); setSendOk(false); }, 1500); }
      else setSendErr(d.error || "Failed");
    } catch { setSendErr("Connection error"); } finally { setSending(false); }
  };

  const reply = () => {
    if (!selected || !selectedId) return;
    const e = emails.find(x => x.id === selectedId);
    if (!e) return;
    setTo(e.from); setSubj(e.subject.startsWith("Re:") ? e.subject : `Re: ${e.subject}`); setComposeOpen(true);
  };

  const isMail = tab !== "settings";

  function sanitize(html: string) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, "");
  }

  function displayName(e: Email) { return (e.fromName && e.fromName !== e.from) ? e.fromName : e.from; }

  if (needClaim) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10"><img src="/alione.png" className="w-9 h-9 rounded-xl" /><span className="text-lg font-outfit font-semibold">AliOne Mail</span></div>
          <h1 className="text-2xl font-outfit font-bold mb-1">Claim your email</h1>
          <p className="text-white/40 text-sm mb-8">Choose your @alione.cc address</p>
          <div className="space-y-4">
            <div><label className="text-xs text-white/30 mb-1.5 block">Email</label>
              <div className="flex"><input type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} className="flex-1 bg-white/5 border border-white/10 rounded-l-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono" />
                <span className="bg-white/5 border border-l-0 border-white/10 px-3 py-2.5 text-white/40 text-sm font-mono">@alione.cc</span></div></div>
            <div><label className="text-xs text-white/30 mb-1.5 block">Password</label><input type="password" placeholder="Strong password" value={password1} onChange={e => setPassword1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20" /></div>
            {claimError && <p className="text-red-400 text-xs">{claimError}</p>}
            <button onClick={handleClaim} disabled={claiming || claimSuccess || !username || !password1} className="w-full bg-white text-black text-sm font-medium rounded-xl py-2.5 hover:bg-white/90 transition disabled:opacity-40 flex items-center justify-center gap-2">
              {claiming ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : claimSuccess ? <><CheckCircle2 size={14} /> Claimed!</> : "Claim Email"}
            </button>
            {claimSuccess && <p className="text-green-400 text-xs text-center">✓ {myEmail} is yours!</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 flex-shrink-0 bg-[#070707]">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="flex items-center gap-2 group">
            <img src="/alione.png" className="w-6 h-6 rounded-lg" />
            <span className="text-xs font-outfit font-semibold text-white/40 group-hover:text-white/60 transition">Mail</span>
          </a>
          <div className="h-4 w-px bg-white/[0.04]" />
          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => setTab(item.key)} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition ${tab === item.key ? "bg-white/8 text-white font-medium" : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"}`}>
                  <Icon size={13} /><span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setComposeOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded-md hover:bg-white/90 transition shadow-sm"><PenBox size={12} />Compose</button>
          <button onClick={fetchList} disabled={loading} className="p-1.5 rounded-md hover:bg-white/[0.03] text-white/20 hover:text-white/40 transition disabled:opacity-30"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /></button>
          <div className="h-4 w-px bg-white/[0.04]" />
          <button onClick={() => signOut()} className="p-1.5 rounded-md hover:bg-white/[0.03] text-white/15 hover:text-white/30 transition"><LogOut size={13} /></button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* List panel */}
        <div className={`${showSidebar ? "w-[420px] min-w-[300px]" : "w-0 min-w-0 overflow-hidden"} border-r border-white/[0.04] flex flex-col flex-shrink-0 bg-[#070707] transition-all duration-200`}>
          {showSidebar && (
            <>
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.04] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{tab}</span>
                  {isMail && emails.length > 0 && <span className="text-[10px] text-white/15 bg-white/[0.03] px-1.5 py-0.5 rounded-full">{emails.length}</span>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {!isMail ? (
                  <div className="flex items-center justify-center h-full text-white/10"><div className="text-center"><Settings size={28} className="mx-auto mb-2 opacity-30" /><p className="text-xs text-white/20">Settings</p><p className="text-[10px] text-white/10 mt-1">Coming soon</p></div></div>
                ) : loading ? (
                  <div className="divide-y divide-white/[0.02]"><Skeleton /><Skeleton /><Skeleton /></div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full px-6"><div className="text-center"><p className="text-xs text-red-400/50">{error}</p><button onClick={fetchList} className="text-[11px] text-white/25 hover:text-white/50 mt-2 underline">Retry</button></div></div>
                ) : emails.length === 0 ? (
                  <div className="flex items-center justify-center h-full"><div className="text-center px-10"><div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mx-auto mb-4"><Mail size={22} className="text-white/15" /></div><p className="text-xs text-white/30 font-medium">No emails</p><p className="text-[10px] text-white/15 mt-1">{tab === "inbox" ? "Inbox is empty" : tab === "sent" ? "No sent emails" : "No drafts"}</p>{tab === "inbox" && <button onClick={() => setComposeOpen(true)} className="mt-4 text-[11px] bg-white/8 hover:bg-white/12 text-white/40 px-3 py-1.5 rounded-md transition">Compose</button>}</div></div>
                ) : (
                  <div className="divide-y divide-white/[0.02]">
                    {emails.map(email => {
                      const isSel = selectedId === email.id;
                      return (
                        <button key={email.id} onClick={() => setSelectedId(email.id)} className={`w-full text-left px-5 py-4 hover:bg-white/[0.015] transition relative ${isSel ? "bg-white/[0.02]" : ""} ${email.unread ? "bg-white/[0.01]" : ""}`}>
                          {email.unread && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400/40" />}
                          <div className="flex gap-3.5">
                            <Avatar email={email.from} name={displayName(email)} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <span className={`text-sm truncate ${email.unread ? "font-semibold text-white" : "text-white/55"}`}>{displayName(email)}</span>
                                <span className="text-[10px] text-white/20 flex-shrink-0 pt-0.5">{email.date}</span>
                              </div>
                              <p className={`text-xs truncate ${email.unread ? "font-medium text-white/70" : "text-white/35"}`}>{email.subject}</p>
                              {email.preview && <p className="text-[11px] text-white/20 truncate mt-1 line-clamp-1">{email.preview}</p>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
          <button onClick={() => setShowSidebar(!showSidebar)} className="flex-shrink-0 h-7 border-t border-white/[0.04] flex items-center justify-center text-white/15 hover:text-white/30 hover:bg-white/[0.02] transition">
            {showSidebar ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>

        {/* Reader */}
        <div ref={readerRef} className="flex-1 flex flex-col overflow-y-auto bg-[#050505]">
          {loadingBody ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>
          ) : selected && selectedId ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-6 py-2 border-b border-white/[0.04] flex-shrink-0 bg-[#070707]/50">
                <button onClick={reply} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/[0.03] text-white/25 hover:text-white/45 text-[11px] transition"><Reply size={12} />Reply</button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/[0.03] text-white/25 hover:text-white/45 text-[11px] transition"><Trash2 size={12} />Delete</button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-8 py-10">
                  {/* Header card */}
                  <div className="bg-white/[0.015] border border-white/[0.04] rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <Avatar email={selected.from} size="lg" />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h1 className="font-outfit font-semibold text-xl text-white leading-tight mb-2">{selected.subject || "(no subject)"}</h1>
                        <div className="space-y-0.5">
                          <p className="text-sm text-white/55">{selected.from}</p>
                          <p className="text-[11px] text-white/20">{fullDate(selected.date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="px-1">
                    {selected.html ? (
                      <div className="prose prose-invert max-w-none text-sm leading-[1.8] [&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_img]:max-w-full [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: sanitize(selected.html) }} />
                    ) : selected.body ? (
                      <div className="text-white/55 whitespace-pre-line text-sm leading-[1.8]">{selected.body}</div>
                    ) : <div className="text-white/15 text-sm italic">Empty message</div>}
                  </div>
                </div>
              </div>
            </>
          ) : emails.length > 0 && !selectedId ? (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><InboxIcon size={36} className="mx-auto mb-3 text-white/10" /><p className="text-xs text-white/20">Select a message</p></div></div>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><Mail size={36} className="mx-auto mb-3 text-white/8" /><p className="text-xs text-white/15">No message selected</p></div></div>
          )}
        </div>
      </div>

      {/* Compose */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-outfit font-semibold">New message</h2>
              <button onClick={() => { setComposeOpen(false); setSendErr(""); setSendOk(false); }} className="text-white/20 hover:text-white/40 transition"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <input type="email" placeholder="To" value={to} onChange={e => setTo(e.target.value)} className="w-full bg-white/5 border border-white/[0.06] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15" />
              <input type="text" placeholder="Subject" value={subj} onChange={e => setSubj(e.target.value)} className="w-full bg-white/5 border border-white/[0.06] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15" />
              <textarea placeholder="Write..." value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full bg-white/5 border border-white/[0.06] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 resize-none" />
              {sendErr && <p className="text-red-400 text-xs">{sendErr}</p>}
              {sendOk && <p className="text-green-400 text-xs flex items-center gap-1.5"><CheckCircle2 size={12} />Sent!</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => { setComposeOpen(false); setSendErr(""); setSendOk(false); }} className="px-4 py-2 text-xs text-white/40 hover:text-white/60 transition">Cancel</button>
                <button onClick={handleSend} disabled={sending || sendOk || !to || !body} className="px-5 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-white/90 transition disabled:opacity-40 flex items-center gap-1.5">
                  {sending ? <><Loader2 size={12} className="animate-spin" />Sending</> : <><Send size={12} />Send</>}
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
