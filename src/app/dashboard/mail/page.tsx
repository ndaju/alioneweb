"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import {
  Inbox, Send, FileText, Trash2, Reply, Loader2, CheckCircle2,
  Mail, X, PenBox, RefreshCw, LogOut, Search, AlertCircle,
  Menu, Paperclip, Trash, RotateCcw,
} from "lucide-react";

type Email = { id: number; from: string; fromName: string; subject: string; preview: string; body: string; html: string; date: string; unread: boolean; seen: boolean };
type Folder = "inbox" | "sent" | "drafts" | "trash";
type Rd = { body: string; html: string; from: string; fromAddr: string; subject: string; date: string };

const FOLDERS: { key: Folder; label: string; icon: typeof Inbox }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "trash", label: "Trash", icon: Trash2 },
];

const MAILBOX_MAP: Record<Folder, string> = { inbox: "INBOX", sent: "Sent", drafts: "Drafts", trash: "Trash" };

const COLORS = [
  ["#3B82F6", "#60A5FA"], ["#8B5CF6", "#A78BFA"], ["#F59E0B", "#FBBF24"],
  ["#10B981", "#34D399"], ["#EF4444", "#F87171"], ["#EC4899", "#F472B6"],
  ["#6366F1", "#818CF8"], ["#14B8A6", "#2DD4BF"],
];

function hs(s: string) { let n = 0; for (let i = 0; i < s.length; i++) n = ((n << 5) - n + s.charCodeAt(i)) | 0; return Math.abs(n); }
function ac(email: string) { return COLORS[hs(email) % COLORS.length]; }
function init(name: string, email: string) { return (name || email || "?")[0].toUpperCase(); }

function rDate(d: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now"; if (m < 60) return m + "m";
  const h = Math.floor(m / 60); if (h < 24) return h + "h";
  const dd = Math.floor(h / 24); if (dd < 7) return dd + "d";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function dn(e: Email) { return (e.fromName && e.fromName !== e.from) ? e.fromName : e.from.split("@")[0]; }

function clean(html: string) {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "").replace(/on\w+='[^']*'/gi, "")
    .replace(/style="[^"]*position:\s*fixed[^"]*"/gi, "");
}

