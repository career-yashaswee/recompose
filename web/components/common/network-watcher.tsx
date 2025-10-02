'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNetworkState } from '@uidotdev/usehooks';

export default function NetworkWatcher(): React.ReactElement | null {
  const network = useNetworkState();
  const previousOnlineState = useRef<boolean | null>(null);
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Skip the first render to avoid showing toast on page load
    if (!isInitialized.current) {
      isInitialized.current = true;
      previousOnlineState.current = network.online;
      return;
    }

    // Only show toast if the online state actually changed
    if (
      previousOnlineState.current !== null &&
      previousOnlineState.current !== network.online
    ) {
      if (network.online === true) {
        const details = buildOnlineDetails(network);
        toast.success('Back online', {
          description: details,
          duration: 3500,
        });
      } else if (network.online === false) {
        toast.error('You are offline', {
          description:
            'Some features may not work until connection is restored.',
          duration: 5000,
        });
      }
    }

    // Update the previous state
    previousOnlineState.current = network.online;
  }, [network]);

  return null;
}

function buildOnlineDetails(
  network: ReturnType<typeof useNetworkState>
): string {
  const parts: string[] = [];
  if (typeof network.effectiveType === 'string')
    parts.push(`Type: ${network.effectiveType}`);
  if (typeof network.downlink === 'number')
    parts.push(`Downlink: ${network.downlink} Mbps`);
  if (typeof network.rtt === 'number') parts.push(`RTT: ${network.rtt} ms`);
  if (typeof network.saveData === 'boolean' && network.saveData)
    parts.push('Data Saver: On');
  if (typeof network.type === 'string') parts.push(`Conn: ${network.type}`);
  return parts.length ? parts.join(' • ') : 'Connection restored';
}
