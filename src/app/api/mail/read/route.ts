import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow, type FetchMessageObject } from "imapflow";
import { simpleParser } from "mailparser";
import { createHash } from "crypto";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const uid = parseInt(searchParams.get("uid") || "");
  const mailbox = searchParams.get("mailbox") || "INBOX";

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
      tls: { rejectUnauthorized: false },
    });

    await imap.connect();
    const lock = await imap.getMailboxLock(mailbox);
    let msg: FetchMessageObject | null = null;
    try {
      const result = await imap.fetchOne(uid, { source: true }, { uid: true });
      if (result) msg = result;
    } catch {
      // UID not found
    }
    lock.release();
    await imap.logout();

    if (!msg || !msg.source) {
      return Response.json({ error: "Email not found" }, { status: 404 });
    }

    const source = msg.source;

    const parsed = await simpleParser(source);

    const cidMap: Record<string, string> = {};
    if (parsed.attachments?.length) {
      for (const att of parsed.attachments) {
        if (att.contentId && att.content?.length < 524288) {
          cidMap[att.contentId] = `data:${att.contentType};base64,${att.content.toString("base64")}`;
        }
      }
    }

    let html = parsed.html || "";
    if (Object.keys(cidMap).length) {
      html = html.replace(/cid:([^"'\s>]+)/gi, (_, cid) => cidMap[cid] || `cid:${cid}`);
    }

    const fromAddr = parsed.from?.value?.[0]?.address || "";
    const fromHash = createHash("md5").update(fromAddr.trim().toLowerCase()).digest("hex");

    return Response.json({
      from: parsed.from?.text || "",
      fromAddr,
      fromHash,
      subject: parsed.subject || "",
      date: parsed.date?.toISOString() || "",
      body: parsed.text || html,
      html,
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to fetch email" },
      { status: 500 }
    );
  }
}
