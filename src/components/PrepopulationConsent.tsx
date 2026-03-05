'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PrepopulationConsentProps {
  postcode: string;
  address: string;
  onAccept: (prepopulated: Record<string, Record<string, unknown>>) => void;
  onSkip: () => void;
}

interface AutocompleteResult {
  addresses: string[];
  highlights: string[];
  session: string;
}

type Stage = 'search' | 'loading' | 'found-data' | 'error';

export default function PrepopulationConsent({ postcode, address, onAccept, onSkip }: PrepopulationConsentProps) {
  const [stage, setStage] = useState<Stage>('search');
  const [addressQuery, setAddressQuery] = useState(address || '');
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult | null>(null);
  const [autocompleteSession, setAutocompleteSession] = useState<string | undefined>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fieldCount, setFieldCount] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [prepopulated, setPrepopulated] = useState<Record<string, Record<string, unknown>>>({});
  const [error, setError] = useState('');
  const [totalFields] = useState(150);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  const searchAddress = useCallback(async (query: string, session?: string) => {
    if (query.length < 3) {
      setAutocompleteResults(null);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({ query });
      if (session) params.set('session', session);
      const res = await fetch(`/api/chimnie/address?${params}`);
      if (res.ok) {
        const data: AutocompleteResult = await res.json();
        setAutocompleteResults(data);
        setAutocompleteSession(data.session);
        setShowDropdown(true);
      }
    } catch {
      // Silently fail
    }
    setIsSearching(false);
  }, []);

  const handleAddressInput = (value: string) => {
    setAddressQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(value, autocompleteSession);
    }, 300);
  };

  const selectAddress = async (selectedAddress: string) => {
    setShowDropdown(false);
    setAddressQuery(selectedAddress);
    setStage('loading');

    try {
      const params = new URLSearchParams({ address: selectedAddress });
      if (autocompleteSession) params.set('session', autocompleteSession);
      const res = await fetch(`/api/chimnie/property?${params}`);
      if (!res.ok) throw new Error('Property lookup failed');
      const data = await res.json();

      if (data.notFound) {
        onSkip();
        return;
      }

      if (data.fieldCount > 0) {
        setFieldCount(data.fieldCount);
        setTimeSaved(data.timeSaved);
        setPrepopulated(data.prepopulated);
        setStage('found-data');
      } else {
        onSkip();
      }
    } catch {
      setError('Could not fetch property data');
      setStage('error');
    }
  };

  // Also try postcode search as an alternative
  const searchByPostcode = async () => {
    if (!postcode) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/chimnie/address?postcode=${encodeURIComponent(postcode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.addresses?.length > 0) {
          setAutocompleteResults({
            addresses: data.addresses,
            highlights: data.addresses, // No highlights for postcode search
            session: data.session,
          });
          setAutocompleteSession(data.session);
          setShowDropdown(true);
        }
      }
    } catch {
      // Silently fail
    }
    setIsSearching(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (stage === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Looking up your property...</p>
        </div>
      </div>
    );
  }

  if (stage === 'search') {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-gray-900 p-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Find your property</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search for your address and we&apos;ll pre-fill what we can.
            </p>
          </div>

          <div ref={dropdownRef} className="relative mb-4">
            <div className="relative">
              <input
                value={addressQuery}
                onChange={e => handleAddressInput(e.target.value)}
                onFocus={() => {
                  if (autocompleteResults && autocompleteResults.addresses.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white dark:bg-gray-800"
                placeholder="Start typing your address..."
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                </div>
              )}
            </div>

            {showDropdown && autocompleteResults && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
                {autocompleteResults.addresses.map((addr, i) => (
                  <button
                    key={i}
                    onClick={() => selectAddress(addr)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b dark:border-gray-700 last:border-b-0"
                  >
                    {autocompleteResults.highlights[i] || addr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {postcode && (
            <button
              onClick={searchByPostcode}
              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 py-2 active:text-blue-700 mb-2"
            >
              Or search by postcode ({postcode})
            </button>
          )}

          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 py-2 active:text-gray-700"
          >
            Skip — I&apos;ll fill in everything myself
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'found-data') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="mx-auto w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              We found info about your property!
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">{fieldCount}</strong> of ~{totalFields} questions
              could be pre-filled for you. This will save you about <strong className="text-gray-900 dark:text-white">{timeSaved} min</strong>.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-700 p-4 mb-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Data we found includes:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(prepopulated).map(sectionKey => (
                <span key={sectionKey} className="rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  {sectionKey.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 mb-5">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> You will be liable for the accuracy of all answers.
              Please review and correct any pre-filled answers as you go through the form.
            </p>
          </div>

          <button
            onClick={() => onAccept(prepopulated)}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm transition-colors active:bg-blue-700 mb-3"
          >
            Yes, pre-fill my form
          </button>

          <button
            onClick={onSkip}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 py-2 active:text-gray-700"
          >
            No thanks, I&apos;ll fill it in myself
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'Something went wrong'}</p>
        <button
          onClick={onSkip}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white active:bg-blue-700"
        >
          Continue without pre-filling
        </button>
      </div>
    </div>
  );
}
