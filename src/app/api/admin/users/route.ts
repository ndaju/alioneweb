import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";

const OWNER_EMAILS = ["alione@alione.cc", "ali@alione.cc"];
const DEFAULT_QUOTA = 5 * 1024 * 1024 * 1024;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  const callerMeta = caller.publicMetadata as Record<string, unknown>;
  const callerEmail = callerMeta.claimedEmail as string;

  if (!OWNER_EMAILS.includes(callerEmail)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const resp = await client.users.getUserList({ limit: 100 });
  const allUsers = resp.data;
  const results = [];

  for (const u of allUsers) {
    const meta = u.publicMetadata as Record<string, unknown>;
    const email = meta.claimedEmail as string;
    const password = meta.claimedPassword as string;
    const quota = (meta.storageQuota as number) || DEFAULT_QUOTA;
    const isOwner = OWNER_EMAILS.includes(email);

    if (!email) continue;

    let usedBytes = 0;
    let messageCount = 0;

    if (password) {
      try {
        const imap = new ImapFlow({
          host: "mailserver",
          port: 143,
          secure: false,
          auth: { user: email, pass: password },
          logger: false,
          tls: { rejectUnauthorized: false },
        });

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
                usedBytes += sum;
              }
            } finally {
              lock.release();
            }
          } catch {}
        }

        await imap.logout();
      } catch {}
    }

    results.push({
      id: u.id,
      email,
      name: u.fullName || email.split("@")[0],
      photoUrl: u.imageUrl,
      usedBytes,
      quota,
      messageCount,
      isOwner,
      isOwnerAccount: OWNER_EMAILS.includes(email),
      percentage: Math.min(100, Math.round((usedBytes / quota) * 100)),
    });
  }

  return Response.json({ users: results });
}
