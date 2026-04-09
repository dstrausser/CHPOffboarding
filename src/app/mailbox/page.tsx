"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserSearch from "@/components/UserSearch";

interface SelectedUser { id: string; displayName: string; mail: string; userPrincipalName: string; }

export default function MailboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedMailbox, setSelectedMailbox] = useState<SelectedUser | null>(null);
  const [delegateEmail, setDelegateEmail] = useState("");
  const [delegates, setDelegates] = useState<{ email: string; status: string; message: string }[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/auth/signin"); }, [status, router]);

  const addDelegate = async () => {
    if (!selectedMailbox || !delegateEmail) return;
    setAdding(true);
    try {
      const res = await fetch("/api/mailbox/delegates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mailboxUserId: selectedMailbox.id, delegateEmail }) });
      const data = await res.json();
      setDelegates([...delegates, { email: delegateEmail, status: res.ok ? "success" : "error", message: data.message || data.error }]);
      if (res.ok) setDelegateEmail("");
    } catch (err: any) { setDelegates([...delegates, { email: delegateEmail, status: "error", message: err.message || "Failed" }]); } finally { setAdding(false); }
  };

  if (status === "loading") return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Mailbox Management</h1>
      <p className="text-gray-600 mb-8">Add delegates to converted shared mailboxes so users can access them.</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Shared Mailbox</h2>
        <UserSearch onSelect={setSelectedMailbox} label="Search for the shared mailbox (former user)" placeholder="Enter name or email of the converted mailbox..." />
        {selectedMailbox && <div className="mt-4 bg-green-50 rounded-lg p-4"><p className="font-medium text-green-900">Selected: {selectedMailbox.displayName}</p><p className="text-sm text-green-700">{selectedMailbox.mail || selectedMailbox.userPrincipalName}</p></div>}
      </div>
      {selectedMailbox && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Delegate</h2>
          <p className="text-sm text-gray-600 mb-4">Add users who should have access to this shared mailbox.</p>
          <div className="flex gap-3">
            <input type="email" value={delegateEmail} onChange={(e) => setDelegateEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDelegate()} placeholder="user@company.com" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            <button onClick={addDelegate} disabled={adding || !delegateEmail} className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{adding ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />Adding...</span> : "Add Delegate"}</button>
          </div>
          {delegates.length > 0 && <div className="mt-4 space-y-2"><p className="text-sm font-medium text-gray-700">Results:</p>{delegates.map((d, i) => <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${d.status === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}><span className={`text-sm font-medium ${d.status === "success" ? "text-green-800" : "text-red-800"}`}>{d.email}</span><span className={`text-xs ${d.status === "success" ? "text-green-600" : "text-red-600"}`}>{d.message}</span></div>)}</div>}
        </div>
      )}
    </div>
  );
}
