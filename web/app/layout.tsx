import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import versionInfo from "../version.json";

export const metadata: Metadata = {
  title: `${versionInfo.name} — Unix Style Request`,
  description: "Axios with a Unix vocabulary. HTTP client for JavaScript and Python.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="night" className="h-full">
      <body className="min-h-full flex flex-col font-mono text-[var(--theme-fg)] bg-[var(--theme-bg)] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
