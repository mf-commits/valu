import {
  computeContractTotal,
  computeLineSubtotal,
  formatCurrency,
  type BillingType,
  type ContractLang,
  type ContractLine,
} from "@/lib/contractContent";
import { t } from "@/lib/uiStrings";

type Props = {
  clientNom: string;
  clientEntreprise?: string;
  lines: ContractLine[];
  delaisPaiement: string;
  billingType?: BillingType;
  dureeMois?: number;
  lang?: ContractLang;
};

export default function MandateSummary({
  clientNom,
  clientEntreprise,
  lines,
  delaisPaiement,
  billingType = "unique",
  dureeMois,
  lang,
}: Props) {
  const total = computeContractTotal(lines);
  const s = t(lang).mandate;
  const montantLabel = billingType === "mensuel" ? s.totalMonthly : s.totalOnce;

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        {s.heading}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">
        {clientEntreprise ? `${clientEntreprise} — ${clientNom}` : clientNom}
      </p>

      {lines.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {lines.map((line, i) => {
            const subtotal = computeLineSubtotal(line);
            const quantite = line.quantite && line.quantite > 0 ? line.quantite : 1;
            return (
              <li key={i} className="text-sm text-slate-700">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{line.label}</span>
                  {subtotal !== null && (
                    <span className="whitespace-nowrap font-medium text-slate-800">
                      {formatCurrency(subtotal)} $
                    </span>
                  )}
                </div>
                {line.description && (
                  <p className="text-slate-500">{line.description}</p>
                )}
                {subtotal !== null && (
                  <p className="text-xs text-slate-400">
                    {quantite > 1 ? `${quantite} × ` : ""}
                    {line.heures} h à {formatCurrency(line.tauxHoraire!)} $/h
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{s.noServices}</p>
      )}

      <div className="mt-4 flex flex-col gap-1 border-t border-brand-100 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">{montantLabel}</span>
          <span className="font-medium text-slate-800">
            {formatCurrency(total)} $ CA
            {billingType === "mensuel" ? ` ${s.perMonth}` : ""}
          </span>
        </div>
        {billingType === "mensuel" && dureeMois && (
          <div className="flex justify-between">
            <span className="text-slate-500">{s.duration}</span>
            <span className="font-medium text-slate-800">
              {dureeMois} {s.months}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">{s.terms}</span>
          <span className="max-w-[65%] text-right font-medium text-slate-800">
            {delaisPaiement}
          </span>
        </div>
      </div>
    </div>
  );
}
