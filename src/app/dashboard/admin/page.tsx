'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  createdAt: string;
  _count: { sessions: number };
}

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCompanies = useCallback(async () => {
    const token = localStorage.getItem('pif_token');
    if (!token) { router.push('/'); return; }

    const res = await fetch('/api/admin/companies', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      router.push('/dashboard');
      return;
    }

    const data = await res.json();
    setCompanies(data.companies);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const toggleApproval = async (companyId: string, approved: boolean) => {
    const token = localStorage.getItem('pif_token');
    setError('');

    const res = await fetch('/api/admin/companies', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ companyId, approved }),
    });

    if (!res.ok) {
      setError('Failed to update company');
      return;
    }

    setCompanies(prev =>
      prev.map(c => c.id === companyId ? { ...c, approved } : c)
    );
  };

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  const pending = companies.filter(c => !c.approved);
  const approved = companies.filter(c => c.approved);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin - Company Approvals</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Pending Approval ({pending.length})
          </h2>
          <div className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
            {pending.map(company => (
              <div key={company.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{company.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Registered {new Date(company.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleApproval(company.id, true)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="mb-8 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
          No pending approvals
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Approved Companies ({approved.length})
      </h2>
      <div className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
        {approved.map(company => (
          <div key={company.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {company.email} &middot; {company._count.sessions} sessions
              </p>
            </div>
            <button
              onClick={() => toggleApproval(company.id, false)}
              className="rounded-lg border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
