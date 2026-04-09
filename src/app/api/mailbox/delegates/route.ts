import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getGraphClient, addMailboxPermission } from "@/lib/graph";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { mailboxUserId, delegateEmail } = await req.json();
  if (!mailboxUserId || !delegateEmail) return NextResponse.json({ error: "mailboxUserId and delegateEmail are required" }, { status: 400 });
  try {
    const client = getGraphClient((session as any).accessToken);
    await addMailboxPermission(client, mailboxUserId, delegateEmail);
    return NextResponse.json({ success: true, message: `Added ${delegateEmail} as delegate to mailbox` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add delegate" }, { status: 500 });
  }
}
