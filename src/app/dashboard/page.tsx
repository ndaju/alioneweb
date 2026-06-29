"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import {
  Inbox,
  Send,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Paperclip,
  Trash2,
  Reply,
  Sparkles,
  Loader2,
  CheckCircle2,
  Mail,
  ExternalLink,
} from "lucide-react";

type Email = {
  id: number;
  from: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  starred: boolean;
  unread: boolean;
  hasAttachments: boolean;
};

type NavItem = "inbox" | "sent" | "drafts" | "settings";

const NAV_ITEMS: { key: NavItem; label: string; icon: any; count?: number }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
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
  const [loadingBody, setLoadingBody] = useState(false);

  const metadataEmail = user?.publicMetadata?.claimedEmail as string | undefined;
  const resolvedEmail = claimedEmail || metadataEmail || null;
  const showClaimForm = (!resolvedEmail || forceClaimForm) && !claimSuccess;

  const fetchEmails = useCallback(async () => {
    setLoadingEmails(true);
    setEmailError("");
    try {
      const res = await fetch("/api/mail/list");
      const data = await res.json();
      if (data.emails) {
        setEmails(
          data.emails.map((e: any) => ({
            id: e.id,
            from: e.from,
            subject: e.subject,
            preview: e.subject,
            body: "",
            date: formatRelativeTime(e.date),
            starred: false,
            unread: !e.seen,
            hasAttachments: false,
          }))
        );
      } else if (data.error) {
        setEmailError(data.error);
      }
    } catch {
      setEmailError("Connection error");
    } finally {
      setLoadingEmails(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedEmail && userLoaded) {
      fetchEmails();
    }
  }, [resolvedEmail, userLoaded, fetchEmails]);

  useEffect(() => {
    if (!selectedEmail || !userLoaded || !resolvedEmail) return;
    setLoadingBody(true);
    fetch(`/api/mail/read?uid=${selectedEmail}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.body) {
          setEmails((prev) =>
            prev.map((e) =>
              e.id === selectedEmail ? { ...e, body: data.body, preview: data.subject } : e
            )
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBody(false));
  }, [selectedEmail, userLoaded, resolvedEmail]);

  if (!isSignedIn) return null;
  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/40" />
      </div>
    );
  }

  const selected = emails.find((e) => e.id === selectedEmail);

  const handleClaim = async () => {
    if (!username || !password1) return;
    setClaiming(true);
    setClaimError("");
    setClaimSuccess(false);
    try {
      const res = await fetch("/api/claim-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, domain, password: password1 }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimedEmail(data.email);
        setClaimSuccess(true);
        setForceClaimForm(false);
      } else {
        setClaimError(data.error || "Failed to claim email");
      }
    } catch {
      setClaimError("Connection error");
    } finally {
      setClaiming(false);
    }
  };

  if (showClaimForm) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <a href="https://alione.cc">
                <img src="/alione.png" alt="AliOne" className="w-8 h-8 rounded-lg" />
              </a>
              <span className="text-xl font-outfit font-semibold text-white">
                {resolvedEmail || "AliOne Mail"}
              </span>
            </div>

            <h1 className="text-3xl font-outfit font-bold mb-2">Claim Your Email</h1>
            <p className="text-white/50 mb-8">
              Choose your @alione.cc email address to get started.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/40 mb-2">Email Address</label>
                <div className="flex items-center gap-0">
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-l-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono text-sm"
                  />
                  <span className="bg-white/5 border border-l-0 border-white/10 px-4 py-3 text-white/40 font-mono text-sm">
                    @
                  </span>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-white/5 border border-l-0 border-white/10 rounded-r-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 font-mono text-sm cursor-pointer"
                  >
                    <option value="alione.cc" className="bg-[#0a0a0a]">alione.cc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/40 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Choose a strong password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
              </div>

              {claimError && (
                <p className="text-red-400 text-sm">{claimError}</p>
              )}

              <button
                onClick={handleClaim}
                disabled={claiming || claimSuccess || !username || !password1}
                className={`w-full font-medium rounded-xl py-3 transition flex items-center justify-center gap-2 ${
                  claimSuccess
                    ? "bg-green-500 text-white"
                    : "bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                {claiming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : claimSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Claimed!
                  </>
                ) : (
                  "Claim Email"
                )}
              </button>

              {claimSuccess && (
                <p className="text-green-400 text-sm text-center animate-pulse">
                  ✓ {resolvedEmail} is yours!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-60"
        } bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col transition-all duration-200 flex-shrink-0`}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
          <a href="https://alione.cc">
            <img src="/alione.png" alt="AliOne" className="w-7 h-7 rounded-lg flex-shrink-0" />
          </a>
          {!sidebarCollapsed && (
            <span className="font-outfit font-semibold text-sm text-white">AliOne Mail</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto text-white/30 hover:text-white/60 transition"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                activeNav === item.key
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          {!sidebarCollapsed && (
            <div className="text-xs text-white/30 mb-2 truncate">
              {resolvedEmail}
            </div>
          )}
          <div className={sidebarCollapsed ? "flex justify-center" : ""}>
            <UserButton
              appearance={{
                variables: { colorBackground: "#0a0a0a" } as any,
                elements: { avatarBox: "w-7 h-7 rounded-full" },
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/[0.06] flex items-center px-6 gap-4 flex-shrink-0">
          <span className="text-sm font-medium text-white/60 capitalize">{activeNav}</span>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="https://alimail.alione.cc"
              target="_blank"
              className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 transition"
            >
              <ExternalLink size={12} />
              Full webmail
            </a>
            <button
              onClick={() => setForceClaimForm(true)}
              className="text-xs text-white/30 hover:text-white/60 underline underline-offset-2 transition"
            >
              Change email
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Email List */}
          <div className="w-[380px] border-r border-white/[0.06] flex flex-col flex-shrink-0 overflow-y-auto">
            {loadingEmails ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-white/30" />
              </div>
            ) : emailError ? (
              <div className="flex-1 flex items-center justify-center text-white/20 px-6">
                <div className="text-center">
                  <p className="text-sm text-red-400/60">{emailError}</p>
                  <button
                    onClick={fetchEmails}
                    className="text-xs text-white/30 hover:text-white/60 mt-3 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-white/20">
                <div className="text-center px-6">
                  <Mail size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No emails yet</p>
                  <p className="text-xs text-white/20 mt-1">Your inbox is empty</p>
                </div>
              </div>
            ) : (
              emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email.id)}
                  className={`text-left px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition group ${
                    selectedEmail === email.id ? "bg-white/[0.03]" : ""
                  } ${email.unread ? "bg-white/[0.01]" : ""}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-sm ${
                        email.unread ? "font-semibold text-white" : "text-white/70"
                      }`}
                    >
                      {email.from}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {email.hasAttachments && (
                        <Paperclip size={12} className="text-white/20" />
                      )}
                      <span className="text-[11px] text-white/30">{email.date}</span>
                    </div>
                  </div>
                  <p
                    className={`text-sm truncate mb-0.5 ${
                      email.unread ? "font-medium text-white/80" : "text-white/50"
                    }`}
                  >
                    {email.subject}
                  </p>
                  <p className="text-xs text-white/30 truncate">{email.preview}</p>
                </button>
              ))
            )}
          </div>

          {/* Email Reader */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {selected && loadingBody ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-white/30" />
              </div>
            ) : selected && selected.body ? (
              <div className="p-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-semibold">
                    {selected.from[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-outfit font-semibold text-lg text-white">
                      {selected.subject}
                    </h2>
                    <p className="text-sm text-white/40">{selected.from} — {selected.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition">
                      <Star size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition">
                      <Reply size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-white/70 whitespace-pre-line text-sm leading-relaxed">
                  {selected.body}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/20">
                <div className="text-center">
                  <Sparkles size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Select an email to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
