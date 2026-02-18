'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';
import ConveyancerSummary from '@/components/ConveyancerSummary';

interface SessionDetail {
  id: string;
  token: string;
  clientName: string | null;
  clientEmail: string | null;
  externalUserId: string | null;
  status: string;
  currentStep: number;
  lastActivityAt: string;
  completedAt: string | null;
  createdAt: string;
  propertyForm: {
    address: string;
    postcode: string;
    sellerName: string;
    sellerEmail: string;
    sections: {
      sectionKey: string;
      title: string;
      status: string;
      data: Record<string, unknown>;
      lastSavedAt: string | null;
    }[];
  } | null;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pif_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`/api/sessions/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSession(data.session);
        setLoading(false);
      });
  }, [params.id, router]);

  const downloadPdf = async () => {
    const token = localStorage.getItem('pif_token');
    const res = await fetch(`/api/sessions/${params.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PIF-${session?.propertyForm?.postcode || 'form'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadData = async () => {
    const token = localStorage.getItem('pif_token');
    const res = await fetch(`/api/sessions/${params.id}/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PIF-${session?.propertyForm?.postcode || 'data'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!session) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Session not found</div>;
  }

  const totalSections = BASPI_SECTIONS.length;
  const completedSections = session.propertyForm?.sections.filter(s => s.status === 'COMPLETED').length ?? 0;
  const progress = session.status === 'COMPLETED' ? 100 : Math.round((completedSections / totalSections) * 100);

  return (
    <div>
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        &larr; Back to sessions
      </button>

      {/* Header card */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {session.clientName || session.externalUserId || 'Unnamed client'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {session.propertyForm?.address || 'No address yet'}
              {session.propertyForm?.postcode && `, ${session.propertyForm.postcode}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
              {session.clientEmail && <span>{session.clientEmail}</span>}
              <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
              {session.completedAt && (
                <span>Completed {new Date(session.completedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadPdf}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={downloadData}
              className="rounded-lg border dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
            <span className="font-medium">{progress}% ({completedSections}/{totalSections} sections)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                session.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form link */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Form Link</h3>
        <div className="flex gap-2">
          <input
            readOnly
            value={`${window.location.origin}/form/${session.token}`}
            className="flex-1 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/form/${session.token}`);
              alert('Copied!');
            }}
            className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Conveyancer Summary — only for completed sessions */}
      {session.status === 'COMPLETED' && session.propertyForm?.sections && (
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm py-6 mb-6">
          <ConveyancerSummary
            sections={session.propertyForm.sections.map(s => ({
              sectionKey: s.sectionKey,
              data: s.data,
            }))}
            propertyAddress={
              [session.propertyForm.address, session.propertyForm.postcode].filter(Boolean).join(', ')
            }
            sellerName={session.propertyForm.sellerName}
          />
        </div>
      )}

      {/* Sections detail */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Section Data</h3>
        {session.propertyForm?.sections.map((section) => {
          const sectionDef = BASPI_SECTIONS.find(s => s.key === section.sectionKey);
          const data = section.data as Record<string, unknown>;
          const hasData = Object.keys(data).length > 0;

          return (
            <details key={section.sectionKey} className="rounded-xl bg-white dark:bg-gray-800 shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      section.status === 'COMPLETED'
                        ? 'bg-green-500'
                        : section.status === 'IN_PROGRESS'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Part {sectionDef?.part}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    section.status === 'COMPLETED'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : section.status === 'IN_PROGRESS'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {section.status === 'COMPLETED' ? 'Complete' : section.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                </span>
              </summary>
              <div className="border-t dark:border-gray-700 px-4 py-3">
                {hasData ? (
                  <dl className="space-y-2">
                    {sectionDef?.fields.map((field) => {
                      const value = data[field.key];
                      if (value === undefined || value === null || value === '') return null;

                      // Check showWhen
                      if (field.showWhen) {
                        const parentVal = data[field.showWhen.field];
                        if (parentVal !== field.showWhen.value) return null;
                      }

                      let display: string;
                      if (typeof value === 'boolean') {
                        display = value ? 'Yes' : 'No';
                      } else if (field.options) {
                        const opt = field.options.find(o => o.value === value);
                        display = opt ? opt.label : String(value);
                      } else {
                        display = String(value);
                      }

                      return (
                        <div key={field.key} className="flex flex-col sm:flex-row sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3">{field.label}</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{display}</dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">No data provided</p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
