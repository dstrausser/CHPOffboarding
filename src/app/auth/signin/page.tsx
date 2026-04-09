"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CHP Offboarding</h1>
          <p className="mt-2 text-gray-600">
            Sign in with your Microsoft account to manage user offboarding
          </p>
        </div>
        <button
          onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
            <rect width="10" height="10" fill="#f25022" />
            <rect x="11" width="10" height="10" fill="#7fba00" />
            <rect y="11" width="10" height="10" fill="#00a4ef" />
            <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
          </svg>
          Sign in with Microsoft
        </button>
        <p className="mt-6 text-xs text-gray-400">
          You must have an organizational Microsoft 365 account to access this
          application.
        </p>
      </div>
    </div>
  );
}
