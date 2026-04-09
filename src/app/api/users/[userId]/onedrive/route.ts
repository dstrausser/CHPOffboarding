import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getGraphClient, getUserOneDriveItems } from "@/lib/graph";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = getGraphClient((session as any).accessToken);
    const items = await getUserOneDriveItems(client, params.userId);
    return NextResponse.json(items.value);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get OneDrive items" }, { status: 500 });
  }
}
