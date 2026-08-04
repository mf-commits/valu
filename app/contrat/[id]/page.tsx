import { getContract } from "@/lib/contractStore";
import SignFlow from "@/components/SignFlow";

export const dynamic = "force-dynamic";

export default async function ContratPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = await getContract(params.id);

  if (!contract) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="font-title text-xl font-semibold">Contrat introuvable</h1>
        <p className="text-sm text-slate-500">
          Ce lien n&apos;est plus valide. Contacte l&apos;expéditeur pour obtenir un
          nouveau lien.
        </p>
      </main>
    );
  }

  if (contract.status === "signed") {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <h1 className="font-title text-xl font-semibold">Ce contrat a déjà été signé</h1>
        <p className="text-sm text-slate-500">
          Signé le{" "}
          {contract.signedAt
            ? new Date(contract.signedAt).toLocaleString("fr-CA", {
                dateStyle: "long",
                timeStyle: "short",
              })
            : ""}
          .
        </p>
        <a
          href={`/api/contracts/${contract.id}/pdf`}
          className="mt-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Télécharger le PDF signé
        </a>
      </main>
    );
  }

  return (
    <SignFlow
      contract={{
        id: contract.id,
        clientNom: contract.clientNom,
        clientEmail: contract.clientEmail,
        lines: contract.lines,
        montant: contract.montant,
        delaisPaiement: contract.delaisPaiement,
      }}
    />
  );
}
