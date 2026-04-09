import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getGraphClient, getSiteLibraries, addSiteLibraryPermission } from "@/lib/graph";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  if (!settings.sharePointArchiveSiteUrl) return NextResponse.json({ error: "SharePoint archive site URL not configured" }, { status: 400 });
  try {
    const client = getGraphClient((session as any).accessToken);
    const libraries = await getSiteLibraries(client, settings.sharePointArchiveSiteUrl);
    return NextResponse.json(libraries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get libraries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { libraryId, userEmail, role } = await req.json();
  if (!libraryId || !userEmail) return NextResponse.json({ error: "libraryId and userEmail are required" }, { status: 400 });
  const settings = await getSettings();
  if (!settings.sharePointArchiveSiteUrl) return NextResponse.json({ error: "SharePoint archive site URL not configured" }, { status: 400 });
  try {
    const client = getGraphClient((session as any).accessToken);
    await addSiteLibraryPermission(client, settings.sharePointArchiveSiteUrl, libraryId, userEmail, role || "read");
    return NextResponse.json({ success: true, message: `Added ${userEmail} with ${role || "read"} access` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add permission" }, { status: 500 });
  }
}
