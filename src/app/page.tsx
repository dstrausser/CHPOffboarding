"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then(setSettings)
        .catch(() => {});
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const hasArchiveSite = settings?.sharePointArchiveSiteUrl;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome, {session.user?.name}. Manage user offboarding for your
          organization.
        </p>
      </div>

      {!hasArchiveSite && settings && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800">
                SharePoint Archive Site Not Configured
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                OneDrive archiving and permission management require a SharePoint
                archive site URL.{" "}
                <button
                  onClick={() => router.push("/settings")}
                  className="underline font-medium hover:text-amber-900"
                >
                  Configure it in Settings
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => router.push("/offboard")}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Offboard User</h3>
          <p className="mt-1 text-sm text-gray-500">Remove license, convert mailbox, archive OneDrive files</p>
        </button>

        <button
          onClick={() => router.push("/mailbox")}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-green-300 transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Shared Mailboxes</h3>
          <p className="mt-1 text-sm text-gray-500">Add or manage delegates on converted shared mailboxes</p>
        </button>

        <button
          onClick={() => router.push("/archive")}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-purple-300 transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Archive Permissions</h3>
          <p className="mt-1 text-sm text-gray-500">Manage who can access archived files in SharePoint</p>
        </button>

        <button
          onClick={() => router.push("/settings")}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-gray-400 transition-all"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <p className="mt-1 text-sm text-gray-500">Configure SharePoint URL, defaults, and offboarding steps</p>
        </button>
      </div>
    </div>
  );
}
