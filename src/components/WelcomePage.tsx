'use client';

interface WelcomePageProps {
  companyName: string;
  hasPrepopulatedData: boolean;
  prepopulatedFieldCount: number;
  onGetStarted: () => void;
}

export default function WelcomePage({ companyName, hasPrepopulatedData, prepopulatedFieldCount, onGetStarted }: WelcomePageProps) {
  const totalFields = 150;
  const remainingFields = totalFields - prepopulatedFieldCount;
  const timeSavedMinutes = Math.max(1, Math.round(prepopulatedFieldCount * 0.25));
  const remainingMinutes = Math.max(1, Math.round(remainingFields * 0.1));

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Property Information Form
            </h1>
            {companyName && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Requested by {companyName}
              </p>
            )}
          </div>

          <div className="space-y-3 mb-5">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This form collects important information about your property as part of the selling process.
              It covers details such as property characteristics, boundaries, utilities, and any known issues.
            </p>

            {hasPrepopulatedData ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                It should take approximately <strong className="text-gray-900 dark:text-white">~{remainingMinutes} minutes</strong> to complete.
                Your progress is saved automatically, so you can return to it at any time.
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                It should take approximately <strong className="text-gray-900 dark:text-white">20 minutes</strong> to complete.
                Your progress is saved automatically, so you can return to it at any time.
              </p>
            )}
          </div>

          {hasPrepopulatedData && (
            <div className="rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 px-4 py-3 mb-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {prepopulatedFieldCount} of ~{totalFields} questions already answered
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Saving you roughly {timeSavedMinutes} minutes
                  </p>
                </div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">
                We&apos;ve pre-filled answers using property data and the details your conveyancer provided.
                Please review them carefully as you go — you are liable for accuracy.
              </p>
            </div>
          )}

          <button
            onClick={onGetStarted}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm transition-colors active:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
