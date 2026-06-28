"use client";

import { useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
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

const MOCK_EMAILS: Email[] = [
  { id: 1, from: "AliOne Team", subject: "Welcome to AliOne Mail!", preview: "We're excited to have you onboard. Your privacy-first email experience starts now.", body: "We're excited to have you onboard. Your privacy-first email experience starts now.\n\nAliOne Mail is built with end-to-end encryption, no tracking, no ads.\n\nGet started:\n- Download AliBrowser\n- Configure your mail clients\n- Explore the dashboard\n\n– The AliOne Team", date: "2m ago", starred: false, unread: true, hasAttachments: false },
  { id: 2, from: "AliBrowser Updates", subject: "New vertical tabs in v2.1", preview: "Check out the latest improvements to vertical tabs and workspace management.", body: "Check out the latest improvements to vertical tabs and workspace management.\n\nWhat's new:\n- Improved tab groups\n- Workspace sync\n- Performance updates\n\nUpdate now!", date: "1h ago", starred: true, unread: true, hasAttachments: false },
  { id: 3, from: "Privacy Digest", subject: "Weekly privacy newsletter", preview: "This week: new encryption standards, tracker blocking updates, and more.", body: "This week in privacy:\n\n1. New E2E encryption standards proposed\n2. Tracker blocking gets smarter\n3. Privacy-first browsers gain market share\n\nStay safe out there.", date: "3h ago", starred: false, unread: false, hasAttachments: true },
  { id: 4, from: "Cloudflare", subject: "Your DNS changes are live", preview: "The DNS changes for alione.cc have been propagated successfully.", body: "The DNS changes for alione.cc have been propagated successfully.\n\nAll records are now active across all Cloudflare edge locations.", date: "1d ago", starred: false, unread: false, hasAttachments: false },
  { id: 5, from: "GitHub", subject: "[ndaju/alioneweb] Push event to master", preview: "A new commit was pushed to master by ndaju.", body: "Repository: ndaju/alioneweb\nBranch: master\n\nLatest commit: Update dashboard with email management\n\nView on GitHub: https://github.com/ndaju/alioneweb", date: "2d ago", starred: true, unread: false, hasAttachments: false },
];

type NavItem = "inbox" | "sent" | "drafts" | "settings";

const NAV_ITEMS: { key: NavItem; label: string; icon: any; count?: number }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox, count: 2 },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText, count: 1 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  const { isSignedIn, userId } = useAuth();
  const [activeNav, setActiveNav] = useState<NavItem>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [claimedEmail, setClaimedEmail] = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(!claimedEmail);

  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("alione.cc");
  const [password, setPassword] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  if (!isSignedIn) return null;

  const emails = MOCK_EMAILS;
  const selected = emails.find((e) => e.id === selectedEmail);

  const handleClaim = async () => {
    if (!username || !password) return;
    setClaiming(true);
    setClaimError("");
    try {
      const res = await fetch("/api/claim-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, domain, password }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimedEmail(data.email);
        setShowClaimForm(false);
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
                {claimedEmail || "AliOne Mail"}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
              </div>

              {claimError && (
                <p className="text-red-400 text-sm">{claimError}</p>
              )}

              <button
                onClick={handleClaim}
                disabled={claiming || !username || !password}
                className="w-full bg-white text-black font-medium rounded-xl py-3 hover:bg-white/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {claiming ? "Creating..." : "Claim Email"}
              </button>

              {claimedEmail && (
                <p className="text-green-400 text-sm text-center">
                  ✓ {claimedEmail} is yours!
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
                  {item.count && (
                    <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          {!sidebarCollapsed && (
            <div className="text-xs text-white/30 mb-2 truncate">
              {claimedEmail}
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
          <button
            onClick={() => setShowClaimForm(true)}
            className="ml-auto text-xs text-white/30 hover:text-white/60 underline underline-offset-2 transition"
          >
            Change email
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Email List */}
          <div className="w-[380px] border-r border-white/[0.06] flex flex-col flex-shrink-0 overflow-y-auto">
            {emails.map((email) => (
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
            ))}
          </div>

          {/* Email Reader */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {selected ? (
              <div className="p-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-semibold">
                    {selected.from[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-outfit font-semibold text-lg text-white">
                      {selected.subject}
                    </h2>
                    <p className="text-sm text-white/40">{selected.from} — {selected.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition">
                      <Star
                        size={16}
                        className={selected.starred ? "fill-yellow-400 text-yellow-400" : ""}
                      />
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
