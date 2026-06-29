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
    });

    await imap.connect();
    const lock = await imap.getMailboxLock("INBOX");

    const messages: any[] = [];
    for await (const msg of imap.fetch("1:*", { envelope: true, uid: true, flags: true })) {
      if (!msg.envelope) continue;
      messages.push({
        id: msg.uid,
        from: msg.envelope.from?.[0]?.address || "unknown",
        subject: msg.envelope.subject || "(no subject)",
        date: msg.envelope.date?.toISOString() || "",
        seen: msg.flags ? msg.flags.has("\\Seen") : true,
      });
    }

    lock.release();
    await imap.logout();

    return Response.json({ emails: messages.reverse().slice(0, 50) });
  } catch {
    return Response.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
