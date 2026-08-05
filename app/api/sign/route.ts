import { NextRequest, NextResponse } from "next/server";
import { generateContractPdf } from "@/lib/pdfGenerator";
import { sha256 } from "@/lib/hash";
import { getContract, updateContract, InitialEntry } from "@/lib/contractStore";
import { getContractText } from "@/lib/contractContent";
import { companyConfig } from "@/lib/companyConfig";
import { getSettings } from "@/lib/settingsStore";
import {
  getWelcomeLetterText,
  getWelcomeLetterSignoff,
  parseWelcomeMessage,
} from "@/lib/welcomeLetter";

const REQUIRED_INITIAL_KEYS = [
  "paiement",
  "obligations",
  "securite",
  "mediatique",
  "responsabilite",
  "heures",
];

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-nf-client-connection-ip") || // en-tête spécifique à Netlify
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "IP inconnue"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, signerName, signerEmail, signatureDataUrl, initials } =
      body as {
        contractId?: string;
        signerName?: string;
        signerEmail?: string;
        signatureDataUrl?: string;
        initials?: InitialEntry[];
      };

    if (!contractId || !signerName?.trim() || !signatureDataUrl) {
      return NextResponse.json(
        { error: "Champs requis manquants (contrat, nom ou signature)." },
        { status: 400 }
      );
    }

    const providedKeys = new Set((initials || []).map((i) => i.key));
    const missingInitials = REQUIRED_INITIAL_KEYS.some(
      (key) => !providedKeys.has(key)
    );
    if (!initials || missingInitials) {
      return NextResponse.json(
        {
          error:
            "Tous les paraphes requis doivent être apposés avant la signature.",
        },
        { status: 400 }
      );
    }

    const record = await getContract(contractId);
    if (!record) {
      return NextResponse.json({ error: "Contrat introuvable." }, { status: 404 });
    }
    if (record.status === "signed") {
      return NextResponse.json(
        { error: "Ce contrat a déjà été signé." },
        { status: 409 }
      );
    }

    const settings = await getSettings();

    // Le texte du contrat est reconstruit côté serveur à partir des données
    // enregistrées — jamais depuis ce que le navigateur envoie — pour éviter
    // qu'un client altère le texte signé.
    const contractText = getContractText({
      lang: record.lang,
      clientNom: record.clientNom,
      clientEmail: record.clientEmail,
      clientTelephone: record.clientTelephone,
      clientEntreprise: record.clientEntreprise,
      lines: record.lines,
      montant: record.montant,
      billingType: record.billingType,
      dureeMois: record.dureeMois,
      delaisPaiement: record.delaisPaiement,
      entrepriseNom: settings.entrepriseNom,
      entrepriseAdresse: settings.entrepriseAdresse,
      entrepriseCourriel: companyConfig.entrepriseCourriel,
      entrepriseTelephone: companyConfig.entrepriseTelephone,
      villeJuridiction: companyConfig.villeJuridiction,
      preavisJours: companyConfig.preavisJours,
      penaliteRetardPourcent: companyConfig.penaliteRetardPourcent,
      penaliteRetardJours: companyConfig.penaliteRetardJours,
      suspensionApresJours: companyConfig.suspensionApresJours,
    });

    const timestamp = new Date().toLocaleString("fr-CA", {
      timeZone: "America/Toronto",
      dateStyle: "long",
      timeStyle: "medium",
    });
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "inconnu";
    const hash = sha256(
      `${contractText}|${signerName}|${timestamp}|${signatureDataUrl}`
    );

    const welcomeMessage =
      record.lang === "en" ? settings.welcomeMessageEn : settings.welcomeMessage;
    const introText = getWelcomeLetterText(
      parseWelcomeMessage(welcomeMessage),
      getWelcomeLetterSignoff(settings.entrepriseNom)
    );

    const pdfBytes = await generateContractPdf({
      lang: record.lang,
      introText,
      contractText,
      signerName: signerName.trim(),
      signerEmail,
      signatureDataUrl,
      timestamp,
      ip,
      userAgent,
      contractId,
      hash,
      initials,
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    await updateContract(contractId, {
      status: "signed",
      signedAt: new Date().toISOString(),
      signerName: signerName.trim(),
      signerEmail,
      ip,
      userAgent,
      hash,
      pdfBase64,
      initials,
    });

    // Notifie Make/Zapier — ne bloque pas la réponse si le webhook échoue.
    if (process.env.WEBHOOK_URL) {
      try {
        await fetch(process.env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "contract.signed",
            contractId,
            clientNom: record.clientNom,
            signerName,
            signerEmail: signerEmail || null,
            timestamp,
            ip,
            hash,
          }),
        });
      } catch (webhookError) {
        console.error("Échec de l'envoi du webhook :", webhookError);
      }
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrat-signe-${contractId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la signature du contrat." },
      { status: 500 }
    );
  }
}
