"use client";

import { useState } from "react";

// Logo réel Services Valu — dépose le fichier choisi (PNG ou JPG) dans
// /public/logo.png. Tant qu'il n'y est pas, on retombe automatiquement sur
// /public/logo.svg (mot-clé "VALU"), puis sur du texte brut en dernier
// recours — jamais d'icône d'image cassée.
export default function Logo({ className = "h-7" }: { className?: string }) {
  const [pngFailed, setPngFailed] = useState(false);
  const [svgFailed, setSvgFailed] = useState(false);

  if (pngFailed && svgFailed) {
    return (
      <span
        className={`font-title inline-block font-semibold tracking-tight text-slate-900 ${className}`}
      >
        Services Valu
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pngFailed ? "/logo.svg" : "/logo.png"}
      alt="Services Valu"
      className={className}
      onError={() => {
        if (!pngFailed) setPngFailed(true);
        else setSvgFailed(true);
      }}
    />
  );
}
