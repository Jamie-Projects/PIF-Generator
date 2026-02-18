'use client';

import { useState, useEffect, useCallback } from 'react';
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
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{sessions.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{activeCount}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
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
        <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">No sessions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {session.clientName || session.externalUserId || 'Unnamed client'}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        session.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {session.status === 'COMPLETED' ? 'Complete' : `${session.progress}%`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {session.address || 'No address yet'}
                    {session.postcode && `, ${session.postcode}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.clientEmail && `${session.clientEmail} · `}
                    Created {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {session.status === 'ACTIVE' && session.clientEmail && (
                    <button
                      onClick={() => sendReminder(session.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Send Reminder
                    </button>
                  )}
                  <Link
                    href={`/dashboard/sessions/${session.id}`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
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
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
              {/* Progress bar */}
              {session.status === 'ACTIVE' && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
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

function CreateSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [externalUserId, setExternalUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ formUrl: string } | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    const token = localStorage.getItem('pif_token');

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ clientName, clientEmail, externalUserId }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setCreating(false);
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Session Created</h3>
          <p className="text-sm text-gray-600 mb-3">Share this link with your client:</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={result.formUrl}
              className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
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
            className="mt-4 w-full rounded-lg border py-2 text-sm font-medium text-gray-600"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Session</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
            <input
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. john@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Reference ID (optional)</label>
            <input
              value={externalUserId}
              onChange={e => setExternalUserId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. CRM-12345"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm font-medium text-gray-600">
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
