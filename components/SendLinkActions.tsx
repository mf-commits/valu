"use client";

import { useState } from "react";
import { companyConfig } from "@/lib/companyConfig";

type Props = {
  path: string;
  clientNom: string;
  clientEmail?: string;
};

export default function SendLinkActions({ path, clientNom, clientEmail }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function buildMailtoHref() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${path}`;
    const subject = `Votre contrat ${companyConfig.entrepriseNom} — signature en ligne`;
    const body = [
      `Bonjour ${clientNom},`,
      "",
      `Voici le lien pour lire et signer votre contrat de services avec ${companyConfig.entrepriseNom} :`,
      url,
      "",
      "Au plaisir,",
      companyConfig.founderName,
    ].join("\n");
    const params = new URLSearchParams({ subject, body });
    return `mailto:${clientEmail || ""}?${params.toString().replace(/\+/g, "%20")}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        {copied ? "Lien copié !" : "Copier le lien"}
      </button>
      <a
        href={buildMailtoHref()}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Envoyer par courriel
      </a>
    </div>
  );
}
