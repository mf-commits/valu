import { NextRequest, NextResponse } from "next/server";
import { createContract } from "@/lib/contractStore";
import {
  computeContractTotal,
  formatCurrency,
  type BillingType,
  type ContractLang,
  type ContractLine,
} from "@/lib/contractContent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientNom,
      clientEmail,
      clientEntreprise,
      lines,
      delaisPaiement,
      billingType,
      dureeMois,
      lang,
    } = body as {
      clientNom?: string;
      clientEmail?: string;
      clientEntreprise?: string;
      lines?: ContractLine[];
      delaisPaiement?: string;
      billingType?: BillingType;
      dureeMois?: number;
      lang?: ContractLang;
    };

    const cleanLines: ContractLine[] = (lines || [])
      .map((line) => ({
        label: line.label?.trim() || "",
        description: line.description?.trim() || "",
        quantite:
          line.quantite && line.quantite > 0 ? Number(line.quantite) : undefined,
        heures: line.heures && line.heures > 0 ? Number(line.heures) : undefined,
        tauxHoraire:
          line.tauxHoraire && line.tauxHoraire > 0
            ? Number(line.tauxHoraire)
            : undefined,
      }))
      .filter((line) => line.label || line.description);

    if (!clientNom?.trim() || cleanLines.length === 0) {
      return NextResponse.json(
        { error: "Nom du client et au moins un service sont requis." },
        { status: 400 }
      );
    }

    // Le montant total n'est jamais accepté du client — il est toujours
    // recalculé côté serveur à partir des lignes (quantité × heures × taux),
    // pour éviter qu'un montant soit falsifié avant l'envoi du lien.
    const total = computeContractTotal(cleanLines);

    const contract = await createContract({
      lang: lang === "en" ? "en" : "fr",
      clientNom: clientNom.trim(),
      clientEmail: clientEmail?.trim(),
      clientEntreprise: clientEntreprise?.trim() || undefined,
      lines: cleanLines,
      montant: formatCurrency(total),
      billingType: billingType === "mensuel" ? "mensuel" : "unique",
      dureeMois: dureeMois && dureeMois > 0 ? Number(dureeMois) : undefined,
      delaisPaiement:
        delaisPaiement?.trim() || "50 % à la signature, 50 % à la livraison",
    });

    return NextResponse.json({ id: contract.id, montant: formatCurrency(total) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création du contrat." },
      { status: 500 }
    );
  }
}
