'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BASPI_SECTIONS } from '@/lib/baspiSchema';
import QuestionField from './QuestionField';
import ProgressBar from './ProgressBar';
import SaveIndicator from './SaveIndicator';

interface SectionData {
  id: string;
  sectionKey: string;
  title: string;
  status: string;
  data: Record<string, unknown>;
  lastSavedAt: string | null;
}

interface FormDetails {
  id: string;
  address: string;
  postcode: string;
  sellerName: string;
  sellerEmail: string;
}

interface FormWizardProps {
  token: string;
  sessionId: string;
  companyName: string;
  initialStep: number;
  form: FormDetails;
  sections: SectionData[];
  isCompleted: boolean;
}

export default function FormWizard({
  token,
  sessionId,
  companyName,
  initialStep,
  sections: initialSections,
  isCompleted: initialIsCompleted,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [sections, setSections] = useState(initialSections);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const currentSectionDef = BASPI_SECTIONS[currentStep];
  const currentSection = sections.find(s => s.sectionKey === currentSectionDef?.key);

  // Auto-save with debounce
  const saveSection = useCallback(async (sectionKey: string, data: Record<string, unknown>, step: number) => {
    setSaveStatus('saving');
    try {
      // If this is property_details or seller_details, also update form-level info
      let formDetails: Record<string, string> | undefined;
      if (sectionKey === 'property_details') {
        formDetails = {
          address: [data.address_line1, data.address_line2].filter(Boolean).join(', ') as string,
          postcode: (data.postcode as string) || '',
        };
      } else if (sectionKey === 'seller_details') {
        formDetails = {
          sellerName: (data.seller_full_name as string) || '',
          sellerEmail: (data.seller_email as string) || '',
        };
      }

      const response = await fetch(`/api/form/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          data,
          currentStep: step,
          formDetails,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSaveStatus('saved');
        setLastSaved(result.savedAt);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [token]);

  const debouncedSave = useCallback(
    (sectionKey: string, data: Record<string, unknown>, step: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveSection(sectionKey, data, step);
      }, 1000);
    },
    [saveSection]
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleFieldChange = (key: string, value: unknown) => {
    if (!currentSection || isCompleted) return;

    const updatedData = {
      ...(currentSection.data as Record<string, unknown>),
      [key]: value,
    };

    setSections(prev =>
      prev.map(s =>
        s.sectionKey === currentSection.sectionKey
          ? { ...s, data: updatedData, status: 'IN_PROGRESS' }
          : s
      )
    );

    debouncedSave(currentSection.sectionKey, updatedData, currentStep);
  };

  const markSectionComplete = async () => {
    if (!currentSection) return;

    const updatedSections = sections.map(s =>
      s.sectionKey === currentSection.sectionKey
        ? { ...s, status: 'COMPLETED' }
        : s
    );
    setSections(updatedSections);

    // Save immediately
    await saveSection(currentSection.sectionKey, currentSection.data as Record<string, unknown>, currentStep);

    // Mark section as completed server-side
    await fetch(`/api/form/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionKey: currentSection.sectionKey,
        data: currentSection.data,
        currentStep: currentStep + 1,
      }),
    });

    // Move to next step
    if (currentStep < BASPI_SECTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    // Mark last section as complete
    await markSectionComplete();

    // Complete the session
    try {
      await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing form:', error);
    }
  };

  const goToStep = (step: number) => {
    // Save current section before navigating
    if (currentSection && !isCompleted) {
      saveSection(currentSection.sectionKey, currentSection.data as Record<string, unknown>, step);
    }
    setCurrentStep(step);
    setShowMobileNav(false);
  };

  const isLastStep = currentStep === BASPI_SECTIONS.length - 1;

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Form Completed</h2>
          <p className="text-gray-600">
            Thank you for completing your Property Information Form.
            Your information has been submitted to <strong>{companyName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Property Information Form</h1>
            <p className="text-xs text-gray-500">Provided by {companyName}</p>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="rounded-lg border p-2 lg:hidden"
              aria-label="Toggle navigation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-4 lg:p-6">
        {/* Sidebar - Progress Navigation */}
        <aside
          className={`${
            showMobileNav ? 'fixed inset-0 z-40 bg-white p-4 overflow-y-auto' : 'hidden'
          } lg:block lg:w-72 lg:shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
        >
          {showMobileNav && (
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-bold">Sections</h2>
              <button
                onClick={() => setShowMobileNav(false)}
                className="rounded-lg border p-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="rounded-xl bg-white p-4 shadow-sm lg:shadow">
            <ProgressBar
              currentStep={currentStep}
              sections={sections}
              onStepClick={goToStep}
            />
          </div>
        </aside>

        {/* Main form area */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
            {/* Section header */}
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-1">
                <span>Part {currentSectionDef?.part}</span>
                <span className="text-gray-300">|</span>
                <span>Section {currentStep + 1} of {BASPI_SECTIONS.length}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{currentSectionDef?.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{currentSectionDef?.description}</p>
            </div>

            {/* Fields */}
            <div className="space-y-1">
              {currentSectionDef?.fields.map((field) => (
                <QuestionField
                  key={field.key}
                  field={field}
                  value={(currentSection?.data as Record<string, unknown>)?.[field.key]}
                  onChange={handleFieldChange}
                  allValues={(currentSection?.data as Record<string, unknown>) || {}}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => goToStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(Math.min(BASPI_SECTIONS.length - 1, currentStep + 1))}
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Skip for now
                </button>
                {isLastStep ? (
                  <button
                    onClick={handleComplete}
                    className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
                  >
                    Submit Form
                  </button>
                ) : (
                  <button
                    onClick={markSectionComplete}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Save & Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
