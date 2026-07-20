import { auth, clerkClient } from "@clerk/nextjs/server";

const OWNER_EMAILS = ["alione@alione.cc", "ali@alione.cc"];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  const callerMeta = caller.publicMetadata as Record<string, unknown>;
  const callerEmail = callerMeta.claimedEmail as string;

  if (!OWNER_EMAILS.includes(callerEmail)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, quotaBytes } = await req.json();
  if (!targetUserId || typeof quotaBytes !== "number" || quotaBytes < 0) {
    return Response.json({ error: "Invalid params" }, { status: 400 });
  }

  const target = await client.users.getUser(targetUserId);
  const targetMeta = target.publicMetadata as Record<string, unknown>;

  await client.users.updateUser(targetUserId, {
    publicMetadata: {
      ...targetMeta,
      storageQuota: quotaBytes,
    },
  });

  return Response.json({ success: true });
}
