export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Command Center</h2>
        <p className="text-[var(--muted-foreground)]">
          Bine ai venit. Iată o privire de ansamblu asupra stării tale curente.
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard title="Health" value="—" subtitle="No data yet" status="neutral" />
        <StatusCard title="Coding" value="—" subtitle="Connect GitHub" status="neutral" />
        <StatusCard title="Finance" value="—" subtitle="Phase 2" status="neutral" />
        <StatusCard title="Insights" value="0" subtitle="No insights yet" status="neutral" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="mb-4 text-lg font-semibold">Getting Started</h3>
        <div className="space-y-3">
          <ActionItem
            step="1"
            title="Connect your first source"
            description="Start with GitHub to see your coding activity and project data."
            href="/sources"
          />
          <ActionItem
            step="2"
            title="Connect WHOOP"
            description="Add health data for cross-domain insights."
            href="/sources"
          />
          <ActionItem
            step="3"
            title="Connect Notion"
            description="Add your knowledge base for semantic search."
            href="/sources"
          />
        </div>
      </div>

      {/* Recent Insights */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Insights</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Connect sources to start generating insights about your patterns and performance.
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  subtitle,
  status,
}: {
  title: string;
  value: string;
  subtitle: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
}) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    bad: 'text-red-400',
    neutral: 'text-[var(--muted-foreground)]',
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
      <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>
    </div>
  );
}

function ActionItem({
  step,
  title,
  description,
  href,
}: {
  step: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 rounded-lg p-3 hover:bg-[var(--muted)] transition-colors"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">
        {step}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
    </a>
  );
}
