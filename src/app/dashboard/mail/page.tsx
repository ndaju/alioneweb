"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import {
  Inbox,
  Send,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Reply,
  Sparkles,
  Loader2,
  CheckCircle2,
  Mail,
  X,
  PenBox,
  RefreshCw,
  Archive,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

type Email = {
  id: number;
  from: string;
  fromName: string;
  subject: string;
  preview: string;
  body: string;
  html: string;
  date: string;
  dateRaw: string;
  starred: boolean;
  unread: boolean;
  seen: boolean;
};

type NavItem = "inbox" | "sent" | "drafts" | "settings";

const NAV_ITEMS: { key: NavItem; label: string; icon: any }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

const AVATAR_COLORS = [
  "from-blue-500/30 to-cyan-500/30",
  "from-purple-500/30 to-pink-500/30",
  "from-amber-500/30 to-orange-500/30",
  "from-green-500/30 to-emerald-500/30",
  "from-rose-500/30 to-red-500/30",
  "from-indigo-500/30 to-violet-500/30",
  "from-teal-500/30 to-cyan-500/30",
  "from-pink-500/30 to-rose-500/30",
];

function hashEmail(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function Avatar({ email, name, size = "sm" }: { email: string; name?: string; size?: "sm" | "md" | "lg" }) {
  const colorIdx = hashEmail(email) % AVATAR_COLORS.length;
  const letter = (name || email || "?")[0].toUpperCase();
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-13 h-13 min-w-[52px] min-h-[52px] text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} border border-white/10 flex items-center justify-center font-semibold flex-shrink-0`}>
      {letter}
    </div>
  );
}

function EmailSkeleton() {
  return (
    <div className="px-6 py-5 border-b border-white/[0.04] flex gap-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-white/[0.04] flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="flex justify-between"><div className="h-3 rounded-full bg-white/[0.04] w-28" /><div className="h-3 rounded-full bg-white/[0.04] w-12" /></div>
        <div className="h-3 rounded-full bg-white/[0.04] w-full" />
        <div className="h-3 rounded-full bg-white/[0.04] w-3/5" />
      </div>
    </div>
  );
}

type ReaderData = { body: string; html: string; from: string; subject: string; date: string };

export default function MailDashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeNav, setActiveNav] = useState<NavItem>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [forceClaimForm, setForceClaimForm] = useState(false);
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("alione.cc");
  const [password1, setPassword1] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const metadataEmail = user?.publicMetadata?.claimedEmail as string | undefined;
  const resolvedEmail = claimedEmail || metadataEmail || null;
  const showClaimForm = (!resolvedEmail || forceClaimForm) && !claimSuccess;

  const mailboxForNav: Record<NavItem, string> = { inbox: "INBOX", sent: "Sent", drafts: "Drafts", settings: "INBOX" };

  const fetchEmails = useCallback(async () => {
    setLoadingEmails(true);
    setEmailError("");
    setSelectedEmail(null);
    setReaderData(null);
    const mailbox = mailboxForNav[activeNav];
    if (!mailbox || activeNav === "settings") { setLoadingEmails(false); setEmails([]); return; }
    try {
      const res = await fetch(`/api/mail/list?mailbox=${encodeURIComponent(mailbox)}`);
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails.map((e: any) => ({
          id: e.id, from: e.from, fromName: e.fromName || e.from, subject: e.subject,
          preview: e.preview || "", body: "", html: "", date: formatRelativeTime(e.date),
          dateRaw: e.date, starred: false, unread: !e.seen, seen: e.seen,
        })));
      } else if (data.error) setEmailError(data.error);
    } catch { setEmailError("Connection error");
    } finally { setLoadingEmails(false); }
  }, [activeNav]);

  useEffect(() => { if (resolvedEmail && userLoaded) fetchEmails(); }, [resolvedEmail, userLoaded, fetchEmails]);

  useEffect(() => {
    if (!selectedEmail || !userLoaded || !resolvedEmail) return;
    setLoadingBody(true); setReaderData(null);
    fetch(`/api/mail/read?uid=${selectedEmail}`).then(r => r.json()).then(data => {
      if (data.body || data.html) { setReaderData(data); setEmails(p => p.map(e => e.id === selectedEmail ? { ...e, body: data.body, html: data.html, unread: false } : e)); }
    }).catch(() => {}).finally(() => setLoadingBody(false));
  }, [selectedEmail, userLoaded, resolvedEmail]);

  useEffect(() => { if (readerRef.current) readerRef.current.scrollTop = 0; }, [selectedEmail]);

  if (!isSignedIn) return null;
  if (!userLoaded) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><Loader2 size={24} className="animate-spin text-white/40" /></div>;

  const initial = (user?.fullName || user?.primaryEmailAddress?.emailAddress || "?")[0].toUpperCase();
  const selected = readerData;

  const handleClaim = async () => {
    if (!username || !password1) return;
    setClaiming(true); setClaimError(""); setClaimSuccess(false);
    try {
      const res = await fetch("/api/claim-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, domain, password: password1 }) });
      const data = await res.json();
      if (data.success) { setClaimedEmail(data.email); setClaimSuccess(true); setForceClaimForm(false); }
      else setClaimError(data.error || "Failed to claim email");
    } catch { setClaimError("Connection error"); } finally { setClaiming(false); }
  };

  const handleSend = async () => {
    if (!composeTo || !composeBody) return;
    setSending(true); setSendError(""); setSendSuccess(false);
    try {
      const res = await fetch("/api/mail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: composeTo, subject: composeSubject, text: composeBody }) });
      const data = await res.json();
      if (data.success) { setSendSuccess(true); setTimeout(() => { setShowCompose(false); setComposeTo(""); setComposeSubject(""); setComposeBody(""); setSendSuccess(false); }, 1500); }
      else setSendError(data.error || "Failed to send");
    } catch { setSendError("Connection error"); } finally { setSending(false); }
  };

  const handleReply = () => {
    if (!selected || !selectedEmail) return;
    const email = emails.find(e => e.id === selectedEmail);
    if (!email) return;
    setComposeTo(email.from);
    setComposeSubject(email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`);
    setShowCompose(true);
  };

  const isMailView = activeNav !== "settings";

  function sanitizeHTML(html: string): string {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, "");
  }

  function getDisplayName(email: Email): string {
    if (email.fromName && email.fromName !== email.from) return email.fromName;
    return email.from;
  }

  if (showClaimForm) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <a href="https://alione.cc"><img src="/alione.png" alt="AliOne" className="w-8 h-8 rounded-lg" /></a>
              <span className="text-xl font-outfit font-semibold">{resolvedEmail || "AliOne Mail"}</span>
            </div>
            <h1 className="text-3xl font-outfit font-bold mb-2">Claim Your Email</h1>
            <p className="text-white/50 mb-8">Choose your @alione.cc email address to get started.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/40 mb-2">Email Address</label>
                <div className="flex items-center gap-0">
                  <input type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} className="flex-1 bg-white/5 border border-white/10 rounded-l-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono text-sm" />
                  <span className="bg-white/5 border border-l-0 border-white/10 px-4 py-3 text-white/40 font-mono text-sm">@</span>
                  <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-white/5 border border-l-0 border-white/10 rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 font-mono text-sm cursor-pointer"><option value="alione.cc" className="bg-[#0a0a0a]">alione.cc</option></select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-2">Password</label>
                <input type="password" placeholder="Choose a strong password" value={password1} onChange={e => setPassword1(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20" />
              </div>
              {claimError && <p className="text-red-400 text-sm">{claimError}</p>}
              <button onClick={handleClaim} disabled={claiming || claimSuccess || !username || !password1} className={`w-full font-medium rounded-xl py-3 transition flex items-center justify-center gap-2 ${claimSuccess ? "bg-green-500 text-white" : "bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"}`}>
                {claiming ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : claimSuccess ? <><CheckCircle2 size={16} /> Claimed!</> : "Claim Email"}
              </button>
              {claimSuccess && <p className="text-green-400 text-sm text-center animate-pulse">✓ {resolvedEmail} is yours!</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] flex-shrink-0 bg-[#080808]">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
              <img src="/alione.png" alt="AliOne" className="w-4 h-4" />
            </div>
            <span className="text-sm font-outfit font-semibold tracking-tight text-white/60 group-hover:text-white/80 transition">AliOne Mail</span>
          </a>
          <span className="text-white/[0.06] text-lg">|</span>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => setActiveNav(item.key)} className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm transition ${activeNav === item.key ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"}`}>
                  <Icon size={16} /><span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition shadow-lg shadow-white/5">
            <PenBox size={14} /><span className="hidden sm:inline">Compose</span>
          </button>
          <button onClick={fetchEmails} disabled={loadingEmails} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition disabled:opacity-30"><RefreshCw size={15} className={loadingEmails ? "animate-spin" : ""} /></button>
          <div className="w-px h-5 bg-white/[0.06]" />
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="hidden md:block">{resolvedEmail}</span>
            <button onClick={() => signOut()} className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/40 transition"><LogOut size={14} /></button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
        {/* Email List */}
        <div className="w-[460px] min-w-[320px] border-r border-white/[0.06] flex flex-col flex-shrink-0 bg-[#080808]">
          {/* List header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-white/60 capitalize">{activeNav}</span>
              {isMailView && emails.length > 0 && <span className="text-xs text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{emails.length}</span>}
            </div>
            {resolvedEmail && <button onClick={() => setForceClaimForm(true)} className="text-xs text-white/20 hover:text-white/40 transition underline underline-offset-2">Change</button>}
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto">
            {!isMailView ? (
              <div className="flex items-center justify-center h-full text-white/20 px-8"><div className="text-center"><Settings size={36} className="mx-auto mb-3 opacity-30" /><p className="text-sm text-white/40 font-medium">Settings</p><p className="text-xs text-white/20 mt-1">Coming soon</p></div></div>
            ) : loadingEmails ? (
              <div><EmailSkeleton /><EmailSkeleton /><EmailSkeleton /><EmailSkeleton /><EmailSkeleton /></div>
            ) : emailError ? (
              <div className="flex items-center justify-center h-full px-6"><div className="text-center"><p className="text-sm text-red-400/60">{emailError}</p><button onClick={fetchEmails} className="text-xs text-white/30 hover:text-white/60 mt-3 underline">Retry</button></div></div>
            ) : emails.length === 0 ? (
              <div className="flex items-center justify-center h-full"><div className="text-center px-10"><Mail size={40} className="mx-auto mb-4 opacity-20" /><p className="text-sm text-white/40 font-medium">No emails yet</p><p className="text-xs text-white/20 mt-1.5">{activeNav === "inbox" ? "Your inbox is empty" : activeNav === "sent" ? "No sent emails" : "No drafts"}</p>{activeNav === "inbox" && <button onClick={() => setShowCompose(true)} className="mt-6 text-xs bg-white/10 hover:bg-white/15 text-white/50 px-4 py-2 rounded-lg transition">Send your first email</button>}</div></div>
            ) : (
              emails.map(email => {
                const isSelected = selectedEmail === email.id;
                return (
                  <button key={email.id} onClick={() => setSelectedEmail(email.id)} className={`w-full text-left px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition group ${isSelected ? "bg-white/[0.03]" : ""} ${email.unread ? "bg-white/[0.01]" : ""}`}>
                    <div className="flex gap-3.5">
                      <Avatar email={email.from} name={getDisplayName(email)} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-0.5">
                          <span className={`text-sm truncate ${email.unread ? "font-semibold text-white" : "text-white/65"}`}>{getDisplayName(email)}</span>
                          <span className="text-[11px] text-white/25 flex-shrink-0 pt-0.5">{email.date}</span>
                        </div>
                        <p className={`text-sm truncate ${email.unread ? "font-medium text-white/80" : "text-white/45"}`}>{email.subject}</p>
                        {email.preview && <p className="text-xs text-white/25 truncate mt-1 leading-relaxed">{email.preview}</p>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Email Reader */}
        <div ref={readerRef} className="flex-1 flex flex-col overflow-y-auto bg-[#050505]">
          {loadingBody ? (
            <div className="flex-1 flex items-center justify-center"><div className="flex flex-col items-center gap-3"><Loader2 size={20} className="animate-spin text-white/30" /><span className="text-xs text-white/20">Loading email...</span></div></div>
          ) : selected && selectedEmail ? (
            <div className="p-10 max-w-3xl mx-auto w-full">
              <div className="flex items-start gap-5 mb-8">
                <Avatar email={selected.from} size="lg" />
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="font-outfit font-semibold text-xl text-white leading-tight mb-1">{selected.subject}</h2>
                  <p className="text-sm text-white/50">{selected.from}</p>
                  <p className="text-xs text-white/25 mt-1">{formatFullDate(selected.date)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                  <button onClick={handleReply} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition" title="Reply"><Reply size={16} /></button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition" title="Archive"><Archive size={16} /></button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/50 transition" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-8">
                {selected.html ? (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed [&_a]:text-blue-400 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: sanitizeHTML(selected.html) }} />
                ) : selected.body ? (
                  <div className="text-white/65 whitespace-pre-line text-sm leading-[1.75]">{selected.body}</div>
                ) : <div className="text-white/25 text-sm italic">No content</div>}
              </div>
            </div>
          ) : emails.length > 0 && !selectedEmail ? (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><Sparkles size={44} className="mx-auto mb-4 opacity-20" /><p className="text-sm text-white/30">Select a message to read</p></div></div>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><Mail size={52} className="mx-auto mb-4 opacity-10" /><p className="text-sm text-white/20">No email selected</p></div></div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0c0c0c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-outfit font-semibold text-white">New Message</h2>
              <button onClick={() => { setShowCompose(false); setSendError(""); setSendSuccess(false); }} className="text-white/30 hover:text-white/60 transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input type="email" placeholder="To" value={composeTo} onChange={e => setComposeTo(e.target.value)} className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm" />
              <input type="text" placeholder="Subject" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm" />
              <textarea placeholder="Write your message..." value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={10} className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm resize-none" />
              {sendError && <p className="text-red-400 text-sm">{sendError}</p>}
              {sendSuccess && <p className="text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={14} /> Sent successfully!</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button onClick={() => { setShowCompose(false); setSendError(""); setSendSuccess(false); }} className="px-5 py-2.5 text-sm text-white/50 hover:text-white/80 transition">Cancel</button>
                <button onClick={handleSend} disabled={sending || sendSuccess || !composeTo || !composeBody} className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  {sending ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={15} /> Send</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
