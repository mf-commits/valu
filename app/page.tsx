import Link from "next/link";
import { listContracts } from "@/lib/contractStore";
import SendLinkActions from "@/components/SendLinkActions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function Dashboard() {
  const contracts = await listContracts();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo className="mb-3 h-6" />
          <h1 className="font-title text-2xl font-semibold tracking-tight">Mes contrats</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crée un contrat, envoie le lien au client, télécharge le PDF signé.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/nouveau"
            className="whitespace-nowrap rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-600"
          >
            + Nouveau contrat
          </Link>
          <Link
            href="/parametres"
            className="whitespace-nowrap text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline"
          >
            Paramètres
          </Link>
          <a
            href="/api/auth/logout"
            className="whitespace-nowrap text-xs font-medium text-slate-400 hover:text-slate-600 hover:underline"
          >
            Se déconnecter
          </a>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/80 shadow-soft backdrop-blur">
        {contracts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-600">
              Aucun contrat pour le moment.
            </p>
            <p className="text-sm text-slate-400">
              Clique sur « Nouveau contrat » pour en créer un et obtenir un lien à
              envoyer à ton client.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contracts.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.clientEntreprise
                      ? `${c.clientEntreprise} — ${c.clientNom}`
                      : c.clientNom}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {c.lang === "en" ? "EN" : "FR"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {c.montant} $ CA{c.billingType === "mensuel" ? " / mois" : ""} ·
                    créé le {formatDate(c.createdAt)}
                    {c.signedAt ? ` · signé le ${formatDate(c.signedAt)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.status === "signed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {c.status === "signed" ? "Signé" : "En attente"}
                  </span>
                  {c.status === "signed" ? (
                    <a
                      href={`/api/contracts/${c.id}/pdf`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Télécharger PDF
                    </a>
                  ) : (
                    <SendLinkActions
                      path={`/contrat/${c.id}`}
                      clientNom={c.clientNom}
                      clientEmail={c.clientEmail}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
