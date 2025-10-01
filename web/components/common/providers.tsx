"use client";

import { Toaster } from "sonner";
import NetworkWatcher from "./network-watcher";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps): React.ReactElement {
  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />
      <NetworkWatcher />
      {children}
    </>
  );
}


