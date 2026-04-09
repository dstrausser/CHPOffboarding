"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AppSettings {
  sharePointArchiveSiteUrl: string;
  defaultArchiveLibraryName: string;
  defaultMailboxDelegates: string[];
  defaultArchiveViewers: string[];
  offboardingSteps: { removeLicense: boolean; convertToSharedMailbox: boolean; archiveOneDrive: boolean; breakInheritance: boolean; };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDelegate, setNewDelegate] = useState("");
  const [newViewer, setNewViewer] = useState("");

  useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);
  useEffect(() => { if (session) { fetch("/api/settings").then((r) => r.json()).then((data) => { setSettings(data); setLoading(false); }).catch(() => setLoading(false)); } }, [session]);

  const save = async () => {
    if (!settings) return; setSaving(true); setSaved(false);
    try { const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }); if (res.ok) { setSettings(await res.json()); setSaved(true); setTimeout(() => setSaved(false), 3000); } } catch {} finally { setSaving(false); }
  };

  const addDefaultDelegate = () => { if (newDelegate && settings && !settings.defaultMailboxDelegates.includes(newDelegate)) { setSettings({ ...settings, defaultMailboxDelegates: [...settings.defaultMailboxDelegates, newDelegate] }); setNewDelegate(""); } };
  const addDefaultViewer = () => { if (newViewer && settings && !settings.defaultArchiveViewers.includes(newViewer)) { setSettings({ ...settings, defaultArchiveViewers: [...settings.defaultArchiveViewers, newViewer] }); setNewViewer(""); } };

  if (status === "loading" || loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!session || !settings) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Settings</h1><p className="mt-1 text-gray-600">Configure offboarding defaults and SharePoint integration.</p></div>
        <button onClick={save} disabled={saving} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Saving...</span> : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SharePoint Archive Site</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Archive Site URL</label><input type="url" value={settings.sharePointArchiveSiteUrl} onChange={(e) => setSettings({ ...settings, sharePointArchiveSiteUrl: e.target.value })} placeholder="https://yourtenant.sharepoint.com/sites/archive" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /><p className="mt-1 text-xs text-gray-500">The SharePoint site where offboarded users&apos; OneDrive files will be archived. Leave blank to configure later.</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Document Library Name</label><input type="text" value={settings.defaultArchiveLibraryName} onChange={(e) => setSettings({ ...settings, defaultArchiveLibraryName: e.target.value })} placeholder="Documents" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Offboarding Steps</h2>
        <p className="text-sm text-gray-600 mb-4">Set which steps are enabled by default when starting a new offboarding.</p>
        <div className="space-y-3">
          <label className="flex items-center"><input type="checkbox" checked={settings.offboardingSteps.removeLicense} onChange={(e) => setSettings({ ...settings, offboardingSteps: { ...settings.offboardingSteps, removeLicense: e.target.checked } })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Remove all licenses</span></label>
          <label className="flex items-center"><input type="checkbox" checked={settings.offboardingSteps.convertToSharedMailbox} onChange={(e) => setSettings({ ...settings, offboardingSteps: { ...settings.offboardingSteps, convertToSharedMailbox: e.target.checked } })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Convert to shared mailbox</span></label>
          <label className="flex items-center"><input type="checkbox" checked={settings.offboardingSteps.archiveOneDrive} onChange={(e) => setSettings({ ...settings, offboardingSteps: { ...settings.offboardingSteps, archiveOneDrive: e.target.checked } })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Archive OneDrive to SharePoint</span></label>
          <label className="flex items-center"><input type="checkbox" checked={settings.offboardingSteps.breakInheritance} onChange={(e) => setSettings({ ...settings, offboardingSteps: { ...settings.offboardingSteps, breakInheritance: e.target.checked } })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Break inheritance & restrict permissions</span></label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Shared Mailbox Delegates</h2>
        <p className="text-sm text-gray-600 mb-4">Users who should automatically be added as delegates when a mailbox is converted.</p>
        <div className="flex gap-2 mb-3"><input type="email" value={newDelegate} onChange={(e) => setNewDelegate(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDefaultDelegate()} placeholder="delegate@company.com" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /><button onClick={addDefaultDelegate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button></div>
        {settings.defaultMailboxDelegates.length > 0 ? <div className="flex flex-wrap gap-2">{settings.defaultMailboxDelegates.map((d) => <span key={d} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{d}<button onClick={() => setSettings({ ...settings, defaultMailboxDelegates: settings.defaultMailboxDelegates.filter((x) => x !== d) })} className="text-blue-400 hover:text-blue-600 ml-1">x</button></span>)}</div> : <p className="text-sm text-gray-400 italic">No default delegates configured</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Archive Viewers</h2>
        <p className="text-sm text-gray-600 mb-4">Users who should automatically get access to archived files after inheritance is broken.</p>
        <div className="flex gap-2 mb-3"><input type="email" value={newViewer} onChange={(e) => setNewViewer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDefaultViewer()} placeholder="viewer@company.com" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /><button onClick={addDefaultViewer} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button></div>
        {settings.defaultArchiveViewers.length > 0 ? <div className="flex flex-wrap gap-2">{settings.defaultArchiveViewers.map((v) => <span key={v} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">{v}<button onClick={() => setSettings({ ...settings, defaultArchiveViewers: settings.defaultArchiveViewers.filter((x) => x !== v) })} className="text-purple-400 hover:text-purple-600 ml-1">x</button></span>)}</div> : <p className="text-sm text-gray-400 italic">No default viewers configured</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azure AD / Entra ID Configuration</h2>
        <p className="text-sm text-gray-600 mb-4">These settings are configured via environment variables in your Vercel deployment.</p>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm font-mono">
          <p><span className="text-gray-500">AZURE_AD_CLIENT_ID=</span><span className="text-gray-400">***configured***</span></p>
          <p><span className="text-gray-500">AZURE_AD_CLIENT_SECRET=</span><span className="text-gray-400">***hidden***</span></p>
          <p><span className="text-gray-500">AZURE_AD_TENANT_ID=</span><span className="text-gray-400">***configured***</span></p>
        </div>
      </div>
    </div>
  );
}
