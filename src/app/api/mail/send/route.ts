import { auth, clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

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

    await transporter.sendMail({
      from: email,
      to,
      subject,
      text,
    });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
