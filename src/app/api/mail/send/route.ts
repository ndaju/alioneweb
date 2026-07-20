import { auth, clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, text, attachments } = await req.json();
  if (!to || !subject || !text) {
    return Response.json({ error: "Missing to, subject, or text" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = user.publicMetadata as Record<string, unknown>;
  const email = meta.claimedEmail as string;
  const password = meta.claimedPassword as string;

  if (!email || !password) {
    return Response.json({ error: "No email claimed" }, { status: 400 });
  }

  const isOwner = email === "alione@alione.cc" || email === "ali@alione.cc";
  const quota = (meta.storageQuota as number) || 5 * 1024 * 1024 * 1024;

  if (!isOwner) {
    try {
      const imap = new ImapFlow({
        host: "mailserver", port: 143, secure: false,
        auth: { user: email, pass: password }, logger: false,
        tls: { rejectUnauthorized: false },
      });
      await imap.connect();
      let totalUsed = 0;
      for (const mb of ["INBOX", "Sent", "Drafts", "Trash"]) {
        try {
          const lock = await imap.getMailboxLock(mb);
          try {
            const s = await imap.status(mb, { messages: true });
            if (s.messages && s.messages > 0) {
              for await (const msg of imap.fetch(`${s.messages}:1`, { uid: true, size: true }, { uid: true })) {
                totalUsed += msg.size || 0;
              }
            }
          } finally { lock.release(); }
        } catch {}
      }
      await imap.logout();
      if (totalUsed >= quota) {
        return Response.json({ error: "Storage full. Delete emails to free space.", overQuota: true }, { status: 507 });
      }
    } catch {}
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "mailserver",
      port: 587,
      secure: false,
      auth: { user: email, pass: password },
      tls: { rejectUnauthorized: false },
    });

    const mailOpts: nodemailer.SendMailOptions = { from: email, to, subject, text };

    if (Array.isArray(attachments) && attachments.length > 0) {
      mailOpts.attachments = attachments.map((a: { filename: string; content: string; contentType: string }) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
        contentType: a.contentType,
      }));
    }

    const info = await transporter.sendMail(mailOpts);

    // Save a copy to the Sent folder via IMAP
    if (info.messageId) {
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

        const date = new Date().toUTCString();
        const raw = `Date: ${date}\r\nFrom: ${email}\r\nTo: ${to}\r\nSubject: ${subject}\r\nMessage-ID: ${info.messageId}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 7bit\r\n\r\n${text}`;

        await imap.append("Sent", raw, ["\\Seen"]);
        await imap.logout();
      } catch (imapErr) {
        // Sent copy is optional, don't fail the send
      }
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
