// Textes d'interface pour les pages VUES PAR LE CLIENT (bienvenue, lecture,
// signature, PDF). Les pages admin (tableau de bord, /nouveau, /parametres)
// restent en français puisqu'elles ne sont utilisées que par toi.

import type { ContractLang } from "@/lib/contractContent";

export const uiStrings = {
  fr: {
    header: {
      eyebrow: "Signature électronique",
      title: "Signez votre contrat en ligne",
      subtitle:
        "Lisez le contrat, apposez vos initiales et votre signature, recevez votre copie signée en PDF.",
    },
    steps: {
      bienvenue: "Bienvenue",
      lecture: "Lecture",
      signature: "Signature",
      succes: "Confirmation",
    },
    welcome: {
      continueButton: "Continuer vers le contrat",
      bienvenueChez: "Bienvenue chez",
      bonjour: "Bonjour et bienvenue",
      videoTitle: "Message de bienvenue",
      videoLinkFallback: "▶ Regarder notre message de bienvenue",
    },
    lecture: {
      contractHeading: "Contrat de prestation de services",
      initialsPrompt:
        "Merci de parapher les éléments suivants pour confirmer votre lecture :",
      erase: "Effacer",
      acceptLabel:
        "J'ai lu et je comprends l'ensemble des termes du contrat ci-dessus, et j'accepte d'y être lié(e).",
      initialsRequired:
        "Les trois paraphes ci-dessus sont requis avant l'acceptation.",
      checkpoints: {
        prix: "Prix et modalités de paiement (article 3)",
        resiliation: "Politique de résiliation (article 6)",
        responsabilite: "Limitation de responsabilité (article 9)",
      },
    },
    signature: {
      fullName: "Nom complet *",
      fullNamePlaceholder: "Prénom Nom",
      email: "Courriel (optionnel)",
      emailPlaceholder: "nom@exemple.com",
      signHere: "Signez ici (souris ou doigt) *",
      erase: "Effacer",
      emptyHint: "Dessine ta signature dans la zone ci-dessus.",
      submitIdle: "Signer et télécharger le PDF",
      submitLoading: "Signature en cours…",
      ipNotice:
        "La date, l'heure et l'adresse IP seront enregistrées dans un certificat de traçabilité joint au PDF.",
      errorMissingName: "Merci d'indiquer ton nom complet.",
      errorEmptySignature:
        "La signature est vide. Dessine ta signature avant de continuer.",
      errorGeneric: "Une erreur est survenue.",
      errorMissingInitials:
        "Les trois paraphes (prix, résiliation, responsabilité) sont requis avant la signature.",
    },
    success: {
      title: "Contrat signé avec succès",
      body: "Le PDF signé, incluant le certificat de traçabilité, a été téléchargé automatiquement.",
      redownload: "Retélécharger le PDF",
    },
    footer:
      "Signature électronique conforme à la Loi concernant le cadre juridique des technologies de l'information (RLRQ, c. C-1.1).",
    notFound: {
      title: "Contrat introuvable",
      body: "Ce lien n'est plus valide. Contacte l'expéditeur pour obtenir un nouveau lien.",
    },
    alreadySigned: {
      title: "Ce contrat a déjà été signé",
      signedOn: "Signé le",
      download: "Télécharger le PDF signé",
    },
    mandate: {
      heading: "Description du mandat",
      noServices: "Aucun service précisé.",
      totalOnce: "Montant total estimé",
      totalMonthly: "Montant mensuel estimé",
      perMonth: "/ mois",
      duration: "Durée",
      months: "mois",
      terms: "Modalités",
    },
    pdf: {
      welcomeHeading: "Mot de bienvenue",
      contractHeading: "Contrat de services — copie signée",
      signatureHeading: "Signature",
      signedBy: "Signé par",
      dateTime: "Date et heure",
      initialsHeading: "Initiales de confirmation",
      certHeading: "Certificat de traçabilité",
      certId: "Identifiant du contrat",
      certSigner: "Nom du signataire",
      certEmail: "Courriel",
      certEmailMissing: "non fourni",
      certDate: "Date et heure de signature",
      certIp: "Adresse IP",
      certAgent: "Agent utilisateur",
      certHash: "Empreinte d'intégrité (SHA-256)",
      initialRecorded: "paraphe enregistré",
    },
  },
  en: {
    header: {
      eyebrow: "Electronic signature",
      title: "Sign your contract online",
      subtitle:
        "Read the contract, initial the key sections, sign, and receive your signed copy as a PDF.",
    },
    steps: {
      bienvenue: "Welcome",
      lecture: "Review",
      signature: "Signature",
      succes: "Confirmation",
    },
    welcome: {
      continueButton: "Continue to the contract",
      bienvenueChez: "Welcome to",
      bonjour: "Hello and welcome",
      videoTitle: "Welcome message",
      videoLinkFallback: "▶ Watch our welcome message",
    },
    lecture: {
      contractHeading: "Service agreement",
      initialsPrompt: "Please initial the following to confirm you've read them:",
      erase: "Clear",
      acceptLabel:
        "I have read and understand all the terms of the agreement above, and I agree to be bound by it.",
      initialsRequired: "All three initials above are required before accepting.",
      checkpoints: {
        prix: "Price and payment terms (Section 3)",
        resiliation: "Termination policy (Section 6)",
        responsabilite: "Limitation of liability (Section 9)",
      },
    },
    signature: {
      fullName: "Full name *",
      fullNamePlaceholder: "First Last",
      email: "Email (optional)",
      emailPlaceholder: "name@example.com",
      signHere: "Sign here (mouse or finger) *",
      erase: "Clear",
      emptyHint: "Draw your signature in the area above.",
      submitIdle: "Sign and download the PDF",
      submitLoading: "Signing…",
      ipNotice:
        "The date, time, and IP address will be recorded in an audit trail certificate attached to the PDF.",
      errorMissingName: "Please enter your full name.",
      errorEmptySignature: "The signature is empty. Draw your signature before continuing.",
      errorGeneric: "Something went wrong.",
      errorMissingInitials:
        "All three initials (price, termination, liability) are required before signing.",
    },
    success: {
      title: "Contract signed successfully",
      body: "The signed PDF, including the audit trail certificate, was downloaded automatically.",
      redownload: "Download the PDF again",
    },
    footer:
      "Electronic signature compliant with An Act to establish a legal framework for information technology (CQLR, c. C-1.1).",
    notFound: {
      title: "Contract not found",
      body: "This link is no longer valid. Contact the sender for a new link.",
    },
    alreadySigned: {
      title: "This contract has already been signed",
      signedOn: "Signed on",
      download: "Download the signed PDF",
    },
    mandate: {
      heading: "Engagement summary",
      noServices: "No services specified.",
      totalOnce: "Estimated total amount",
      totalMonthly: "Estimated monthly amount",
      perMonth: "/ month",
      duration: "Duration",
      months: "months",
      terms: "Terms",
    },
    pdf: {
      welcomeHeading: "Welcome message",
      contractHeading: "Service agreement — signed copy",
      signatureHeading: "Signature",
      signedBy: "Signed by",
      dateTime: "Date and time",
      initialsHeading: "Confirmation initials",
      certHeading: "Audit trail certificate",
      certId: "Contract ID",
      certSigner: "Signer's name",
      certEmail: "Email",
      certEmailMissing: "not provided",
      certDate: "Date and time of signature",
      certIp: "IP address",
      certAgent: "User agent",
      certHash: "Integrity hash (SHA-256)",
      initialRecorded: "initial recorded",
    },
  },
} as const;

export function t(lang: ContractLang | undefined) {
  return uiStrings[lang === "en" ? "en" : "fr"];
}
