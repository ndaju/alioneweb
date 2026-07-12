import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

    const status = await imap.status("Trash", { messages: true });
    const total = status.messages || 0;

    if (total > 0) {
      const lock = await imap.getMailboxLock("Trash");
      try {
        // Collect all UIDs first
        const uids: number[] = [];
        for await (const msg of imap.fetch("1:*", { uid: true })) {
          uids.push(msg.uid);
        }
        // Mark all as deleted and expunge
        if (uids.length > 0) {
          await imap.messageFlagsAdd(uids, ["\\Deleted"]);
          await imap.mailboxClose();
        }
      } finally {
        lock.release();
      }
    }

    await imap.logout();

    return Response.json({ success: true, cleared: total });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to clear trash" }, { status: 500 });
  }
}
