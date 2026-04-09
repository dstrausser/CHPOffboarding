"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserSearch from "@/components/UserSearch";
import StatusBadge from "@/components/StatusBadge";

interface SelectedUser { id: string; displayName: string; mail: string; userPrincipalName: string; accountEnabled: boolean; }
interface UserDetails extends SelectedUser { licenseDetails: { skuId: string; skuPartNumber: string }[]; }
interface OffboardResult { step: string; status: "success" | "error" | "skipped"; message: string; }

export default function OffboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [steps, setSteps] = useState({ removeLicense: true, convertToSharedMailbox: true, archiveOneDrive: true, breakInheritance: true });
  const [mailboxDelegates, setMailboxDelegates] = useState<string[]>([]);
  const [newDelegate, setNewDelegate] = useState("");
  const [archiveViewers, setArchiveViewers] = useState<string[]>([]);
  const [newViewer, setNewViewer] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<OffboardResult[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);

  const handleUserSelect = async (user: SelectedUser) => {
    setSelectedUser(user); setResults(null); setError(""); setLoadingDetails(true);
    try { const res = await fetch(`/api/users/${user.id}`); if (res.ok) setUserDetails(await res.json()); } catch {} finally { setLoadingDetails(false); }
  };

  const addDelegate = () => { if (newDelegate && !mailboxDelegates.includes(newDelegate)) { setMailboxDelegates([...mailboxDelegates, newDelegate]); setNewDelegate(""); } };
  const addViewer = () => { if (newViewer && !archiveViewers.includes(newViewer)) { setArchiveViewers([...archiveViewers, newViewer]); setNewViewer(""); } };

  const runOffboarding = async () => {
    if (!selectedUser) return;
    setRunning(true); setResults(null); setError("");
    try {
      const res = await fetch("/api/offboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedUser.id, steps, mailboxDelegates, archiveViewers }) });
      const data = await res.json();
      if (res.ok) setResults(data.results); else setError(data.error || "Offboarding failed");
    } catch (err: any) { setError(err.message || "Network error"); } finally { setRunning(false); }
  };

  if (status === "loading") return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Offboard User</h1>
      <p className="text-gray-600 mb-8">Search for a user to begin the offboarding process.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Select User</h2>
        <UserSearch onSelect={handleUserSelect} label="Search for user to offboard" placeholder="Enter name or email address..." />
        {loadingDetails && <div className="mt-4 flex items-center text-sm text-gray-500"><div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />Loading user details...</div>}
        {userDetails && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between"><div><p className="font-medium text-gray-900">{userDetails.displayName}</p><p className="text-sm text-gray-500">{userDetails.userPrincipalName}</p></div><StatusBadge status={userDetails.accountEnabled ? "success" : "error"} label={userDetails.accountEnabled ? "Active" : "Disabled"} /></div>
            {userDetails.licenseDetails && userDetails.licenseDetails.length > 0 && <div className="mt-3"><p className="text-sm font-medium text-gray-700">Assigned Licenses:</p><div className="mt-1 flex flex-wrap gap-2">{userDetails.licenseDetails.map((lic) => <span key={lic.skuId} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{lic.skuPartNumber}</span>)}</div></div>}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Configure Offboarding Steps</h2>
          <div className="space-y-4">
            <label className="flex items-center"><input type="checkbox" checked={steps.removeLicense} onChange={(e) => setSteps({ ...steps, removeLicense: e.target.checked })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Remove all assigned licenses</span></label>
            <div>
              <label className="flex items-center"><input type="checkbox" checked={steps.convertToSharedMailbox} onChange={(e) => setSteps({ ...steps, convertToSharedMailbox: e.target.checked })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Convert mailbox to shared mailbox</span></label>
              {steps.convertToSharedMailbox && <div className="ml-7 mt-3 bg-gray-50 rounded-lg p-4"><p className="text-sm font-medium text-gray-700 mb-2">Add delegates to shared mailbox:</p><div className="flex gap-2 mb-2"><input type="email" value={newDelegate} onChange={(e) => setNewDelegate(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDelegate()} placeholder="delegate@company.com" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /><button onClick={addDelegate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add</button></div>{mailboxDelegates.length > 0 && <div className="flex flex-wrap gap-2">{mailboxDelegates.map((d) => <span key={d} className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-gray-200">{d}<button onClick={() => setMailboxDelegates(mailboxDelegates.filter((x) => x !== d))} className="text-red-400 hover:text-red-600 ml-1">x</button></span>)}</div>}</div>}
            </div>
            <label className="flex items-center"><input type="checkbox" checked={steps.archiveOneDrive} onChange={(e) => setSteps({ ...steps, archiveOneDrive: e.target.checked })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Archive OneDrive files to SharePoint</span></label>
            <div>
              <label className="flex items-center"><input type="checkbox" checked={steps.breakInheritance} onChange={(e) => setSteps({ ...steps, breakInheritance: e.target.checked })} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" /><span className="ml-3 text-gray-700">Break inheritance & set specific permissions on archive folder</span></label>
              {steps.breakInheritance && <div className="ml-7 mt-3 bg-gray-50 rounded-lg p-4"><p className="text-sm font-medium text-gray-700 mb-2">Users who should have access to archived files:</p><div className="flex gap-2 mb-2"><input type="email" value={newViewer} onChange={(e) => setNewViewer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addViewer()} placeholder="viewer@company.com" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" /><button onClick={addViewer} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add</button></div>{archiveViewers.length > 0 && <div className="flex flex-wrap gap-2">{archiveViewers.map((v) => <span key={v} className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border border-gray-200">{v}<button onClick={() => setArchiveViewers(archiveViewers.filter((x) => x !== v))} className="text-red-400 hover:text-red-600 ml-1">x</button></span>)}</div>}</div>}
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Execute Offboarding</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"><p className="text-sm text-red-700"><strong>Warning:</strong> This will permanently modify <strong>{selectedUser.displayName}</strong>&apos;s account. Licenses will be removed and OneDrive files will be moved. This action cannot be easily undone.</p></div>
          <button onClick={runOffboarding} disabled={running} className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{running ? <span className="flex items-center justify-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Running Offboarding...</span> : `Offboard ${selectedUser.displayName}`}</button>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p className="text-red-700 font-medium">Error: {error}</p></div>}
      {results && <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">Offboarding Results</h2><div className="space-y-3">{results.map((r, i) => <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><StatusBadge status={r.status} /><div><p className="font-medium text-gray-900">{r.step}</p><p className="text-sm text-gray-600">{r.message}</p></div></div>)}</div></div>}
    </div>
  );
}
