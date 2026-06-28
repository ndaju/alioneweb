import { auth } from "@clerk/nextjs/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
    return Response.json({ success: true, email, output: stdout || stderr });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to create email" },
      { status: 500 }
    );
  }
}
