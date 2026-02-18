'use client';

import { useState, useMemo } from 'react';
import { analyseRisks, RiskFlag } from '@/lib/riskAnalysis';

interface SectionData {
  sectionKey: string;
  data: Record<string, unknown>;
}

interface CompletionSummaryProps {
  companyName: string;
  sections: SectionData[];
  propertyAddress: string;
  sellerName: string;
}

export default function CompletionSummary({ companyName, sections, propertyAddress, sellerName }: CompletionSummaryProps) {
  const [generatingPif, setGeneratingPif] = useState(false);
  const [showHeadsUp, setShowHeadsUp] = useState(false);

  const summary = useMemo(
    () => analyseRisks(sections, propertyAddress, sellerName),
    [sections, propertyAddress, sellerName]
  );

  // Combine all flags as "heads up" items for the seller
  const headsUpItems = [...summary.redFlags, ...summary.amberFlags];

  const handleDownloadPif = async () => {
    setGeneratingPif(true);
    try {
      const { generatePifPdf } = await import('@/lib/pifPdf');
      const doc = generatePifPdf(sections, propertyAddress, sellerName);
      doc.save(`property-information-form-${propertyAddress.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}.pdf`);
    } catch (error) {
      console.error('PIF PDF generation error:', error);
    } finally {
      setGeneratingPif(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
      {/* Success header */}
      <div className="mx-auto max-w-lg px-4 text-center mb-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">All done!</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your Property Information Form has been submitted to <strong>{companyName}</strong>. Thank you!
        </p>
      </div>

      <div className="mx-auto max-w-lg px-4 space-y-4 pb-8">
        {/* Download PIF */}
        <button
          onClick={handleDownloadPif}
          disabled={generatingPif}
          className="w-full rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {generatingPif ? 'Generating...' : 'Download your form'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Save a copy of all your answers as a PDF
            </div>
          </div>
        </button>

        {/* Heads up section */}
        {headsUpItems.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowHeadsUp(!showHeadsUp)}
              className="w-full p-5 flex items-center gap-4 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Heads up from your answers
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {headsUpItems.length} thing{headsUpItems.length !== 1 ? 's' : ''} your conveyancer may ask about
                </div>
              </div>
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${showHeadsUp ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showHeadsUp && (
              <div className="px-5 pb-5 space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Based on your answers, your conveyancer will likely need more detail on these items.
                  If you have documents or information ready, it could speed things up.
                </p>
                {headsUpItems.map((item, i) => (
                  <HeadsUpCard key={i} flag={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All clear message if no flags */}
        {headsUpItems.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Looking good!</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Nothing flagged from your answers. Your conveyancer will be in touch if they need anything else.
              </div>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-400">1</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">{companyName} will review your form and pass it to the buyer&apos;s conveyancer.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-400">2</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">The conveyancer may follow up with additional questions — having documents ready will help.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-700 dark:text-blue-400">3</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">Keep an eye on your email for any updates from your agent.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Submitted on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

function HeadsUpCard({ flag }: { flag: RiskFlag }) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
      <div className="text-xs font-medium text-amber-600 dark:text-amber-500 mb-0.5">{flag.section}</div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{flag.summary}</div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">Tip:</span> {getSellerTip(flag)}
      </p>
    </div>
  );
}

/**
 * Convert conveyancer-facing advice into seller-friendly tips
 */
function getSellerTip(flag: RiskFlag): string {
  const key = flag.fieldKey;

  const tips: Record<string, string> = {
    has_neighbour_disputes: 'Have any letters or records of the dispute ready to share.',
    has_legal_action: 'Gather any court documents or legal correspondence.',
    extension_approved: 'Look for your planning permission documents and building regulations certificates.',
    has_loft_conversion: 'Find your building regulations completion certificate if you have one.',
    has_walls_removed: 'Check if you have a structural engineer\'s report for the work.',
    has_building_control_notices: 'Collect any notices or correspondence from building control.',
    has_environmental_notices: 'Have the notice details ready — your conveyancer will need the specifics.',
    has_japanese_knotweed: 'Get your treatment plan and any guarantees together.',
    has_flooding: 'Note the dates, extent, and any remedial work done.',
    has_subsidence: 'Find your structural survey and any underpinning certificates.',
    has_insurance_refused: 'Note the reason and check your current policy details.',
    has_insurance_claims: 'List the claims with dates and amounts.',
    has_boundary_disputes: 'Prepare any correspondence or agreements about the boundary.',
    all_owners_agree: 'All legal owners need to consent — speak to your co-owners.',
    boundaries_match_title: 'Your conveyancer will compare the title plan with what\'s on the ground.',
    has_tenants: 'Have the tenancy agreement ready with notice period details.',
    all_occupiers_will_vacate: 'Confirm moving plans with everyone living at the property.',
    has_contamination: 'Note what you know about the contamination and any reports.',
    has_dependent_purchase: 'Keep your agent updated on the progress of your onward purchase.',
    has_leasehold_info: 'Check your lease for the exact remaining term and any extension options.',
    has_coastal_erosion: 'Your conveyancer will check the shoreline management plan.',
    has_restrictions: 'Find your title documents — restrictions are noted on the register.',
    has_rights_of_way: 'Note who uses the right of way and how often.',
  };

  return tips[key] || 'Your conveyancer may ask for more detail on this — have any relevant documents ready.';
}
