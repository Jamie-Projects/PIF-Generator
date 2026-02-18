'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Session {
  id: string;
  token: string;
  clientName: string | null;
  clientEmail: string | null;
  externalUserId: string | null;
  status: string;
  progress: number;
  address: string;
  postcode: string;
  lastActivityAt: string;
  completedAt: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSessions = useCallback(async () => {
    const token = localStorage.getItem('pif_token');
    if (!token) return;

    const statusParam = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch(`/api/sessions${statusParam}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sendReminder = async (sessionId: string) => {
    const token = localStorage.getItem('pif_token');
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      alert('Reminder sent successfully');
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to send reminder');
    }
  };

  const activeCount = sessions.filter(s => s.status === 'ACTIVE').length;
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{activeCount}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sessions</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All</option>
            <option value="ACTIVE">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + New Session
          </button>
        </div>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400 shadow-sm">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No sessions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {session.clientName || session.externalUserId || 'Unnamed client'}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        session.status === 'COMPLETED'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {session.status === 'COMPLETED' ? 'Complete' : `${session.progress}%`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {session.address || 'No address yet'}
                    {session.postcode && `, ${session.postcode}`}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {session.clientEmail && `${session.clientEmail} · `}
                    Created {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {session.status === 'ACTIVE' && session.clientEmail && (
                    <button
                      onClick={() => sendReminder(session.id)}
                      className="rounded-lg border dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Send Reminder
                    </button>
                  )}
                  <Link
                    href={`/dashboard/sessions/${session.id}`}
                    className="rounded-lg border dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/form/${session.token}`
                      );
                      alert('Form link copied to clipboard');
                    }}
                    className="rounded-lg border dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              {session.status === 'ACTIVE' && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}

interface AutocompleteResult {
  addresses: string[];
  highlights: string[];
  session: string;
}

function CreateSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [externalUserId, setExternalUserId] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyPostcode, setPropertyPostcode] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ formUrl: string; chimnieStatus?: string; chimnieMessage?: string } | null>(null);

  // Autocomplete state
  const [addressQuery, setAddressQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult | null>(null);
  const [autocompleteSession, setAutocompleteSession] = useState<string | undefined>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  const searchAddress = useCallback(async (query: string, session?: string) => {
    if (query.length < 3) {
      setAutocompleteResults(null);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({ query });
      if (session) params.set('session', session);
      const res = await fetch(`/api/chimnie/address?${params}`);
      if (res.ok) {
        const data: AutocompleteResult = await res.json();
        setAutocompleteResults(data);
        setAutocompleteSession(data.session);
        setShowDropdown(true);
      }
    } catch {
      // Silently fail — user can still type manually
    }
    setIsSearching(false);
  }, []);

  const handleAddressInput = (value: string) => {
    setAddressQuery(value);
    setPropertyAddress(''); // Clear selected address when typing
    setPropertyPostcode('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(value, autocompleteSession);
    }, 300);
  };

  const selectAddress = (address: string) => {
    setPropertyAddress(address);
    setAddressQuery(address);
    setShowDropdown(false);

    // Extract postcode from the address (UK postcodes are typically the last part)
    const postcodeMatch = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
    if (postcodeMatch) {
      setPropertyPostcode(postcodeMatch[0].trim());
    }
  };

  const switchToManualEntry = () => {
    setManualEntry(true);
    setShowDropdown(false);
    setPropertyAddress(addressQuery); // Keep what they typed
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCreate = async () => {
    if (!propertyAddress.trim() || !propertyPostcode.trim()) {
      setError('Property address and postcode are required');
      return;
    }
    setError('');
    setCreating(true);
    const token = localStorage.getItem('pif_token');

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientName, clientEmail, externalUserId,
        propertyAddress, propertyPostcode,
        sellerName, sellerEmail,
        autocompleteSession,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to create session');
    }
    setCreating(false);
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Session Created</h3>

          {result.chimnieStatus === 'prepopulated' && (
            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              Property data found and pre-filled into the form.
            </div>
          )}
          {result.chimnieStatus === 'not_found' && (
            <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              {result.chimnieMessage || 'Property not found — seller will fill in all fields manually.'}
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Share this link with your client:</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={result.formUrl}
              className="flex-1 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm dark:text-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(result.formUrl);
                alert('Copied!');
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Copy
            </button>
          </div>
          <button
            onClick={onCreated}
            className="mt-4 w-full rounded-lg border dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Session</h3>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>
        )}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Property</p>

          {/* Address autocomplete or manual entry */}
          {!manualEntry ? (
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  value={addressQuery}
                  onChange={e => handleAddressInput(e.target.value)}
                  onFocus={() => {
                    if (autocompleteResults && autocompleteResults.addresses.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Start typing an address..."
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  </div>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {showDropdown && autocompleteResults && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg max-h-60 overflow-y-auto">
                  {autocompleteResults.addresses.map((addr, i) => (
                    <button
                      key={i}
                      onClick={() => selectAddress(addr)}
                      className="w-full px-3 py-2.5 text-left text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b dark:border-gray-600 last:border-b-0"
                    >
                      {autocompleteResults.highlights[i] ? (
                        <span dangerouslySetInnerHTML={{ __html: autocompleteResults.highlights[i] }} />
                      ) : (
                        addr
                      )}
                    </button>
                  ))}
                  <button
                    onClick={switchToManualEntry}
                    className="w-full px-3 py-2.5 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 italic"
                  >
                    Can&apos;t find my address — enter manually
                  </button>
                </div>
              )}

              {/* Show "can't find" link after typing enough with no selection */}
              {addressQuery.length >= 3 && !showDropdown && !propertyAddress && (
                <button
                  onClick={switchToManualEntry}
                  className="mt-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600"
                >
                  Can&apos;t find your address? Enter it manually
                </button>
              )}

              {/* Show selected address */}
              {propertyAddress && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Selected: {propertyAddress}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Address <span className="text-red-400">*</span>
              </label>
              <input
                value={propertyAddress}
                onChange={e => setPropertyAddress(e.target.value)}
                className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 42 Acacia Avenue, London"
              />
              <button
                onClick={() => { setManualEntry(false); setAddressQuery(''); setPropertyAddress(''); }}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700"
              >
                Switch back to address search
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postcode <span className="text-red-400">*</span></label>
            <input
              value={propertyPostcode}
              onChange={e => setPropertyPostcode(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. SW1A 1AA"
            />
          </div>

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pt-2">Seller</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seller Name</label>
            <input
              value={sellerName}
              onChange={e => setSellerName(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seller Email</label>
            <input
              value={sellerEmail}
              onChange={e => setSellerEmail(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. jane@example.com"
              type="email"
            />
          </div>

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pt-2">Your Details</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Email</label>
            <input
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. john@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Reference ID (optional)</label>
            <input
              value={externalUserId}
              onChange={e => setExternalUserId(e.target.value)}
              className="w-full rounded-lg border dark:border-gray-600 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="e.g. CRM-12345"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border dark:border-gray-700 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
