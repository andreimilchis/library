import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'eye1.ai — Personal Intelligence System',
  description: 'Your personal operating system for data, insight, and execution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold tracking-tight">
                eye1<span className="text-[var(--accent)]">.ai</span>
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">Personal Intelligence System</p>
            </div>
            <nav className="space-y-1">
              {[
                { name: 'Command Center', href: '/' },
                { name: 'Feed', href: '/feed' },
                { name: 'Daily Brief', href: '/brief' },
                { name: 'Health', href: '/health' },
                { name: 'Finance', href: '/finance' },
                { name: 'Search', href: '/search' },
                { name: 'Sources', href: '/sources' },
                { name: 'Agents', href: '/agents' },
                { name: 'Settings', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
