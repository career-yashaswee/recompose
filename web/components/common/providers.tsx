"use client";

import { Toaster } from "sonner";
import dynamic from "next/dynamic";
import "@/i18n/config";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/context/notification-context";

const NetworkWatcher = dynamic(() => import("./network-watcher"), {
  ssr: false,
});

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({
  children,
}: ProvidersProps): React.ReactElement {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1m
        gcTime: 1000 * 60 * 5, // 5m
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />
      <NetworkWatcher />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
