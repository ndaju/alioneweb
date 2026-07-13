import { auth, clerkClient } from "@clerk/nextjs/server";
import { exec } from "child_process";
import { promisify } from "util";
import nodemailer from "nodemailer";

const execAsync = promisify(exec);

const WELCOME_SUBJECT = "Welcome to AliOne!";
const WELCOME_TEXT = `Hello!

Welcome to AliOne — your all-in-one digital ecosystem.

You now have access to:
• AliMail — your personal email at alimail.alione.cc
• AliSearch — coming soon at alisearch.alione.cc
• More products in the pipeline

We're thrilled to have you on board. If you have any questions, just reply to this email.

Best,
The AliOne Team
admin@alione.cc`;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ali@alione.cc";
const ADMIN_PASS = process.env.ADMIN_PASS || "";

async function sendWelcomeEmail(to: string) {
  if (!ADMIN_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      host: "mailserver",
      port: 587,
      secure: false,
      auth: { user: ADMIN_EMAIL, pass: ADMIN_PASS },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `AliOne <${ADMIN_EMAIL}>`,
      to,
      subject: WELCOME_SUBJECT,
      text: WELCOME_TEXT,
    });
  } catch {
    // Welcome email is optional
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { username, domain, password } = await req.json();
  if (!username || !domain || !password) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const email = `${username}@${domain}`;

  try {
    const { stdout, stderr } = await execAsync(
      `docker exec mailserver setup email add ${email} ${password}`
    );

    if (stdout?.includes("already exists")) {
      return Response.json({ error: "Email already claimed" }, { status: 409 });
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { claimedEmail: email, claimedPassword: password },
    });

    // Send welcome email in background (don't block response)
    sendWelcomeEmail(email);

    return Response.json({ success: true, email });
  } catch (err: any) {
    if (err?.stderr?.includes("already exists")) {
      return Response.json({ error: "Email already claimed" }, { status: 409 });
    }
    return Response.json(
      { error: err.message || "Failed to create email" },
      { status: 500 }
    );
  }
}
