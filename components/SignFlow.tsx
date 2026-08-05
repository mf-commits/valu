"use client";

import { useMemo, useRef, useState } from "react";
import SignatureCanvas, {
  SignatureCanvasHandle,
} from "@/components/SignatureCanvas";
import WelcomeLetter from "@/components/WelcomeLetter";
import MandateSummary from "@/components/MandateSummary";
import {
  getContractText,
  BillingType,
  ContractLang,
  ContractLine,
} from "@/lib/contractContent";
import type { LetterBlock } from "@/lib/welcomeLetter";
import { t } from "@/lib/uiStrings";

type Step = "bienvenue" | "lecture" | "signature" | "succes";

export type SignFlowContract = {
  id: string;
  lang: ContractLang;
  clientNom: string;
  clientEmail?: string;
  clientEntreprise?: string;
  lines: ContractLine[];
  montant: string;
  billingType: BillingType;
  dureeMois?: number;
  delaisPaiement: string;
};

export type SignFlowWelcome = {
  entrepriseNom: string;
  introVideoUrl: string;
  blocks: LetterBlock[];
  signoff: string;
};

export default function SignFlow({
  contract,
  welcome,
}: {
  contract: SignFlowContract;
  welcome: SignFlowWelcome;
}) {
  const s = t(contract.lang);

  const INITIAL_CHECKPOINTS = [
    { key: "prix", label: s.lecture.checkpoints.prix },
    { key: "resiliation", label: s.lecture.checkpoints.resiliation },
    { key: "responsabilite", label: s.lecture.checkpoints.responsabilite },
  ] as const;

  const contractText = useMemo(
    () =>
      getContractText({
        lang: contract.lang,
        clientNom: contract.clientNom,
        clientEntreprise: contract.clientEntreprise,
        lines: contract.lines,
        montant: contract.montant,
        billingType: contract.billingType,
        dureeMois: contract.dureeMois,
        delaisPaiement: contract.delaisPaiement,
      }),
    [contract]
  );
  const sigRef = useRef<SignatureCanvasHandle>(null);
  const initialsRefs = useRef<Record<string, SignatureCanvasHandle | null>>({});
  // Les canevas d'initiales sont démontés dès qu'on quitte l'étape "lecture" —
  // on capture donc leurs dataUrl ici, avant le démontage, plutôt que d'aller
  // relire les refs (devenues nulles) au moment de la signature.
  const capturedInitials = useRef<Record<string, string>>({});

  const [step, setStep] = useState<Step>("bienvenue");
  const [accepted, setAccepted] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [initialsFilled, setInitialsFilled] = useState<Record<string, boolean>>(
    {}
  );
  const [signerName, setSignerName] = useState(contract.clientNom);
  const [signerEmail, setSignerEmail] = useState(contract.clientEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const allInitialsFilled = INITIAL_CHECKPOINTS.every(
    (c) => initialsFilled[c.key]
  );

  async function handleSubmit() {
    setError(null);

    if (!signerName.trim()) {
      setError(s.signature.errorMissingName);
      return;
    }
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError(s.signature.errorEmptySignature);
      return;
    }

    setLoading(true);
    try {
      const signatureDataUrl = sigRef.current.toDataUrl();
      const initials = INITIAL_CHECKPOINTS.map((c) => ({
        key: c.key,
        label: c.label,
        dataUrl: capturedInitials.current[c.key] || "",
      }));

      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          signerName,
          signerEmail,
          signatureDataUrl,
          initials,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || s.signature.errorGeneric);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStep("succes");

      const a = document.createElement("a");
      a.href = url;
      a.download = "contrat-signe.pdf";
      a.click();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : s.signature.errorGeneric;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "bienvenue", label: s.steps.bienvenue },
    { key: "lecture", label: s.steps.lecture },
    { key: "signature", label: s.steps.signature },
    { key: "succes", label: s.steps.succes },
  ];
  const currentIndex = steps.findIndex((step_) => step_.key === step);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10 sm:py-16">
      {step !== "bienvenue" && (
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {s.header.eyebrow}
          </p>
          <h1 className="font-title mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {s.header.title}
          </h1>
          <p className="mt-3 text-slate-500">{s.header.subtitle}</p>
        </header>
      )}

      <ol className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
        {steps.map((stepItem, i) => (
          <li key={stepItem.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                i <= currentIndex
                  ? "bg-brand-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === stepItem.key ? "text-slate-700" : ""}>
              {stepItem.label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-slate-300" />
            )}
          </li>
        ))}
      </ol>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
        {step === "bienvenue" && (
          <div className="flex flex-col gap-6">
            <WelcomeLetter
              lang={contract.lang}
              entrepriseNom={welcome.entrepriseNom}
              introVideoUrl={welcome.introVideoUrl}
              blocks={welcome.blocks}
              signoff={welcome.signoff}
            />
            <button
              type="button"
              onClick={() => setStep("lecture")}
              className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
            >
              {s.welcome.continueButton}
            </button>
          </div>
        )}

        {step === "lecture" && (
          <>
            <button
              type="button"
              onClick={() => setStep("bienvenue")}
              className="mb-4 text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline"
            >
              {s.lecture.back}
            </button>
            <MandateSummary
              clientNom={contract.clientNom}
              clientEntreprise={contract.clientEntreprise}
              lines={contract.lines}
              delaisPaiement={contract.delaisPaiement}
              billingType={contract.billingType}
              dureeMois={contract.dureeMois}
              lang={contract.lang}
            />

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              {s.lecture.contractHeading}
            </p>
            <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {contractText}
            </div>

            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-700">
                {s.lecture.initialsPrompt}
              </p>
              {INITIAL_CHECKPOINTS.map((c) => (
                <div
                  key={c.key}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-xs font-medium text-slate-600 sm:max-w-[55%]">
                    {c.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <SignatureCanvas
                      compact
                      ariaLabel={c.label}
                      ref={(handle) => {
                        initialsRefs.current[c.key] = handle;
                      }}
                      onChange={(empty) =>
                        setInitialsFilled((prev) => ({
                          ...prev,
                          [c.key]: !empty,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        initialsRefs.current[c.key]?.clear();
                        setInitialsFilled((prev) => ({ ...prev, [c.key]: false }));
                      }}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      {s.lecture.erase}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={accepted}
                disabled={!allInitialsFilled}
                onChange={(e) => {
                  setAccepted(e.target.checked);
                  if (e.target.checked) {
                    INITIAL_CHECKPOINTS.forEach((c) => {
                      capturedInitials.current[c.key] =
                        initialsRefs.current[c.key]?.toDataUrl() || "";
                    });
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
              />
              {s.lecture.acceptLabel}
            </label>
            {!allInitialsFilled && (
              <p className="mt-1 text-xs text-slate-400">
                {s.lecture.initialsRequired}
              </p>
            )}
            {accepted && allInitialsFilled && (
              <button
                type="button"
                onClick={() => setStep("signature")}
                className="mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
              >
                {s.lecture.continueButton}
              </button>
            )}
          </>
        )}

        {step === "signature" && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setStep("lecture")}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline"
            >
              {s.signature.back}
            </button>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {s.signature.fullName}
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder={s.signature.fullNamePlaceholder}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {s.signature.email}
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder={s.signature.emailPlaceholder}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  {s.signature.signHere}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    sigRef.current?.clear();
                    setSignatureEmpty(true);
                  }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  {s.signature.erase}
                </button>
              </div>
              <SignatureCanvas
                ref={sigRef}
                onChange={(empty) => setSignatureEmpty(empty)}
              />
              {signatureEmpty && (
                <p className="mt-1 text-xs text-slate-400">{s.signature.emptyHint}</p>
              )}
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? s.signature.submitLoading : s.signature.submitIdle}
            </button>

            <p className="text-center text-xs text-slate-400">{s.signature.ipNotice}</p>
          </div>
        )}

        {step === "succes" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </div>
            <h2 className="font-title text-xl font-semibold">{s.success.title}</h2>
            <p className="max-w-sm text-sm text-slate-500">{s.success.body}</p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="contrat-signe.pdf"
                className="mt-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                {s.success.redownload}
              </a>
            )}
          </div>
        )}
      </section>

      <footer className="text-center text-xs text-slate-400">{s.footer}</footer>
    </main>
  );
}
