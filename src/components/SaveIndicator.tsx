'use client';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: string | null;
  compact?: boolean;
}

export default function SaveIndicator({ status, lastSaved, compact }: SaveIndicatorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {status === 'saving' && (
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
        )}
        {status === 'saved' && (
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
        )}
        {status === 'error' && (
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
          <span className="text-yellow-600">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          <span className="text-green-600">Saved</span>
          {lastSaved && (
            <span className="text-gray-400">
              {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </>
      )}
      {status === 'error' && (
        <>
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
          <span className="text-red-600">Save failed — will retry</span>
        </>
      )}
      {status === 'idle' && (
        <span className="text-gray-400">Auto-save enabled</span>
      )}
    </div>
  );
}
