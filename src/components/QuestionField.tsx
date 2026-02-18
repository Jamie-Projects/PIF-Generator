'use client';

import { useState } from 'react';
import { FormField } from '@/lib/baspiSchema';

interface QuestionFieldProps {
  field: FormField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  allValues: Record<string, unknown>;
  autoAdvance?: () => void;
}

export default function QuestionField({ field, value, onChange, allValues, autoAdvance }: QuestionFieldProps) {
  const [showHelp, setShowHelp] = useState(false);

  // Check showWhen condition
  if (field.showWhen) {
    const parentValue = allValues[field.showWhen.field];
    if (parentValue !== field.showWhen.value) {
      return null;
    }
  }

  const inputClass =
    'w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-4 text-base text-gray-900 dark:text-white transition-colors focus:border-blue-500 focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500';

  const getInputType = () => {
    if (field.key.includes('email')) return 'email';
    if (field.key.includes('phone')) return 'tel';
    return 'text';
  };

  const getInputMode = (): 'email' | 'tel' | 'numeric' | 'text' | undefined => {
    if (field.key.includes('email')) return 'email';
    if (field.key.includes('phone')) return 'tel';
    if (field.type === 'number') return 'numeric';
    return undefined;
  };

  return (
    <div className="py-2">
      <label htmlFor={field.key} className="block text-base font-semibold text-gray-900 dark:text-white mb-1">
        {field.label}
        {field.required && <span className="ml-1 text-red-400">*</span>}
      </label>

      {field.helpText && (
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="mb-2 flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 active:text-blue-700"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showHelp ? 'Hide help' : 'What does this mean?'}
        </button>
      )}

      {showHelp && field.helpText && (
        <p className="mb-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
          {field.helpText}
        </p>
      )}

      {field.type === 'text' && (
        <input
          id={field.key}
          type={getInputType()}
          inputMode={getInputMode()}
          autoComplete={field.key.includes('email') ? 'email' : field.key.includes('phone') ? 'tel' : field.key.includes('postcode') ? 'postal-code' : undefined}
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClass}
        />
      )}

      {field.type === 'number' && field.quickPick ? (
        <div className="mt-1">
          <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-2">
            {field.quickPick.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  onChange(field.key, num);
                  if (autoAdvance) setTimeout(autoAdvance, 300);
                }}
                className={`rounded-xl border-2 py-3.5 text-center text-base font-semibold transition-all active:scale-[0.98] sm:px-6 ${
                  value === num
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:border-gray-300'
                }`}
              >
                {num === field.quickPick![field.quickPick!.length - 1] ? `${num}+` : num}
              </button>
            ))}
          </div>
          {value === field.quickPick[field.quickPick.length - 1] && (
            <input
              id={field.key}
              type="number"
              inputMode="numeric"
              value={(value as unknown as string) || ''}
              placeholder="Enter exact number"
              onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : '')}
              className={inputClass + ' mt-2'}
            />
          )}
        </div>
      ) : field.type === 'number' ? (
        <input
          id={field.key}
          type="number"
          inputMode="numeric"
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : '')}
          className={inputClass}
        />
      ) : null}

      {field.type === 'textarea' && (
        <textarea
          id={field.key}
          value={(value as string) || ''}
          placeholder={field.placeholder || 'Type your answer here...'}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={3}
          className={inputClass + ' resize-y'}
        />
      )}

      {field.type === 'date' && (
        <input
          id={field.key}
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={inputClass}
        />
      )}

      {field.type === 'select' && (
        <div className="grid gap-2 mt-1">
          {field.options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(field.key, opt.value);
                if (autoAdvance) setTimeout(autoAdvance, 300);
              }}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition-all active:scale-[0.98] ${
                value === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:border-gray-300 active:bg-gray-50 dark:active:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {field.type === 'boolean' && (
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            onClick={() => {
              onChange(field.key, true);
              if (autoAdvance) setTimeout(autoAdvance, 300);
            }}
            className={`rounded-xl border-2 px-4 py-4 text-base font-semibold transition-all active:scale-[0.98] ${
              value === true
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(field.key, false);
              if (autoAdvance) setTimeout(autoAdvance, 300);
            }}
            className={`rounded-xl border-2 px-4 py-4 text-base font-semibold transition-all active:scale-[0.98] ${
              value === false
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:border-gray-300'
            }`}
          >
            No
          </button>
        </div>
      )}

      {field.type === 'signature' && (
        <div className="mt-1 space-y-4">
          <input
            id={field.key}
            type="text"
            value={(value as string) || ''}
            placeholder="Type your full legal name"
            onChange={(e) => onChange(field.key, e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
          {(value as string)?.trim() && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-6 text-center">
              <div
                className="text-3xl text-gray-900 dark:text-white leading-relaxed"
                style={{ fontFamily: "'Dancing Script', 'Segoe Script', 'Apple Chancery', cursive" }}
              >
                {(value as string).trim()}
              </div>
              <div className="mt-2 mx-auto w-48 border-t-2 border-gray-300 dark:border-gray-500" />
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Electronic Signature</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
