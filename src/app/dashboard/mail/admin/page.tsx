"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { Loader2, Shield, ArrowLeft, Users, HardDrive, Save } from "lucide-react";

const OWNER_EMAILS = ["alione@alione.cc", "ali@alione.cc"];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  usedBytes: number;
  quota: number;
  messageCount: number;
  isOwner: boolean;
  isOwnerAccount: boolean;
  percentage: number;
};

export default function AdminPage() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const metaEmail = user?.publicMetadata?.claimedEmail as string | undefined;
  const isOwner = OWNER_EMAILS.includes(metaEmail || "");

  useEffect(() => {
    if (!isLoaded || !isOwner) return;
    fetchUsers();
  }, [isLoaded, isOwner]);

  const fetchUsers = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/users");
      const d = await r.json();
      if (d.users) setUsers(d.users);
      else if (d.error) setError(d.error);
    } catch { setError("Failed to load users"); } finally { setLoading(false); }
  };

  const saveQuota = async (targetUserId: string) => {
    const gb = parseFloat(editValue);
    if (isNaN(gb) || gb <= 0) return;
    setSaving(true);
    try {
      await fetch("/api/admin/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, quotaBytes: gb * 1024 * 1024 * 1024 }),
      });
      setEditingId(null);
      fetchUsers();
    } catch {} finally { setSaving(false); }
  };

  if (!isSignedIn) return null;
  if (!isLoaded) return <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={32} className="animate-spin" style={{ color: "rgba(255,255,255,0.15)" }} /></div>;
  if (!isOwner) return <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}><Shield size={48} style={{ color: "#F87171", opacity: 0.4 }} /><p style={{ color: "#9A9AA8", fontSize: 16 }}>Access Denied</p><p style={{ color: "#636370", fontSize: 14 }}>Owner access required</p></div>;

  const border = "#2A2A2E";

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", color: "#F0F0F2", fontFamily: "var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <header style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${border}`, background: "rgba(14,14,16,0.92)", backdropFilter: "blur(20px) saturate(180%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/dashboard/mail" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: "#9A9AA8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}><ArrowLeft size={18} /></a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/alionemail.png" alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 17, fontWeight: 700, color: "#F0F0F2" }}>Admin Panel</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#FBBF24", fontWeight: 600, padding: "4px 12px", borderRadius: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>Owner</span>
          <button onClick={() => signOut()} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: "#636370", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>Sign Out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Users size={24} style={{ color: "#3B82F6" }} />
          <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 24, fontWeight: 700 }}>User Management</h1>
          <span style={{ fontSize: 13, color: "#636370", marginLeft: 8 }}>{users.length} users</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Loader2 size={28} className="animate-spin" style={{ color: "#636370" }} /></div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, color: "#F87171" }}>{error}</div>
        ) : (
          <div style={{ background: "#111113", border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color: "#636370", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span>User</span>
              <span style={{ textAlign: "right" }}>Used</span>
              <span style={{ textAlign: "right" }}>Quota</span>
              <span style={{ textAlign: "right" }}>Messages</span>
              <span style={{ textAlign: "right" }}>Usage</span>
              <span style={{ textAlign: "center" }}>Action</span>
            </div>
            {users.map(u => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", gap: 12, padding: "14px 20px", borderBottom: `1px solid #1C1C1F`, alignItems: "center", background: u.isOwner ? "rgba(251,191,36,0.02)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))", border: "1px solid #2A2A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#9A9AA8", overflow: "hidden", flexShrink: 0 }}>
                    {u.photoUrl ? <img src={u.photoUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover" }} /> : (u.name || u.email)[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#F0F0F2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#636370", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#9A9AA8", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{formatBytes(u.usedBytes)}</span>
                <span style={{ fontSize: 13, color: u.isOwner ? "#34D399" : "#9A9AA8", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>{u.isOwner ? "∞" : formatBytes(u.quota)}</span>
                <span style={{ fontSize: 13, color: "#636370", textAlign: "right" }}>{u.messageCount}</span>
                <div style={{ textAlign: "right" }}>
                  {u.isOwner ? (
                    <span style={{ fontSize: 12, color: "#34D399" }}>Unlimited</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <div style={{ width: 60, height: 4, borderRadius: 2, background: "#1C1C1F", overflow: "hidden" }}>
                        <div style={{ width: `${u.percentage}%`, height: "100%", borderRadius: 2, background: u.percentage >= 80 ? "#F87171" : u.percentage >= 60 ? "#FBBF24" : "#3B82F6" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#636370", width: 32, textAlign: "right" }}>{u.percentage}%</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  {u.isOwner ? null : editingId === u.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: 56, padding: "4px 8px", borderRadius: 6, border: "1px solid #3B82F6", background: "#1C1C1F", color: "#F0F0F2", fontSize: 12, outline: "none", fontFamily: "'JetBrains Mono', monospace" }} onKeyDown={e => { if (e.key === "Enter") saveQuota(u.id); if (e.key === "Escape") setEditingId(null); }} autoFocus />
                      <span style={{ fontSize: 11, color: "#636370" }}>GB</span>
                      <button onClick={() => saveQuota(u.id)} disabled={saving} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#3B82F6", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Save size={12} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(u.id); setEditValue((u.quota / (1024 ** 3)).toString()); }} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${border}`, background: "transparent", color: "#9A9AA8", fontSize: 12, cursor: "pointer" }}>Edit</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
