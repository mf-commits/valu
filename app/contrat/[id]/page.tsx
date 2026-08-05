import { getContract } from "@/lib/contractStore";
import { getSettings } from "@/lib/settingsStore";
import { parseWelcomeMessage, getWelcomeLetterSignoff } from "@/lib/welcomeLetter";
import { t } from "@/lib/uiStrings";
import SignFlow from "@/components/SignFlow";

export const dynamic = "force-dynamic";

export default async function ContratPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = await getContract(params.id);

  if (!contract) {
    const s = t(undefined).notFound;
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-title text-xl font-semibold">{s.title}</h1>
        <p className="text-sm text-slate-500">{s.body}</p>
      </main>
    );
  }

  if (contract.status === "signed") {
    const s = t(contract.lang);
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <h1 className="font-title text-xl font-semibold">{s.alreadySigned.title}</h1>
        <p className="text-sm text-slate-500">
          {s.alreadySigned.signedOn}{" "}
          {contract.signedAt
            ? new Date(contract.signedAt).toLocaleString(
                contract.lang === "en" ? "en-CA" : "fr-CA",
                { dateStyle: "long", timeStyle: "short" }
              )
            : ""}
          .
        </p>
        <a
          href={`/api/contracts/${contract.id}/pdf`}
          className="mt-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          {s.alreadySigned.download}
        </a>
      </main>
    );
  }

  const settings = await getSettings();
  const welcomeMessage =
    contract.lang === "en" ? settings.welcomeMessageEn : settings.welcomeMessage;

  return (
    <SignFlow
      contract={{
        id: contract.id,
        lang: contract.lang,
        clientNom: contract.clientNom,
        clientEmail: contract.clientEmail,
        clientEntreprise: contract.clientEntreprise,
        lines: contract.lines,
        montant: contract.montant,
        billingType: contract.billingType,
        dureeMois: contract.dureeMois,
        delaisPaiement: contract.delaisPaiement,
      }}
      welcome={{
        entrepriseNom: settings.entrepriseNom,
        introVideoUrl: settings.introVideoUrl,
        blocks: parseWelcomeMessage(welcomeMessage),
        signoff: getWelcomeLetterSignoff(settings.entrepriseNom),
      }}
    />
  );
}
