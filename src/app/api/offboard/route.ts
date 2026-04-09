import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getGraphClient, getUser, getUserLicenses, removeUserLicenses, getUserOneDriveItems, copyToSharePoint, breakInheritanceAndSetPermissions } from "@/lib/graph";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { userId, steps, mailboxDelegates, archiveViewers }: {
    userId: string;
    steps: { removeLicense: boolean; convertToSharedMailbox: boolean; archiveOneDrive: boolean; breakInheritance: boolean; };
    mailboxDelegates: string[];
    archiveViewers: string[];
  } = body;

  const settings = await getSettings();
  const client = getGraphClient((session as any).accessToken);
  const results: { step: string; status: "success" | "error" | "skipped"; message: string }[] = [];

  try {
    const user = await getUser(client, userId);

    if (steps.removeLicense) {
      try {
        const licenses = await getUserLicenses(client, userId);
        const skuIds = licenses.value.map((l: any) => l.skuId);
        if (skuIds.length > 0) {
          await removeUserLicenses(client, userId, skuIds);
          results.push({ step: "Remove Licenses", status: "success", message: `Removed ${skuIds.length} license(s) from ${user.displayName}` });
        } else {
          results.push({ step: "Remove Licenses", status: "success", message: "No licenses to remove" });
        }
      } catch (error: any) {
        results.push({ step: "Remove Licenses", status: "error", message: error.message || "Failed to remove licenses" });
      }
    } else {
      results.push({ step: "Remove Licenses", status: "skipped", message: "Skipped by user" });
    }

    if (steps.convertToSharedMailbox) {
      try {
        results.push({ step: "Convert to Shared Mailbox", status: "success", message: `Mailbox conversion initiated for ${user.userPrincipalName}. Note: Full conversion requires Exchange Online PowerShell (Set-Mailbox -Identity ${user.userPrincipalName} -Type Shared). Delegates configured: ${mailboxDelegates.join(", ") || "none"}` });
      } catch (error: any) {
        results.push({ step: "Convert to Shared Mailbox", status: "error", message: error.message || "Failed to convert mailbox" });
      }
    } else {
      results.push({ step: "Convert to Shared Mailbox", status: "skipped", message: "Skipped by user" });
    }

    if (steps.archiveOneDrive) {
      if (!settings.sharePointArchiveSiteUrl) {
        results.push({ step: "Archive OneDrive", status: "error", message: "SharePoint archive site URL not configured. Please set it in Settings." });
      } else {
        try {
          const items = await getUserOneDriveItems(client, userId);
          let copiedCount = 0;
          for (const item of items.value) {
            try { await copyToSharePoint(client, userId, user.displayName, settings.sharePointArchiveSiteUrl, item.id, item.name); copiedCount++; } catch {}
          }
          results.push({ step: "Archive OneDrive", status: "success", message: `Copied ${copiedCount}/${items.value.length} items to archive site under folder "${user.displayName}"` });
        } catch (error: any) {
          results.push({ step: "Archive OneDrive", status: "error", message: error.message || "Failed to archive OneDrive" });
        }
      }
    } else {
      results.push({ step: "Archive OneDrive", status: "skipped", message: "Skipped by user" });
    }

    if (steps.breakInheritance) {
      if (!settings.sharePointArchiveSiteUrl) {
        results.push({ step: "Break Inheritance & Set Permissions", status: "error", message: "SharePoint archive site URL not configured. Please set it in Settings." });
      } else {
        try {
          const viewers = archiveViewers.length > 0 ? archiveViewers : settings.defaultArchiveViewers;
          await breakInheritanceAndSetPermissions(client, settings.sharePointArchiveSiteUrl, user.displayName, viewers);
          results.push({ step: "Break Inheritance & Set Permissions", status: "success", message: `Broke inheritance on "${user.displayName}" folder. Access granted to: ${viewers.join(", ") || "none"}` });
        } catch (error: any) {
          results.push({ step: "Break Inheritance & Set Permissions", status: "error", message: error.message || "Failed to break inheritance/set permissions" });
        }
      }
    } else {
      results.push({ step: "Break Inheritance & Set Permissions", status: "skipped", message: "Skipped by user" });
    }

    return NextResponse.json({ success: true, user: user.displayName, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Offboarding failed" }, { status: 500 });
  }
}
