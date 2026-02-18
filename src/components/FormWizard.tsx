'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BASPI_SECTIONS, FormField } from '@/lib/baspiSchema';
import QuestionField from './QuestionField';
import SaveIndicator from './SaveIndicator';
import CompletionSummary from './CompletionSummary';
import PrepopulationConsent from './PrepopulationConsent';

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
  form,
  sections: initialSections,
  isCompleted: initialIsCompleted,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [sections, setSections] = useState(initialSections);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [showSectionNav, setShowSectionNav] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPrepopulation, setShowPrepopulation] = useState(() => {
    // Show prepopulation only for fresh forms (step 0, no data yet)
    if (initialIsCompleted || initialStep > 0) return false;
    const hasAnyData = initialSections.some(s => {
      const data = s.data as Record<string, unknown>;
      return Object.values(data).some(v => v !== undefined && v !== null && v !== '');
    });
    return !hasAnyData;
  });
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentSectionDef = BASPI_SECTIONS[currentStep];
  const currentSection = sections.find(s => s.sectionKey === currentSectionDef?.key);
  const sectionData = useMemo(
    () => (currentSection?.data as Record<string, unknown>) || {},
    [currentSection]
  );

  // Get visible fields (respecting showWhen conditions)
  const visibleFields = useMemo(() => {
    if (!currentSectionDef) return [];
    return currentSectionDef.fields.filter((field: FormField) => {
      if (!field.showWhen) return true;
      return sectionData[field.showWhen.field] === field.showWhen.value;
    });
  }, [currentSectionDef, sectionData]);

  const currentField = visibleFields[currentFieldIndex];
  const isFirstField = currentFieldIndex === 0 && currentStep === 0;
  const isLastField = currentFieldIndex >= visibleFields.length - 1;
  const isLastSection = currentStep === BASPI_SECTIONS.length - 1;

  // Total progress across all sections
  const totalFields = BASPI_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
  const answeredFields = sections.reduce((sum, s) => {
    const data = s.data as Record<string, unknown>;
    return sum + Object.values(data).filter(v => v !== undefined && v !== null && v !== '').length;
  }, 0);
  const progressPercent = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0;

  // Check if all required fields are answered
  const getMissingRequired = useCallback(() => {
    const missing: { section: string; field: string }[] = [];
    for (const sectionDef of BASPI_SECTIONS) {
      const section = sections.find(s => s.sectionKey === sectionDef.key);
      const data = (section?.data as Record<string, unknown>) || {};
      for (const field of sectionDef.fields) {
        if (!field.required) continue;
        // Skip conditional fields whose parent condition isn't met
        if (field.showWhen && data[field.showWhen.field] !== field.showWhen.value) continue;
        const val = data[field.key];
        if (val === undefined || val === null || val === '') {
          missing.push({ section: sectionDef.title, field: field.label });
        }
      }
    }
    return missing;
  }, [sections]);

  // Auto-save with debounce
  const saveSection = useCallback(async (sectionKey: string, data: Record<string, unknown>, step: number) => {
    setSaveStatus('saving');
    try {
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
        body: JSON.stringify({ sectionKey, data, currentStep: step, formDetails }),
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

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Scroll to top when changing fields
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentFieldIndex, currentStep]);

  const handleFieldChange = (key: string, value: unknown) => {
    if (!currentSection || isCompleted) return;
    setValidationError(null);

    const updatedData = { ...sectionData, [key]: value };

    setSections(prev =>
      prev.map(s =>
        s.sectionKey === currentSection.sectionKey
          ? { ...s, data: updatedData, status: 'IN_PROGRESS' }
          : s
      )
    );

    debouncedSave(currentSection.sectionKey, updatedData, currentStep);
  };

  const goToNextField = () => {
    setValidationError(null);
    if (isLastField) {
      if (isLastSection) return;
      if (currentSection) {
        saveSection(currentSection.sectionKey, sectionData, currentStep + 1);
      }
      setCurrentStep(prev => prev + 1);
      setCurrentFieldIndex(0);
    } else {
      setCurrentFieldIndex(prev => prev + 1);
    }
  };

  const goToPrevField = () => {
    setValidationError(null);
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(prev => prev - 1);
    } else if (currentStep > 0) {
      if (currentSection) {
        saveSection(currentSection.sectionKey, sectionData, currentStep - 1);
      }
      setCurrentStep(prev => prev - 1);
      const prevSectionDef = BASPI_SECTIONS[currentStep - 1];
      setCurrentFieldIndex(prevSectionDef ? prevSectionDef.fields.length - 1 : 0);
    }
  };

  const goToSection = (step: number) => {
    if (currentSection) {
      saveSection(currentSection.sectionKey, sectionData, step);
    }
    setCurrentStep(step);
    setCurrentFieldIndex(0);
    setShowSectionNav(false);
    setValidationError(null);
  };

  const handleComplete = async () => {
    // Validate required fields
    const missing = getMissingRequired();
    if (missing.length > 0) {
      const count = missing.length;
      setValidationError(
        `${count} required field${count > 1 ? 's are' : ' is'} missing. Tap "Sections" above to review.`
      );
      return;
    }

    // Capture audit data for signature
    const declarationSection = sections.find(s => s.sectionKey === 'declaration');
    const declarationData = (declarationSection?.data as Record<string, unknown>) || {};
    const auditData = {
      ...declarationData,
      signature_timestamp: new Date().toISOString(),
      signature_useragent: navigator.userAgent,
      signature_screen: `${window.screen.width}x${window.screen.height}`,
      signature_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      signature_language: navigator.language,
    };

    // Save declaration with audit data
    if (declarationSection) {
      setSections(prev =>
        prev.map(s =>
          s.sectionKey === 'declaration' ? { ...s, data: auditData } : s
        )
      );
      await saveSection('declaration', auditData, currentStep);
    }

    // Save current section if different from declaration
    if (currentSection && currentSection.sectionKey !== 'declaration') {
      await saveSection(currentSection.sectionKey, sectionData, currentStep);
    }

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

  // Seed address from company-provided form details into property_details section
  const seedAddressData = useCallback(async () => {
    if (!form.address && !form.postcode) return;
    const propSection = sections.find(s => s.sectionKey === 'property_details');
    if (!propSection) return;
    const existing = propSection.data as Record<string, unknown>;
    // Only seed if not already filled
    if (existing.postcode) return;

    // Parse address into line1 and city
    const parts = form.address.split(',').map(s => s.trim());
    const seedData: Record<string, unknown> = {
      ...existing,
      postcode: form.postcode,
    };
    if (parts[0]) seedData.address_line1 = parts[0];
    if (parts.length > 1) seedData.city = parts[parts.length - 1];
    if (form.sellerName) {
      // Also seed seller details
      const sellerSection = sections.find(s => s.sectionKey === 'seller_details');
      if (sellerSection) {
        const sellerData: Record<string, unknown> = { ...(sellerSection.data as Record<string, unknown>), seller_full_name: form.sellerName };
        if (form.sellerEmail) sellerData.seller_email = form.sellerEmail;
        setSections(prev => prev.map(s =>
          s.sectionKey === 'seller_details' ? { ...s, data: sellerData, status: 'IN_PROGRESS' } : s
        ));
        await saveSection('seller_details', sellerData, 0);
      }
    }

    setSections(prev => prev.map(s =>
      s.sectionKey === 'property_details' ? { ...s, data: seedData, status: 'IN_PROGRESS' } : s
    ));
    await saveSection('property_details', seedData, 0);
  }, [form, sections, saveSection]);

  const handlePrepopulationAccept = async (prepopulated: Record<string, Record<string, unknown>>) => {
    // Merge prepopulated data into sections
    setSections(prev => prev.map(s => {
      const preData = prepopulated[s.sectionKey];
      if (!preData) return s;
      const mergedData = { ...(s.data as Record<string, unknown>), ...preData };
      return { ...s, data: mergedData, status: 'IN_PROGRESS' };
    }));

    // Save each prepopulated section to the server
    for (const [sectionKey, data] of Object.entries(prepopulated)) {
      const section = sections.find(s => s.sectionKey === sectionKey);
      if (section) {
        const mergedData = { ...(section.data as Record<string, unknown>), ...data };
        await saveSection(sectionKey, mergedData, 0);
      }
    }

    setShowPrepopulation(false);
  };

  const handleSkipPrepopulation = async () => {
    await seedAddressData();
    setShowPrepopulation(false);
  };

  // Show prepopulation consent flow
  if (showPrepopulation) {
    return (
      <PrepopulationConsent
        postcode={form.postcode}
        onAccept={handlePrepopulationAccept}
        onSkip={handleSkipPrepopulation}
      />
    );
  }

  if (isCompleted) {
    const sectionDataForSummary = sections.map(s => ({
      sectionKey: s.sectionKey,
      data: s.data as Record<string, unknown>,
    }));
    const address = (() => {
      const propData = sections.find(s => s.sectionKey === 'property_details')?.data as Record<string, unknown> | undefined;
      return [propData?.address_line1, propData?.city, propData?.postcode].filter(Boolean).join(', ');
    })();
    const seller = (sections.find(s => s.sectionKey === 'seller_details')?.data as Record<string, unknown> | undefined)?.seller_full_name as string || '';

    return (
      <CompletionSummary
        companyName={companyName}
        sections={sectionDataForSummary}
        propertyAddress={address}
        sellerName={seller}
      />
    );
  }

  // Section navigation overlay
  if (showSectionNav) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sections</h2>
          <button
            onClick={() => setShowSectionNav(false)}
            className="rounded-lg p-2 active:bg-gray-100 dark:active:bg-gray-800 text-gray-900 dark:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-1 pb-8">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Part A - Material Facts</p>
          {BASPI_SECTIONS.map((sectionDef, index) => {
            const section = sections.find(s => s.sectionKey === sectionDef.key);
            const sectionStatus = section?.status || 'NOT_STARTED';
            const isActive = currentStep === index;
            const data = (section?.data as Record<string, unknown>) || {};
            const missingCount = sectionDef.fields.filter(f => {
              if (!f.required) return false;
              if (f.showWhen && data[f.showWhen.field] !== f.showWhen.value) return false;
              const val = data[f.key];
              return val === undefined || val === null || val === '';
            }).length;

            if (sectionDef.part === 'B' && BASPI_SECTIONS[index - 1]?.part === 'A') {
              return (
                <div key={`b-${index}`}>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mt-4 mb-2">Part B - Legal & Conveyancing</p>
                  <SectionNavItem
                    title={sectionDef.title}
                    status={sectionStatus}
                    isActive={isActive}
                    index={index}
                    missingCount={missingCount}
                    onClick={() => goToSection(index)}
                  />
                </div>
              );
            }

            return (
              <SectionNavItem
                key={sectionDef.key}
                title={sectionDef.title}
                status={sectionStatus}
                isActive={isActive}
                index={index}
                missingCount={missingCount}
                onClick={() => goToSection(index)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-gray-900">
      {/* Compact header */}
      <header className="sticky top-0 z-30 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
              {progressPercent}% · ~{Math.max(1, Math.ceil((totalFields - answeredFields) * 0.1))} min left
            </span>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} compact />
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={() => setShowSectionNav(true)}
              className="flex items-center gap-1 text-sm active:text-blue-600"
            >
              <span className="font-medium text-gray-900 dark:text-white">{currentSectionDef?.title}</span>
              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {currentFieldIndex + 1}/{visibleFields.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main content - single question */}
      <main ref={contentRef} className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg">
          {currentField && (
            <QuestionField
              key={currentField.key}
              field={currentField}
              value={sectionData[currentField.key]}
              onChange={handleFieldChange}
              allValues={sectionData}
              autoAdvance={
                (currentField.type === 'boolean' || currentField.type === 'select') && !isLastField
                  ? goToNextField
                  : undefined
              }
            />
          )}

          {validationError && (
            <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {validationError}
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom nav */}
      <footer className="sticky bottom-0 border-t dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            onClick={goToPrevField}
            disabled={isFirstField}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-600 p-3 text-gray-600 dark:text-gray-300 transition-colors active:bg-gray-50 dark:active:bg-gray-800 disabled:opacity-30"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {isLastField && isLastSection ? (
            <button
              onClick={handleComplete}
              className="flex-1 rounded-xl bg-green-600 py-3.5 text-base font-semibold text-white shadow-sm transition-colors active:bg-green-700"
            >
              Submit Form
            </button>
          ) : (
            <button
              onClick={goToNextField}
              className="flex-1 rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm transition-colors active:bg-blue-700"
            >
              {isLastField ? 'Next Section' : 'Next'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function SectionNavItem({
  title,
  status,
  isActive,
  index,
  missingCount,
  onClick,
}: {
  title: string;
  status: string;
  isActive: boolean;
  index: number;
  missingCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98] ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200' : 'active:bg-gray-50 dark:active:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          status === 'COMPLETED'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
            : status === 'IN_PROGRESS'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
              : isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
      >
        {status === 'COMPLETED' ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          index + 1
        )}
      </span>
      <span className={`flex-1 text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{title}</span>
      {missingCount > 0 && (
        <span className="shrink-0 rounded-full bg-red-100 dark:bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          {missingCount} left
        </span>
      )}
    </button>
  );
}
