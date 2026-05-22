'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (msg: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [manual, setManual] = useState('');
  const [cameraDenied, setCameraDenied] = useState(false);
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const id = 'qr-reader';
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          onScan(decoded);
          scanner.stop().catch(() => {});
        },
        () => {}
      )
      .then(() => {
        startedRef.current = true;
        setStarting(false);
      })
      .catch(() => {
        setCameraDenied(true);
        setStarting(false);
        onError?.('Camera access denied. Enter code manually.');
      });

    return () => {
      if (startedRef.current) {
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan, onError]);

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
