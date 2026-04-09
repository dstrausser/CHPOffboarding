import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

export interface AppSettings {
  sharePointArchiveSiteUrl: string;
  defaultArchiveLibraryName: string;
  defaultMailboxDelegates: string[];
  defaultArchiveViewers: string[];
  offboardingSteps: {
    removeLicense: boolean;
    convertToSharedMailbox: boolean;
    archiveOneDrive: boolean;
    breakInheritance: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  sharePointArchiveSiteUrl: "",
  defaultArchiveLibraryName: "Documents",
  defaultMailboxDelegates: [],
  defaultArchiveViewers: [],
  offboardingSteps: {
    removeLicense: true,
    convertToSharedMailbox: true,
    archiveOneDrive: true,
    breakInheritance: true,
  },
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
}
