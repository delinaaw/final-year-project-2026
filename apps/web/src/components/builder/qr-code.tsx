"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    void QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#01033e", light: "#ffffff" },
    });

    void QRCode.toDataURL(value, { width: size * 3, margin: 1 }).then(setDataUrl);
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        aria-label="QR code for the respondent link"
        className="rounded-xl border border-line bg-white p-3"
      />
      {dataUrl ? (
        <a
          href={dataUrl}
          download="voiceform-qr.png"
          className="focus-ring rounded text-body-s font-semibold text-content-link"
        >
          Download PNG
        </a>
      ) : null}
    </div>
  );
}
