"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Library { id: string; name: string; webUrl: string; }

export default function ArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string>("");
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<"read" | "write" | "owner">("read");
  const [adding, setAdding] = useState(false);
  const [results, setResults] = useState<{ email: string; role: string; status: string; message: string }[]>([]);

  useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);
  useEffect(() => { if (session) loadLibraries(); }, [session]);

  const loadLibraries = async () => {
    setLoadingLibraries(true); setLibraryError("");
    try { const res = await fetch("/api/sharepoint/permissions"); if (res.ok) { const data = await res.json(); setLibraries(data); if (data.length > 0) setSelectedLibrary(data[0].id); } else { const err = await res.json(); setLibraryError(err.error || "Failed to load libraries"); } } catch { setLibraryError("Failed to connect"); } finally { setLoadingLibraries(false); }
  };

  const addPermission = async () => {
    if (!selectedLibrary || !userEmail) return; setAdding(true);
    try { const res = await fetch("/api/sharepoint/permissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ libraryId: selectedLibrary, userEmail, role }) }); const data = await res.json(); setResults([...results, { email: userEmail, role, status: res.ok ? "success" : "error", message: data.message || data.error }]); if (res.ok) setUserEmail(""); } catch (err: any) { setResults([...results, { email: userEmail, role, status: "error", message: err.message || "Failed" }]); } finally { setAdding(false); }
  };

  if (status === "loading") return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Archive Site Permissions</h1>
      <p className="text-gray-600 mb-8">Manage who can access archived files in the SharePoint archive site.</p>
      {libraryError && <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4"><div className="flex items-start"><svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg><div><p className="text-amber-800 font-medium">{libraryError}</p><p className="text-sm text-amber-700 mt-1">Make sure the SharePoint archive site URL is configured in <button onClick={() => router.push("/settings")} className="underline font-medium">Settings</button>.</p></div></div></div>}
      {loadingLibraries ? <div className="flex items-center justify-center h-32"><div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div> : libraries.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">Select Document Library</h2><select value={selectedLibrary} onChange={(e) => setSelectedLibrary(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">{libraries.map((lib) => <option key={lib.id} value={lib.id}>{lib.name}</option>)}</select></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">Add User Permission</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="md:col-span-1"><label className="block text-sm font-medium text-gray-700 mb-1">User Email</label><input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPermission()} placeholder="user@company.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label><select value={role} onChange={(e) => setRole(e.target.value as "read" | "write" | "owner")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"><option value="read">Read</option><option value="write">Write</option><option value="owner">Owner</option></select></div><div className="flex items-end"><button onClick={addPermission} disabled={adding || !userEmail} className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{adding ? <span className="flex items-center justify-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Adding...</span> : "Add Permission"}</button></div></div></div>
          {results.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2><div className="space-y-2">{results.map((r, i) => <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${r.status === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}><div><span className={`text-sm font-medium ${r.status === "success" ? "text-green-800" : "text-red-800"}`}>{r.email}</span><span className="text-xs text-gray-500 ml-2">({r.role})</span></div><span className={`text-xs ${r.status === "success" ? "text-green-600" : "text-red-600"}`}>{r.message}</span></div>)}</div></div>}
        </>
      )}
    </div>
  );
}
