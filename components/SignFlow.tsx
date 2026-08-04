"use client";

import { useMemo, useRef, useState } from "react";
import SignatureCanvas, {
  SignatureCanvasHandle,
} from "@/components/SignatureCanvas";
import WelcomeLetter from "@/components/WelcomeLetter";
import MandateSummary from "@/components/MandateSummary";
import { getContractText, BillingType, ContractLine } from "@/lib/contractContent";
import type { LetterBlock } from "@/lib/welcomeLetter";

type Step = "bienvenue" | "lecture" | "signature" | "succes";

const INITIAL_CHECKPOINTS = [
  { key: "prix", label: "Prix et modalités de paiement (article 3)" },
  { key: "resiliation", label: "Politique de résiliation (article 6)" },
  { key: "responsabilite", label: "Limitation de responsabilité (article 9)" },
] as const;

export type SignFlowContract = {
  id: string;
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
  const contractText = useMemo(
    () =>
      getContractText({
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
      setError("Merci d'indiquer ton nom complet.");
      return;
    }
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("La signature est vide. Dessine ta signature avant de continuer.");
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
        throw new Error(data.error || "Une erreur est survenue.");
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
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: "bienvenue", label: "Bienvenue" },
    { key: "lecture", label: "Lecture" },
    { key: "signature", label: "Signature" },
    { key: "succes", label: "Confirmation" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10 sm:py-16">
      {step !== "bienvenue" && (
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            Signature électronique
          </p>
          <h1 className="font-title mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Signez votre contrat en ligne
          </h1>
          <p className="mt-3 text-slate-500">
            Lisez le contrat, apposez vos initiales et votre signature, recevez
            votre copie signée en PDF.
          </p>
        </header>
      )}

      <ol className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                i <= currentIndex
                  ? "bg-brand-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s.key ? "text-slate-700" : ""}>
              {s.label}
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
              Continuer vers le contrat
            </button>
          </div>
        )}

        {step === "lecture" && (
          <>
            <MandateSummary
              clientNom={contract.clientNom}
              clientEntreprise={contract.clientEntreprise}
              lines={contract.lines}
              delaisPaiement={contract.delaisPaiement}
              billingType={contract.billingType}
              dureeMois={contract.dureeMois}
            />

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              Contrat de prestation de services
            </p>
            <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {contractText}
            </div>

            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-700">
                Merci de parapher les éléments suivants pour confirmer votre
                lecture :
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
                      ariaLabel={`Initiales — ${c.label}`}
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
                      Effacer
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
                    setStep("signature");
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
              />
              J&apos;ai lu et je comprends l&apos;ensemble des termes du contrat
              ci-dessus, et j&apos;accepte d&apos;y être lié(e).
            </label>
            {!allInitialsFilled && (
              <p className="mt-1 text-xs text-slate-400">
                Les trois paraphes ci-dessus sont requis avant l&apos;acceptation.
              </p>
            )}
          </>
        )}

        {step === "signature" && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Courriel (optionnel)
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Signez ici (souris ou doigt) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    sigRef.current?.clear();
                    setSignatureEmpty(true);
                  }}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Effacer
                </button>
              </div>
              <SignatureCanvas
                ref={sigRef}
                onChange={(empty) => setSignatureEmpty(empty)}
              />
              {signatureEmpty && (
                <p className="mt-1 text-xs text-slate-400">
                  Dessine ta signature dans la zone ci-dessus.
                </p>
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
              {loading ? "Signature en cours…" : "Signer et télécharger le PDF"}
            </button>

            <p className="text-center text-xs text-slate-400">
              La date, l&apos;heure et l&apos;adresse IP seront enregistrées dans un
              certificat de traçabilité joint au PDF.
            </p>
          </div>
        )}

        {step === "succes" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </div>
            <h2 className="font-title text-xl font-semibold">Contrat signé avec succès</h2>
            <p className="max-w-sm text-sm text-slate-500">
              Le PDF signé, incluant le certificat de traçabilité, a été téléchargé
              automatiquement.
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download="contrat-signe.pdf"
                className="mt-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Retélécharger le PDF
              </a>
            )}
          </div>
        )}
      </section>

      <footer className="text-center text-xs text-slate-400">
        Signature électronique conforme à la Loi concernant le cadre juridique des
        technologies de l&apos;information (RLRQ, c. C-1.1).
      </footer>
    </main>
  );
}
