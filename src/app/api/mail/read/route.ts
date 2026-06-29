import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const uid = parseInt(searchParams.get("uid") || "");

  if (!uid) {
    return Response.json({ error: "Missing uid" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as Record<string, unknown>;
  const email = meta.claimedEmail as string;
  const password = meta.claimedPassword as string;

  if (!email || !password) {
    return Response.json({ error: "No email claimed" }, { status: 400 });
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
    const msg = await imap.fetchOne(uid, { source: true });
    lock.release();
    await imap.logout();

    if (!msg?.source) {
      return Response.json({ error: "Email not found" }, { status: 404 });
    }

    const parsed = await simpleParser(msg.source);

    return Response.json({
      from: parsed.from?.text || "",
      subject: parsed.subject || "",
      date: parsed.date?.toISOString() || "",
      body: parsed.text || parsed.html || "",
      html: parsed.html || "",
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to fetch email" },
      { status: 500 }
    );
  }
}
