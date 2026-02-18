'use client';

import { FormField } from '@/lib/baspiSchema';

interface QuestionFieldProps {
  field: FormField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  allValues: Record<string, unknown>;
}

export default function QuestionField({ field, value, onChange, allValues }: QuestionFieldProps) {
  // Check showWhen condition
  if (field.showWhen) {
    const parentValue = allValues[field.showWhen.field];
    if (parentValue !== field.showWhen.value) {
      return null;
    }
  }

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="mb-5">
      <label htmlFor={field.key} className={labelClass}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.helpText && (
        <p className="mb-1.5 text-xs text-gray-500">{field.helpText}</p>
      )}

      {field.type === 'text' && (
        <input
          id={field.key}
          type="text"
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === 'number' && (
        <input
          id={field.key}
          type="number"
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : '')}
          className={baseInputClass}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          id={field.key}
          value={(value as string) || ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={3}
          className={baseInputClass + ' resize-y'}
        />
      )}

      {field.type === 'date' && (
        <input
          id={field.key}
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === 'select' && (
        <select
          id={field.key}
          value={(value as string) || ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={baseInputClass + ' bg-white'}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'boolean' && (
        <div className="flex gap-4 mt-1">
          <button
            type="button"
            onClick={() => onChange(field.key, true)}
            className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
              value === true
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(field.key, false)}
            className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
              value === false
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
