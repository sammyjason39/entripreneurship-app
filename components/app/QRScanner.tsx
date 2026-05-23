'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (msg: string) => void;
}

async function safeStopScanner(scanner: Html5Qrcode | null) {
  if (!scanner) return;
  try {
    await scanner.stop();
  } catch {
    // html5-qrcode throws if stop() called when not scanning — ignore
  }
  try {
    scanner.clear();
  } catch {
    // ignore clear errors when element already removed
  }
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [manual, setManual] = useState('');
  const [cameraDenied, setCameraDenied] = useState(false);
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const handledRef = useRef(false);
  const mountedRef = useRef(true);

  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    mountedRef.current = true;
    handledRef.current = false;
    const id = 'qr-reader';
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          if (handledRef.current || !mountedRef.current) return;
          handledRef.current = true;
          void (async () => {
            await safeStopScanner(scanner);
            if (mountedRef.current) {
              onScanRef.current(decoded);
            }
          })();
        },
        () => {}
      )
      .then(() => {
        if (mountedRef.current) setStarting(false);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setCameraDenied(true);
        setStarting(false);
        onErrorRef.current?.('Camera access denied. Enter code manually.');
      });

    return () => {
      mountedRef.current = false;
      void safeStopScanner(scannerRef.current);
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4">
      {!cameraDenied && (
        <div className="overflow-hidden rounded-card border border-border">
          <div id="qr-reader" className="w-full" />
          {starting && (
            <p className="animate-blink py-4 text-center font-display text-xs">LOADING...</p>
          )}
        </div>
      )}
      {cameraDenied && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Camera unavailable. Paste QR token:</p>
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Paste token or JSON"
          />
          <Button className="w-full" onClick={() => manual && onScan(manual)}>
            Submit Code
          </Button>
        </div>
      )}
    </div>
  );
}
