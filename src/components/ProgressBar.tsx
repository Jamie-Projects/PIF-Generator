'use client';

import { BASPI_SECTIONS } from '@/lib/baspiSchema';

interface SectionProgress {
  sectionKey: string;
  status: string;
}

interface ProgressBarProps {
  currentStep: number;
  sections: SectionProgress[];
  onStepClick: (step: number) => void;
}

export default function ProgressBar({ currentStep, sections, onStepClick }: ProgressBarProps) {
  const totalSections = BASPI_SECTIONS.length;
  const completedCount = sections.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <div className="w-full">
      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {completedCount} of {totalSections} sections complete
        </p>
      </div>

      {/* Section navigation */}
      <div className="space-y-1">
        {/* Part A */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2 pb-1">
          Part A — Material Facts
        </p>
        {BASPI_SECTIONS.map((sectionDef, index) => {
          if (sectionDef.part === 'B' && BASPI_SECTIONS[index - 1]?.part === 'A') {
            return (
              <div key={`header-b-${index}`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-3 pb-1">
                  Part B — Legal & Conveyancing
                </p>
                <SectionItem
                  index={index}
                  title={sectionDef.title}
                  status={sections.find(s => s.sectionKey === sectionDef.key)?.status || 'NOT_STARTED'}
                  isActive={currentStep === index}
                  onClick={() => onStepClick(index)}
                />
              </div>
            );
          }
          return (
            <SectionItem
              key={sectionDef.key}
              index={index}
              title={sectionDef.title}
              status={sections.find(s => s.sectionKey === sectionDef.key)?.status || 'NOT_STARTED'}
              isActive={currentStep === index}
              onClick={() => onStepClick(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SectionItem({
  index,
  title,
  status,
  isActive,
  onClick,
}: {
  index: number;
  title: string;
  status: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const statusIcon = status === 'COMPLETED' ? '✓' : status === 'IN_PROGRESS' ? '•' : '';
  const statusColor =
    status === 'COMPLETED'
      ? 'text-green-600 bg-green-50'
      : status === 'IN_PROGRESS'
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-400 bg-gray-50';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-medium shadow-sm'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          isActive ? 'bg-blue-500 text-white' : statusColor
        }`}
      >
        {statusIcon || index + 1}
      </span>
      <span className="truncate">{title}</span>
    </button>
  );
}
