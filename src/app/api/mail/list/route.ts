import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { createHash } from "crypto";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mailbox = searchParams.get("mailbox") || "INBOX";

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as Record<string, unknown>;
  const email = meta.claimedEmail as string;
  const password = meta.claimedPassword as string;

  if (!email || !password) {
    return Response.json({ emails: [] });
  }

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
    const status = await imap.status(mailbox, { messages: true });
    const total = status.messages || 0;

    const messages: any[] = [];
    if (total > 0) {
      const lock = await imap.getMailboxLock(mailbox);
      const fetchOpts = { envelope: true, uid: true, flags: true, source: true };
      for await (const msg of imap.fetch(`1:${total}`, fetchOpts)) {
        if (!msg.envelope) continue;
        let preview = "";
        try {
          const parsed = await simpleParser(msg.source!);
          preview = (parsed.text || parsed.html || "").slice(0, 120);
        } catch {}
        const fromAddr = msg.envelope.from?.[0]?.address || "unknown";
        messages.push({
          id: msg.uid,
          from: fromAddr,
          fromName: msg.envelope.from?.[0]?.name || "",
          fromHash: createHash("md5").update(fromAddr.trim().toLowerCase()).digest("hex"),
          subject: msg.envelope.subject || "(no subject)",
          date: msg.envelope.date?.toISOString() || "",
          seen: msg.flags ? msg.flags.has("\\Seen") : true,
          preview,
        });
      }
      lock.release();
    }

    await imap.logout();

    const emailToPhoto: Record<string, string> = {};
    try {
      const users = await client.users.getUserList({ limit: 100 });
      for (const u of users.data) {
        const um = u.publicMetadata as Record<string, unknown>;
        if (um.claimedEmail && u.imageUrl) {
          emailToPhoto[um.claimedEmail as string] = u.imageUrl;
        }
      }
    } catch {}

    return Response.json({ emails: messages.reverse().slice(0, 50).map(m => ({ ...m, photoUrl: emailToPhoto[m.from] || "" })) });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
