'use client';

import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchKeys = async () => {
    const token = localStorage.getItem('pif_token');
    const res = await fetch('/api/keys', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const createKey = async () => {
    setCreating(true);
    const token = localStorage.getItem('pif_token');
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newKeyName || 'API Key' }),
    });
    if (res.ok) {
      setNewKeyName('');
      fetchKeys();
    }
    setCreating(false);
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    const token = localStorage.getItem('pif_token');
    await fetch(`/api/keys?id=${keyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchKeys();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">API Keys</h2>
      <p className="text-sm text-gray-500 mb-6">
        Use API keys to authenticate requests to the PIF Generator API.
        Include the key in the <code className="bg-gray-100 px-1 rounded">Authorization: ApiKey your_key_here</code> header.
      </p>

      {/* Create new key */}
      <div className="rounded-xl bg-white p-5 shadow-sm mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Key</h3>
        <div className="flex gap-2">
          <input
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </div>

      {/* Keys list */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : keys.length === 0 ? (
        <p className="text-gray-500">No API keys yet.</p>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <div key={apiKey.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{apiKey.name}</p>
                  <code className="text-xs text-gray-500 break-all">{apiKey.key}</code>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey.key);
                      alert('Copied!');
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => deleteKey(apiKey.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
