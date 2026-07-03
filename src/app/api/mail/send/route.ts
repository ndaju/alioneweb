import { auth, clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, text } = await req.json();
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

  try {
    const transporter = nodemailer.createTransport({
      host: "mailserver",
      port: 587,
      secure: false,
      auth: { user: email, pass: password },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: email,
      to,
      subject,
      text,
    });

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
