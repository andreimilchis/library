import { AppShell } from "@/components/layout/app-shell";

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
