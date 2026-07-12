import { auth, clerkClient } from "@clerk/nextjs/server";
import { ImapFlow } from "imapflow";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { uids, sourceFolder, permanent } = await req.json();
  if (!uids || !Array.isArray(uids) || uids.length === 0) {
    return Response.json({ error: "Missing uids" }, { status: 400 });
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

    const lock = await imap.getMailboxLock(sourceFolder);

    try {
      if (!permanent) {
        // Move to trash: copy then delete from source
        await imap.messageCopy(uids, "Trash");
      }
      // messageDelete marks \Deleted and expunges
      await imap.messageDelete(uids);
    } catch (err) {
      // ignore
    } finally {
      lock.release();
    }

    await imap.logout();

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
