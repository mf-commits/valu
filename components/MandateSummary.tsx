import {
  computeContractTotal,
  computeLineSubtotal,
  formatCurrency,
  type ContractLine,
} from "@/lib/contractContent";

type Props = {
  clientNom: string;
  lines: ContractLine[];
  delaisPaiement: string;
};

export default function MandateSummary({
  clientNom,
  lines,
  delaisPaiement,
}: Props) {
  const total = computeContractTotal(lines);

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Description du mandat
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{clientNom}</p>

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
        <p className="mt-3 text-sm text-slate-500">Aucun service précisé.</p>
      )}

      <div className="mt-4 flex flex-col gap-1 border-t border-brand-100 pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Montant total estimé</span>
          <span className="font-medium text-slate-800">
            {formatCurrency(total)} $ CA
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Modalités</span>
          <span className="max-w-[65%] text-right font-medium text-slate-800">
            {delaisPaiement}
          </span>
        </div>
      </div>
    </div>
  );
}