function Avatar({ email, name, size = 40, addr }: { email: string; name?: string; size?: number; addr?: string }) {
  const [imgErr, setImgErr] = useState(false);
  const [bg, fg] = ac(email);
  const l = init(name || "", email);
  const imgUrl = addr && !imgErr ? `https://unavatar.io/${encodeURIComponent(addr.trim().toLowerCase())}?fallback=false` : null;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: imgUrl ? "transparent" : `linear-gradient(135deg, ${bg}40, ${fg}30)`, border: `1px solid ${imgUrl ? "transparent" : bg + "30"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", position: "relative" }}>
      {imgUrl ? <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} onError={() => setImgErr(true)} /> : null}
      {!imgUrl ? <span style={{ fontSize: size * 0.38, fontWeight: 600, color: fg, fontFamily: "var(--font-display), sans-serif" }}>{l}</span> : null}
    </div>
  );
}

function Skel() {
  return (
    <div style={{ display: "flex", gap: 16, padding: "20px 24px" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, paddingTop: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ width: 120, height: 14, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} /><div style={{ width: 36, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} /></div>
        <div style={{ width: "70%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
        <div style={{ width: "45%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.03)" }} />
      </div>
    </div>
  );
}

const cbStyle: React.CSSProperties = { width: 18, height: 18, borderRadius: 4, border: "2px solid #2A2A2E", background: "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" };

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      <div
        onClick={onChange}
        style={{ ...cbStyle, background: checked ? "#3B82F6" : "transparent", borderColor: checked ? "#3B82F6" : "#2A2A2E", transition: "all 150ms" }}
      >
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
    </div>
  );
}

function ClaimScreen({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [uname, setUname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const claim = async () => {
    if (!uname) return;
    setLoading(true); setError("");
    try {
      const pw = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).toUpperCase();
      const r = await fetch("/api/claim-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: uname, domain: "alione.cc", password: pw }) });
      const d = await r.json();
      if (d.success) { setOk(true); onSuccess(d.email); } else setError(d.error || "Failed");
    } catch { setError("Connection error"); } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", background: "#1C1C1F", border: "1px solid #2A2A2E", borderRadius: 14, padding: "14px 18px", fontSize: 16, color: "#F0F0F2", outline: "none", transition: "border-color 200ms", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, border: "1px solid #2A2A2E", background: "#141416", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/alione.png" alt="" style={{ width: 28, height: 28 }} /></div>
          <div><div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 22, fontWeight: 700, color: "#F0F0F2", letterSpacing: "-0.02em" }}>AliMail</div><div style={{ fontSize: 13, color: "#636370", marginTop: 2 }}>Private email by AliOne</div></div>
        </div>
        <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 32, fontWeight: 700, color: "#F0F0F2", letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.1 }}>Claim your email</h1>
        <p style={{ fontSize: 16, color: "#9A9AA8", marginBottom: 40, lineHeight: 1.6 }}>Choose a username for your @alione.cc address.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#9A9AA8", marginBottom: 8 }}>Email address</label>
            <div style={{ display: "flex" }}>
              <input type="text" placeholder="username" value={uname} onChange={e => setUname(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                style={{ ...inputStyle, borderRight: "none", borderRadius: "14px 0 0 14px", fontFamily: "'JetBrains Mono', monospace" }} />
              <div style={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: "0 14px 14px 0", padding: "14px 18px", fontSize: 16, color: "#636370", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>@alione.cc</div>
            </div>
          </div>
          {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", fontSize: 14 }}><AlertCircle size={16} />{error}</div>}
          {ok && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399", fontSize: 14 }}><CheckCircle2 size={16} />{uname}@alione.cc is yours!</div>}
          <button onClick={claim} disabled={loading || ok || !uname}
            style={{ width: "100%", padding: "16px 24px", borderRadius: 14, border: "none", background: "#F0F0F2", color: "#0A0A0B", fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display), sans-serif", cursor: loading || ok ? "not-allowed" : "pointer", opacity: loading || ok || !uname ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : ok ? <><CheckCircle2 size={18} /> Claimed!</> : "Claim Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposeModal({ open, onClose, onSent, initialTo, initialSubject, myEmail }: { open: boolean; onClose: () => void; onSent: () => void; initialTo: string; initialSubject: string; myEmail: string }) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setTo(initialTo); setSubject(initialSubject); setBody(""); setError(""); setSent(false); }, [initialTo, initialSubject, open]);
  useEffect(() => { if (open) setTimeout(() => taRef.current?.focus(), 100); }, [open]);
  if (!open) return null;

  const send = async () => {
    if (!to || !body) return;
    setSending(true); setError("");
    try {
      const r = await fetch("/api/mail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, subject, text: body }) });
      const d = await r.json();
      if (d.success) { setSent(true); setTimeout(() => { onSent(); onClose(); }, 1200); } else setError(d.error || "Failed");
    } catch { setError("Connection error"); } finally { setSending(false); }
  };

  const row: React.CSSProperties = { display: "flex", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid #1C1C1F", gap: 10 };
  const label: React.CSSProperties = { fontSize: 14, color: "#636370", minWidth: 50, fontWeight: 500 };
  const field: React.CSSProperties = { flex: 1, background: "transparent", border: "none", fontSize: 15, color: "#F0F0F2", outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 640, background: "#111113", border: "1px solid #2A2A2E", borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #2A2A2E" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><PenBox size={18} style={{ color: "#9A9AA8" }} /><span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 17, fontWeight: 600, color: "#F0F0F2" }}>New message</span></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "#636370", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
        </div>
        <div style={row}><span style={label}>From</span><span style={{ ...field, fontFamily: "'JetBrains Mono', monospace", color: "#9A9AA8" }}>{myEmail}</span></div>
        <div style={row}><span style={label}>To</span><input type="email" placeholder="recipient@example.com" value={to} onChange={e => setTo(e.target.value)} style={{ ...field, fontFamily: "'JetBrains Mono', monospace" }} /></div>
        <div style={row}><span style={label}>Subject</span><input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} style={field} /></div>
        <div style={{ padding: "20px 28px" }}><textarea ref={taRef} placeholder="Write your message..." value={body} onChange={e => setBody(e.target.value)} rows={14} style={{ width: "100%", background: "transparent", border: "none", fontSize: 15, lineHeight: 1.8, color: "#F0F0F2", outline: "none", resize: "none", fontFamily: "inherit" }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderTop: "1px solid #2A2A2E" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #2A2A2E", background: "transparent", color: "#636370", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Paperclip size={16} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {error && <span style={{ fontSize: 13, color: "#F87171" }}>{error}</span>}
            {sent && <span style={{ fontSize: 13, color: "#34D399", display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} />Sent!</span>}
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "transparent", color: "#9A9AA8", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
            <button onClick={send} disabled={sending || sent || !to || !body} style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: "#F0F0F2", color: "#0A0A0B", fontSize: 14, fontWeight: 600, cursor: sending || sent || !to || !body ? "not-allowed" : "pointer", opacity: sending || sent || !to || !body ? 0.4 : 1, display: "flex", alignItems: "center", gap: 8 }}>
              {sending ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : <><Send size={15} /> Send</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user, myEmail, signOut }: { user: any; myEmail: string | null; signOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const name = user?.fullName || myEmail?.split("@")[0] || "User";
  const initial = name[0].toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))", border: "1px solid #2A2A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#9A9AA8", cursor: "pointer", fontFamily: "var(--font-display), sans-serif" }}>{initial}</button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 260, background: "#141416", border: "1px solid #2A2A2E", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 200 }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #2A2A2E" }}><div style={{ fontSize: 15, fontWeight: 500, color: "#F0F0F2", marginBottom: 4 }}>{name}</div><div style={{ fontSize: 13, color: "#636370", fontFamily: "'JetBrains Mono', monospace" }}>{myEmail || "No email"}</div></div>
          <div style={{ padding: 6 }}>
            <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#9A9AA8", textDecoration: "none" }}><Inbox size={16} />Dashboard</a>
            <button onClick={() => { signOut(); setOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, color: "#9A9AA8", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}><LogOut size={16} />Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MailDashboard() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [folder, setFolder] = useState<Folder>("inbox");
  const [selId, setSelId] = useState<number | null>(null);
  const [selIds, setSelIds] = useState<number[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rd, setRd] = useState<Rd | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);
  const [needClaim, setNeedClaim] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubj, setComposeSubj] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const metaEmail = useMemo(() => {
    if (!user) return undefined;
    return (user.publicMetadata as Record<string, unknown>)?.claimedEmail as string | undefined;
  }, [user]);
  const myEmail = claimedEmail || metaEmail || null;

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return emails;
    const q = searchQ.toLowerCase();
    return emails.filter(e => e.subject.toLowerCase().includes(q) || e.from.toLowerCase().includes(q) || e.fromName.toLowerCase().includes(q) || e.preview.toLowerCase().includes(q));
  }, [emails, searchQ]);

  const unreadCount = useMemo(() => emails.filter(e => e.unread).length, [emails]);

  const allSelected = filtered.length > 0 && selIds.length === filtered.length;
  const someSelected = selIds.length > 0;

  // ─── Data ───────────────────────────────────────────────────────

  const fetchEmails = useCallback(async () => {
    setLoading(true); setError(""); setSelId(null); setRd(null); setSelIds([]);
    const mb = MAILBOX_MAP[folder];
    if (!mb) { setLoading(false); setEmails([]); return; }
    try {
      const r = await fetch(`/api/mail/list?mailbox=${encodeURIComponent(mb)}`);
      const d = await r.json();
      if (d.emails) setEmails(d.emails.map((e: any) => ({ id: e.id, from: e.from, fromName: e.fromName || e.from, subject: e.subject, preview: e.preview || "", body: "", html: "", date: e.date, unread: !e.seen, seen: e.seen })));
      else if (d.error) setError(d.error);
    } catch { setError("Could not connect to mail server"); } finally { setLoading(false); }
  }, [folder]);

  useEffect(() => { if (myEmail && isLoaded) fetchEmails(); }, [myEmail, isLoaded, fetchEmails]);

  useEffect(() => {
    if (!selId || !isLoaded || !myEmail) return;
    let cancelled = false;
    setLoadingBody(true); setRd(null);
    const mb = MAILBOX_MAP[folder];
    fetch(`/api/mail/read?uid=${selId}&mailbox=${encodeURIComponent(mb || "INBOX")}`).then(r => r.json()).then(d => {
      if (cancelled) return;
      if (d.body || d.html) { setRd(d); setEmails(p => p.map(e => e.id === selId ? { ...e, body: d.body, html: d.html, unread: false } : e)); }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoadingBody(false); });
    return () => { cancelled = true; };
  }, [selId, isLoaded, myEmail, folder]);

  useEffect(() => { if (readerRef.current) readerRef.current.scrollTop = 0; }, [selId]);
  useEffect(() => { if (isLoaded && !metaEmail && !claimedEmail) setNeedClaim(true); else setNeedClaim(false); }, [isLoaded, metaEmail, claimedEmail]);

  // ─── Selection ──────────────────────────────────────────────────

  const toggleSelect = (id: number) => {
    setSelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelIds([]);
    else setSelIds(filtered.map(e => e.id));
  };

  const clearSelection = () => setSelIds([]);

  // ─── Delete / Trash ─────────────────────────────────────────────

  const moveToTrash = async (singleUid?: number) => {
    const ids = singleUid ? [singleUid] : selIds;
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const r = await fetch("/api/mail/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uids: ids, sourceFolder: MAILBOX_MAP[folder] }) });
      const d = await r.json();
      if (d.success) { setSelIds([]); setSelId(null); fetchEmails(); }
    } catch {} finally { setDeleting(false); }
  };

  const permanentlyDelete = async () => {
    if (selIds.length === 0) return;
    setDeleting(true);
    try {
      const r = await fetch("/api/mail/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uids: selIds, sourceFolder: "Trash", permanent: true }) });
      const d = await r.json();
      if (d.success) { setSelIds([]); setSelId(null); fetchEmails(); }
    } catch {} finally { setDeleting(false); }
  };

  const clearTrash = async () => {
    setDeleting(true);
    try {
      await fetch("/api/mail/clear-trash", { method: "POST" });
      setSelId(null); fetchEmails();
    } catch {} finally { setDeleting(false); }
  };

  // ─── Helpers ────────────────────────────────────────────────────

  const selectFolder = (f: Folder) => { setFolder(f); setSidebarOpen(false); setSelIds([]); };

  const reply = () => {
    if (!rd || !selId) return;
    const e = emails.find(x => x.id === selId); if (!e) return;
    setComposeTo(e.from);
    setComposeSubj(e.subject.startsWith("Re:") ? e.subject : "Re: " + e.subject);
    setComposeOpen(true);
  };

  // ─── Early returns ──────────────────────────────────────────────

  if (!isSignedIn) return null;
  if (!isLoaded) return <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={32} className="animate-spin" style={{ color: "rgba(255,255,255,0.15)" }} /></div>;
  if (needClaim) return <ClaimScreen onSuccess={(e) => { setClaimedEmail(e); setNeedClaim(false); }} />;

  const border = "#2A2A2E";
  const borderSubtle = "#1C1C1F";
  const inputBg = "#1C1C1F";

  return (
    <div style={{ height: "100vh", background: "#0A0A0B", color: "#F0F0F2", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* TOP BAR */}
      <header style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${border}`, background: "rgba(14,14,16,0.92)", backdropFilter: "blur(20px) saturate(180%)", flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mail-sidebar-toggle" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: "#9A9AA8", cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center" }}><Menu size={18} /></button>
          <a href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: "#141416", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/alione.png" alt="" style={{ width: 22, height: 22 }} /></div>
            <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 17, fontWeight: 700, color: "#636370", letterSpacing: "-0.01em" }}>AliMail</span>
          </a>
          <div style={{ width: 1, height: 24, background: border }} />
          <button onClick={() => { setComposeTo(""); setComposeSubj(""); setComposeOpen(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", borderRadius: 10, border: "none", background: "#F0F0F2", color: "#0A0A0B", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display), sans-serif", cursor: "pointer" }}>
            <PenBox size={16} /> Compose
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={fetchEmails} disabled={loading} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: "#636370", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: loading ? 0.4 : 1 }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div style={{ width: 1, height: 24, background: border }} />
          <UserMenu user={user} myEmail={myEmail} signOut={signOut} />
        </div>
      </header>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, borderRight: `1px solid ${border}`, background: "#0E0E10", display: "flex", flexDirection: "column", flexShrink: 0 }} className={`mail-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ padding: "20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: inputBg, border: `1px solid ${searchFocused ? "#3B82F6" : border}`, borderRadius: 12, transition: "border-color 200ms" }}>
              <Search size={16} style={{ color: "#636370", flexShrink: 0 }} />
              <input type="text" placeholder="Search emails..." value={searchQ} onChange={e => setSearchQ(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, color: "#F0F0F2", outline: "none" }} />
            </div>
          </div>
          <div style={{ padding: "0 8px", flex: 1 }}>
            {FOLDERS.map(f => {
              const Icon = f.icon;
              const active = folder === f.key;
              const count = f.key === "inbox" ? unreadCount : 0;
              return (
                <button key={f.key} onClick={() => selectFolder(f.key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: active ? "rgba(255,255,255,0.06)" : "transparent", color: active ? "#F0F0F2" : "#9A9AA8", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", textAlign: "left", marginBottom: 2, fontFamily: "inherit" }}>
                  <Icon size={18} style={{ color: active ? "#3B82F6" : "#636370" }} />
                  <span style={{ flex: 1 }}>{f.label}</span>
                  {count > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: 6 }}>{count}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "16px" }}>
            <div style={{ padding: "12px 14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 12, fontSize: 13, color: "#9A9AA8", lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, color: "#60A5FA", marginBottom: 4 }}>{myEmail}</div>
              <div style={{ fontSize: 12, color: "#636370" }}>AliOne Mail</div>
            </div>
          </div>
        </aside>

        {/* EMAIL LIST */}
        <div style={{ width: 400, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", flexShrink: 0, background: "#0D0D0F" }} className="mail-list-panel">
          {/* List header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${borderSubtle}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {filtered.length > 0 && <Checkbox checked={allSelected} onChange={toggleSelectAll} />}
              <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 15, fontWeight: 600, color: "#F0F0F2", textTransform: "capitalize" }}>{folder}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {folder === "trash" && emails.length > 0 && (
                <button onClick={clearTrash} disabled={deleting}
                  style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: "1px solid #F87171", background: "rgba(248,113,113,0.08)", color: "#F87171", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Trash2 size={12} /> Clear trash
                </button>
              )}
              {filtered.length > 0 && <span style={{ fontSize: 13, color: "#636370" }}>{filtered.length}</span>}
            </div>
          </div>

          {/* Multi-select action bar */}
          {someSelected && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: `1px solid ${border}`, background: "rgba(59,130,246,0.06)", flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: "#9A9AA8" }}>{selIds.length} selected</span>
              <div style={{ display: "flex", gap: 6 }}>
                {folder === "trash" ? (
                  <button onClick={permanentlyDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1px solid #F87171", background: "rgba(248,113,113,0.1)", color: "#F87171", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <Trash size={14} /> {deleting ? "Deleting..." : "Delete permanently"}
                  </button>
                ) : (
                  <button onClick={() => moveToTrash()} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1px solid #F87171", background: "rgba(248,113,113,0.1)", color: "#F87171", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <Trash2 size={14} /> {deleting ? "Moving..." : "Move to trash"}
                  </button>
                )}
                <button onClick={clearSelection} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#9A9AA8", fontSize: 12, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Email list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <><Skel /><Skel /><Skel /><Skel /><Skel /></>
            ) : error ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
                <AlertCircle size={32} style={{ color: "#F87171", opacity: 0.4, marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: "#F87171", opacity: 0.6, marginBottom: 8, textAlign: "center" }}>{error}</p>
                <button onClick={fetchEmails} style={{ fontSize: 13, color: "#3B82F6", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24 }}>
                <Mail size={40} style={{ color: "#2A2A2E", marginBottom: 16 }} />
                <p style={{ fontSize: 15, color: "#636370", fontWeight: 500 }}>No emails</p>
                <p style={{ fontSize: 13, color: "#3D3D42", marginTop: 4 }}>{searchQ ? "No matches found" : folder === "inbox" ? "Your inbox is empty" : folder === "trash" ? "Trash is empty" : "Nothing here yet"}</p>
                {!searchQ && folder === "inbox" && (
                  <button onClick={() => { setComposeTo(""); setComposeSubj(""); setComposeOpen(true); }}
                    style={{ marginTop: 20, padding: "10px 24px", borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: "#9A9AA8", fontSize: 13, cursor: "pointer" }}>Compose</button>
                )}
              </div>
            ) : (
              filtered.map(email => {
                const isSel = selId === email.id;
                const isChecked = selIds.includes(email.id);
                return (
                  <div key={email.id}
                    onClick={() => { setSelId(email.id); setSidebarOpen(false); }}
                    style={{ display: "flex", alignItems: "flex-start", padding: "14px 20px", borderBottom: `1px solid ${borderSubtle}`, background: isSel ? "rgba(59,130,246,0.06)" : "transparent", borderLeft: `3px solid ${isSel ? "#3B82F6" : "transparent"}`, cursor: "pointer", transition: "background 150ms" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
                      <Checkbox checked={isChecked} onChange={() => toggleSelect(email.id)} />
                      <Avatar email={email.from} name={dn(email)} size={40} addr={email.from} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: email.unread ? 700 : 500, color: email.unread ? "#F0F0F2" : "#9A9AA8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dn(email)}</span>
                        <span style={{ fontSize: 12, color: "#636370", flexShrink: 0, marginLeft: 12 }}>{rDate(email.date)}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: email.unread ? 600 : 400, color: email.unread ? "#D4D4D8" : "#636370", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{email.subject}</p>
                      {email.preview && <p style={{ fontSize: 13, color: "#3D3D42", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.preview}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* READER */}
        <div ref={readerRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", background: "#0A0A0B" }}>
          {loadingBody ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={28} className="animate-spin" style={{ color: "#636370" }} /></div>
          ) : rd && selId ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderBottom: `1px solid ${borderSubtle}`, flexShrink: 0 }}>
                <button onClick={reply} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.04)", color: "#9A9AA8", fontSize: 13, fontWeight: 500, cursor: "pointer" }}><Reply size={15} /> Reply</button>
                {folder !== "trash" && selId && (
                  <button onClick={() => { moveToTrash(selId); }} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.04)", color: "#9A9AA8", fontSize: 13, fontWeight: 500, cursor: "pointer" }}><Trash2 size={15} /> Trash</button>
                )}
              </div>
              <div style={{ padding: "32px 28px 24px", borderBottom: `1px solid ${borderSubtle}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                  <Avatar email={rd.from} size={52} addr={rd.fromAddr} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 24, fontWeight: 700, color: "#F0F0F2", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>{rd.subject || "(no subject)"}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 15, fontWeight: 600, color: "#D4D4D8" }}>{rd.from}</span><span style={{ fontSize: 13, color: "#3D3D42" }}>{fDate(rd.date)}</span></div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, padding: "28px", maxWidth: 800 }}>
                {rd.html ? (
                  <div style={{ fontSize: 15, lineHeight: 1.8, color: "#D4D4D8" }} dangerouslySetInnerHTML={{ __html: clean(rd.html) }} />
                ) : rd.body ? (
                  <div style={{ fontSize: 15, lineHeight: 1.8, color: "#D4D4D8", whiteSpace: "pre-wrap" }}>{rd.body}</div>
                ) : <p style={{ color: "#3D3D42", fontStyle: "italic" }}>Empty message</p>}
              </div>
            </>
          ) : selId === null && filtered.length > 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Inbox size={48} style={{ color: "#1C1C1F", marginBottom: 16 }} />
              <p style={{ fontSize: 16, color: "#3D3D42" }}>Select a message to read</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Mail size={48} style={{ color: "#141416", marginBottom: 16 }} />
              <p style={{ fontSize: 16, color: "#3D3D42" }}>No message selected</p>
            </div>
          )}
        </div>
      </div>

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} onSent={() => { if (folder === "sent") fetchEmails(); }} initialTo={composeTo} initialSubject={composeSubj} myEmail={myEmail || ""} />
    </div>
  );
}
