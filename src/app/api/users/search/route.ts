import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getGraphClient, searchUsers } from "@/lib/graph";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = req.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });
  try {
    const client = getGraphClient((session as any).accessToken);
    const users = await searchUsers(client, query);
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to search users" }, { status: 500 });
  }
}
