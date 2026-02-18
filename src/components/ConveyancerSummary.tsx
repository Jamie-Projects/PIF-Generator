'use client';

import { useState, useMemo } from 'react';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';
import { analyseRisks, RiskFlag, ConveyancerSummary as ConveyancerSummaryType } from '@/lib/riskAnalysis';

interface SectionData {
  sectionKey: string;
  data: Record<string, unknown>;
}

interface ConveyancerSummaryProps {
  sections: SectionData[];
  propertyAddress: string;
  sellerName: string;
}

export default function ConveyancerSummary({ sections, propertyAddress, sellerName }: ConveyancerSummaryProps) {
  const [expandedTab, setExpandedTab] = useState<'red' | 'amber' | null>('red');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const summary: ConveyancerSummaryType = useMemo(
    () => analyseRisks(sections, propertyAddress, sellerName),
    [sections, propertyAddress, sellerName]
  );

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const { generateConveyancerPdf } = await import('@/lib/conveyancerPdf');
      const doc = generateConveyancerPdf(summary);
      doc.save(`conveyancer-summary-${propertyAddress.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-8">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Conveyancer Summary</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Risk analysis based on form responses</p>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-center">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.redFlags.length}</div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-500 uppercase">Red</div>
        </div>
        <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-3 text-center">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{summary.amberFlags.length}</div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase">Amber</div>
        </div>
        <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 p-3 text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{summary.greenCount}</div>
          <div className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase">Clear</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
        {summary.totalChecked} risk factors assessed from {BASPI_SECTIONS.length} sections
      </p>

      {/* Red flags */}
      {summary.redFlags.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setExpandedTab(expandedTab === 'red' ? null : 'red')}
            className="w-full flex items-center justify-between rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-left"
          >
            <span className="font-semibold text-red-800 dark:text-red-300">
              Red Flags ({summary.redFlags.length})
            </span>
            <svg
              className={`h-5 w-5 text-red-500 transition-transform ${expandedTab === 'red' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedTab === 'red' && (
            <div className="mt-2 space-y-3">
              {summary.redFlags.map((f, i) => (
                <FlagCard key={i} flag={f} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Amber flags */}
      {summary.amberFlags.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setExpandedTab(expandedTab === 'amber' ? null : 'amber')}
            className="w-full flex items-center justify-between rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 text-left"
          >
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Amber Flags ({summary.amberFlags.length})
            </span>
            <svg
              className={`h-5 w-5 text-amber-500 transition-transform ${expandedTab === 'amber' ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedTab === 'amber' && (
            <div className="mt-2 space-y-3">
              {summary.amberFlags.map((f, i) => (
                <FlagCard key={i} flag={f} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Green summary */}
      <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-4 py-3 mb-6">
        <p className="text-sm text-green-800 dark:text-green-300">
          <span className="font-semibold">{summary.greenCount} items</span> assessed with no concerns raised.
        </p>
      </div>

      {/* Download PDF button */}
      <button
        onClick={handleDownloadPdf}
        disabled={generatingPdf}
        className="w-full rounded-xl bg-gray-900 dark:bg-white py-3.5 text-base font-semibold text-white dark:text-gray-900 shadow-sm transition-colors active:bg-gray-800 dark:active:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {generatingPdf ? 'Generating...' : 'Download PDF Report'}
      </button>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
        Auto-generated from seller responses. Not legal advice. All flagged items should be independently verified.
      </p>
    </div>
  );
}

function FlagCard({ flag }: { flag: RiskFlag }) {
  const isRed = flag.level === 'red';

  return (
    <div className={`rounded-xl border px-4 py-3 ${
      isRed ? 'border-red-200 dark:border-red-800 bg-white dark:bg-gray-800' : 'border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-start gap-2 mb-1">
        <span className={`mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
          isRed ? 'bg-red-500' : 'bg-amber-500'
        }`} />
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{flag.section}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{flag.summary}</div>
        </div>
      </div>
      <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
        isRed ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
      }`}>
        <span className="font-semibold">Action: </span>{flag.advice}
      </div>
    </div>
  );
}
