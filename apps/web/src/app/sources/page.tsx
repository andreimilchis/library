import { SOURCE_CONFIGS, type SourceType } from '@eye1/common';

export default function SourcesPage() {
  const sources = Object.values(SOURCE_CONFIGS);
  const mvpSources = sources.filter((s) => s.mvpSupported);
  const futureSources = sources.filter((s) => !s.mvpSupported);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sources & Integrations</h2>
        <p className="text-[var(--muted-foreground)]">
          Conectează platformele tale pentru a alimenta eye1.ai cu date.
        </p>
      </div>

      {/* MVP Sources */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Available Now</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mvpSources.map((source) => (
            <SourceCard key={source.sourceType} source={source} available />
          ))}
        </div>
      </div>

      {/* Future Sources */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Coming in Phase 2</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {futureSources.map((source) => (
            <SourceCard key={source.sourceType} source={source} available={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceCard({
  source,
  available,
}: {
  source: (typeof SOURCE_CONFIGS)[SourceType];
  available: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-[var(--card)] p-4 ${
        available ? 'border-[var(--border)]' : 'border-[var(--border)] opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{source.displayName}</h4>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            available
              ? 'bg-green-900/50 text-green-400'
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          {available ? 'Available' : 'Phase 2'}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{source.description}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <span>Auth: {source.authType}</span>
        <span>|</span>
        <span>Modes: {source.supportedSyncModes.join(', ')}</span>
      </div>
      {available && (
        <button className="mt-4 w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent)]/90 transition-colors">
          Connect
        </button>
      )}
    </div>
  );
}
