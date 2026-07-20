import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as Record<string, unknown>;
  const email = meta.claimedEmail as string;
  const password = meta.claimedPassword as string;
  const quota = (meta.storageQuota as number) || 5 * 1024 * 1024 * 1024;
  const isOwner = email === "alione@alione.cc" || email === "ali@alione.cc";

  if (!email || !password) {
    return Response.json({ error: "No email claimed" }, { status: 400 });
  }

  const imap = new ImapFlow({
    host: "mailserver",
    port: 143,
    secure: false,
    auth: { user: email, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  let totalBytes = 0;
  let messageCount = 0;

  try {
    await imap.connect();
    const mailboxes = ["INBOX", "Sent", "Drafts", "Trash"];

    for (const mb of mailboxes) {
      try {
        const lock = await imap.getMailboxLock(mb);
        try {
          const status = await imap.status(mb, { messages: true });
          const total = status.messages || 0;
          messageCount += total;
          if (total > 0) {
            let sum = 0;
            for await (const msg of imap.fetch(`${total}:1`, { uid: true, size: true }, { uid: true })) {
              sum += msg.size || 0;
            }
            totalBytes += sum;
          }
        } finally {
          lock.release();
        }
      } catch {
        // mailbox might not exist, skip
      }
    }

    await imap.logout();
  } catch {
    // fallback: try to disconnect
    try { await imap.logout(); } catch {}
  }

  return Response.json({
    used: totalBytes,
    quota,
    messageCount,
    usedFormatted: formatBytes(totalBytes),
    quotaFormatted: formatBytes(quota),
    percentage: Math.min(100, Math.round((totalBytes / quota) * 100)),
    isOwner,
    email,
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
