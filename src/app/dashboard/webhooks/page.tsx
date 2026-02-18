'use client';

import { useState, useEffect } from 'react';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  secret?: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    const token = localStorage.getItem('pif_token');
    const res = await fetch('/api/webhooks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setWebhooks(data.webhooks);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const createWebhook = async () => {
    setCreating(true);
    const token = localStorage.getItem('pif_token');
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, events: ['session.completed'] }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewSecret(data.secret);
      setUrl('');
      fetchWebhooks();
    }
    setCreating(false);
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Delete this webhook?')) return;
    const token = localStorage.getItem('pif_token');
    await fetch(`/api/webhooks?id=${webhookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWebhooks();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Webhooks</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Get notified when a form session is completed. We&apos;ll send a POST request to your URL with the session details.
      </p>

      {/* New secret notification */}
      {newSecret && (
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Webhook secret (save this, it won&apos;t be shown again):</p>
          <code className="text-xs break-all text-yellow-700 dark:text-yellow-300">{newSecret}</code>
          <button
            onClick={() => setNewSecret(null)}
            className="mt-2 block text-xs text-yellow-600 dark:text-yellow-400 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Webhook</h3>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            className="flex-1 rounded-lg border dark:border-gray-700 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            type="url"
          />
          <button
            onClick={createWebhook}
            disabled={creating || !url}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : webhooks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No webhooks configured.</p>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{wh.url}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Events: {wh.events.join(', ')} · Created {new Date(wh.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  className="shrink-0 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
