"use client";

import { useState, useCallback } from "react";

interface User {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  accountEnabled: boolean;
}

interface UserSearchProps {
  onSelect: (user: User) => void;
  label?: string;
  placeholder?: string;
}

export default function UserSearch({
  onSelect,
  label = "Search User",
  placeholder = "Type a name or email...",
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // Search failed silently
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
      {loading && (
        <div className="absolute right-3 top-9">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelect(user);
                setQuery(user.displayName);
                setShowResults(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">
                {user.displayName}
              </div>
              <div className="text-sm text-gray-500">
                {user.mail || user.userPrincipalName}
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  user.accountEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.accountEnabled ? "Active" : "Disabled"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
