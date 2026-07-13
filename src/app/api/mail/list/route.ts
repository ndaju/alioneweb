import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

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

  console.log("MAIL_LIST", email, mailbox);
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
        messages.push({
          id: msg.uid,
          from: msg.envelope.from?.[0]?.address || "unknown",
          fromName: msg.envelope.from?.[0]?.name || "",
          subject: msg.envelope.subject || "(no subject)",
          date: msg.envelope.date?.toISOString() || "",
          seen: msg.flags ? msg.flags.has("\\Seen") : true,
          preview,
        });
      }
      lock.release();
    }

    await imap.logout();

    return Response.json({ emails: messages.reverse().slice(0, 50) });
  } catch (err: any) {
    console.error("MAIL_LIST_ERROR", email, err.message, JSON.stringify(err.response));
    return Response.json(
      { error: err.message || "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
