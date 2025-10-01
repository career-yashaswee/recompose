"use client";

import { Toaster } from "sonner";
import dynamic from "next/dynamic";
import "@/i18n/config";
import { ThemeProvider } from "next-themes";

const NetworkWatcher = dynamic(() => import("./network-watcher"), {
  ssr: false,
});

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({
  children,
}: ProvidersProps): React.ReactElement {
  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />
      <NetworkWatcher />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </>
  );
}
