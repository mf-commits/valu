"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SendLinkActions from "@/components/SendLinkActions";
import MandateSummary from "@/components/MandateSummary";
import { servicesCatalog } from "@/lib/servicesCatalog";
import { companyConfig } from "@/lib/companyConfig";
import {
  computeContractTotal,
  computeLineSubtotal,
  formatCurrency,
  type BillingType,
  type ContractLang,
  type ContractLine,
} from "@/lib/contractContent";

export default function NouveauContrat() {
  const [clientNom, setClientNom] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientEntreprise, setClientEntreprise] = useState("");
  const [lines, setLines] = useState<ContractLine[]>([]);
  const [delaisPaiement, setDelaisPaiement] = useState("");
  const [billingType, setBillingType] = useState<BillingType>("unique");
  const [dureeMois, setDureeMois] = useState("");
  const [lang, setLang] = useState<ContractLang>("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const total = useMemo(() => computeContractTotal(lines), [lines]);

  function toggleService(serviceId: string) {
    const service = servicesCatalog.find((s) => s.id === serviceId);
    if (!service) return;
    const exists = lines.some((l) => l.label === service.label);
    if (exists) {
      setLines((prev) => prev.filter((l) => l.label !== service.label));
    } else {
      setLines((prev) => [
        ...prev,
        {
          label: service.label,
          description: service.description,
          quantite: 1,
          heures: 0,
          tauxHoraire: companyConfig.tauxHoraireDefaut,
        },
      ]);
    }
  }

  function updateLine(
    index: number,
    field: keyof ContractLine,
    value: string
  ) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        if (field === "label" || field === "description") {
          return { ...line, [field]: value };
        }
        return { ...line, [field]: value === "" ? undefined : Number(value) };
      })
    );
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function addCustomLine() {
    setLines((prev) => [
      ...prev,
      {
        label: "",
        description: "",
        quantite: 1,
        heures: 0,
        tauxHoraire: companyConfig.tauxHoraireDefaut,
      },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientNom.trim() || lines.length === 0) {
      setError("Nom du client et au moins un service sont requis.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNom,
          clientEmail,
          clientEntreprise,
          lines,
          delaisPaiement,
          billingType,
          dureeMois: dureeMois ? Number(dureeMois) : undefined,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inattendue.");
      setCreatedId(data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  if (createdId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <h1 className="font-title text-xl font-semibold">Contrat créé</h1>
        <p className="text-sm text-slate-500">
          Envoie ce lien à ton client pour qu&apos;il lise et signe le contrat.
        </p>

        <div className="w-full text-left">
          <MandateSummary
            clientNom={clientNom}
            clientEntreprise={clientEntreprise}
            lines={lines}
            delaisPaiement={
              delaisPaiement || "50 % à la signature, 50 % à la livraison"
            }
            billingType={billingType}
            dureeMois={dureeMois ? Number(dureeMois) : undefined}
          />
        </div>

        <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span className="truncate">{`/contrat/${createdId}`}</span>
          <SendLinkActions
            path={`/contrat/${createdId}`}
            clientNom={clientNom}
            clientEmail={clientEmail}
          />
        </div>
        <div className="mt-2 flex gap-3">
          <Link
            href="/nouveau"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setCreatedId(null);
              setLines([]);
              setClientNom("");
              setClientEmail("");
              setClientEntreprise("");
              setDelaisPaiement("");
              setBillingType("unique");
              setDureeMois("");
              setLang("fr");
            }}
          >
            Créer un autre contrat
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10 sm:py-16">
      <div>
        <Link href="/" className="text-xs font-medium text-brand-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="font-title mt-2 text-2xl font-semibold tracking-tight">
          Nouveau contrat
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Remplis les informations du client. Le montant s&apos;additionne
          automatiquement selon les heures et le taux horaire de chaque ligne.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Langue du contrat
          </label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                lang === "fr"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Français
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                lang === "en"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              English
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Détermine la langue du contrat, de la lettre de bienvenue et de
            toute la page vue par le client.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nom du client *
          </label>
          <input
            type="text"
            value={clientNom}
            onChange={(e) => setClientNom(e.target.value)}
            placeholder="Prénom Nom ou entreprise"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Courriel du client (optionnel)
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="client@exemple.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nom de l&apos;entreprise (optionnel)
          </label>
          <input
            type="text"
            value={clientEntreprise}
            onChange={(e) => setClientEntreprise(e.target.value)}
            placeholder="Entreprise du client"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Services *
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {servicesCatalog.map((service) => {
              const checked = lines.some((l) => l.label === service.label);
              return (
                <label
                  key={service.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium ${
                    checked
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {service.label}
                </label>
              );
            })}
          </div>
        </div>

        {lines.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="block text-sm font-medium text-slate-700">
              Lignes du contrat — estimation par heures
            </label>
            {lines.map((line, i) => {
              const subtotal = computeLineSubtotal(line);
              return (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={line.label}
                      onChange={(e) => updateLine(i, "label", e.target.value)}
                      placeholder="Nom de la ligne"
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                  <textarea
                    value={line.description}
                    onChange={(e) =>
                      updateLine(i, "description", e.target.value)
                    }
                    rows={2}
                    placeholder="Description de la ligne"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500">
                        Blocs
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={line.quantite ?? 1}
                        onChange={(e) =>
                          updateLine(i, "quantite", e.target.value)
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">
                        Heures / bloc
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={line.heures ?? 0}
                        onChange={(e) =>
                          updateLine(i, "heures", e.target.value)
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">
                        Taux ($/h)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={line.tauxHoraire ?? companyConfig.tauxHoraireDefaut}
                        onChange={(e) =>
                          updateLine(i, "tauxHoraire", e.target.value)
                        }
                        className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <p className="text-right text-xs font-medium text-slate-600">
                    {subtotal !== null
                      ? `Sous-total : ${formatCurrency(subtotal)} $ CA`
                      : "Sous-total : — (ajoute des heures pour calculer)"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addCustomLine}
          className="self-start text-xs font-medium text-brand-600 hover:underline"
        >
          + Ajouter une ligne personnalisée
        </button>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Type de facturation
          </label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setBillingType("unique")}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                billingType === "unique"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Paiement unique
            </button>
            <button
              type="button"
              onClick={() => setBillingType("mensuel")}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${
                billingType === "mensuel"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Récurrent mensuel
            </button>
          </div>
        </div>

        {billingType === "mensuel" && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Durée de l&apos;engagement (mois, optionnel)
            </label>
            <input
              type="number"
              min={1}
              value={dureeMois}
              onChange={(e) => setDureeMois(e.target.value)}
              placeholder="ex. 12"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="text-sm font-medium text-brand-700">
            {billingType === "mensuel"
              ? "Montant mensuel estimé"
              : "Montant total estimé"}
          </span>
          <span className="text-lg font-semibold text-brand-700">
            {formatCurrency(total)} $ CA
            {billingType === "mensuel" ? " / mois" : ""}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Modalités de paiement
          </label>
          <input
            type="text"
            value={delaisPaiement}
            onChange={(e) => setDelaisPaiement(e.target.value)}
            placeholder="50 % à la signature, 50 % à la livraison"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Création…" : "Créer le contrat et obtenir le lien"}
        </button>
      </form>
    </main>
  );
}
