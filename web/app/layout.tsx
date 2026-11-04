import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { AppShell } from "../components/AppShell";
import versionInfo from "../version.json";

export const metadata: Metadata = {
  title: `${versionInfo.name} — Unix Style Request`,
  description: "Axios with a Unix vocabulary. HTTP client for JavaScript and Python.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="night" className="h-full">
      <body className="min-h-full flex flex-col font-mono text-[var(--theme-fg)] bg-[var(--theme-bg)] antialiased">
        <NextTopLoader
          color="var(--theme-green, #22c55e)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--theme-green), 0 0 5px var(--theme-green)"
          zIndex={99999}
          showForHashAnchor={true}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
