// Modèle de contrat de prestation de services conforme aux usages du Québec,
// disponible en français et en anglais.
// ⚠️ Ceci est un GABARIT de départ, pas un avis juridique. Fais-le réviser par
// un(e) avocat(e) avant utilisation commerciale, et personnalise les [crochets].

export type ContractLine = {
  label: string;
  description: string;
  // Bloc horaire optionnel : quantite × heures × tauxHoraire = sous-total.
  // Ex. 5 blocs de 10 heures à 125 $/h. Laisse heures ou tauxHoraire vides
  // pour une ligne purement descriptive (sans coût calculé).
  quantite?: number;
  heures?: number;
  tauxHoraire?: number;
};

export type BillingType = "unique" | "mensuel";
export type ContractLang = "fr" | "en";

export type ContractParams = {
  lang?: ContractLang;
  entrepriseNom?: string;
  entrepriseAdresse?: string;
  clientNom?: string;
  clientEntreprise?: string;
  lines?: ContractLine[];
  montant?: string;
  billingType?: BillingType;
  dureeMois?: number;
  delaisPaiement?: string;
  preavisJours?: string;
  villeJuridiction?: string;
};

const currencyFormatter = new Intl.NumberFormat("fr-CA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function computeLineSubtotal(line: ContractLine): number | null {
  if (!line.heures || !line.tauxHoraire) return null;
  const quantite = line.quantite && line.quantite > 0 ? line.quantite : 1;
  return quantite * line.heures * line.tauxHoraire;
}

export function computeContractTotal(lines?: ContractLine[]): number {
  if (!lines) return 0;
  return lines.reduce((sum, line) => {
    const subtotal = computeLineSubtotal(line);
    return sum + (subtotal ?? 0);
  }, 0);
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

function formatLinesFr(lines?: ContractLine[]): string {
  if (!lines || lines.length === 0) {
    return "[description des services rendus]";
  }
  return lines
    .map((line) => {
      const subtotal = computeLineSubtotal(line);
      if (subtotal === null) {
        return `- ${line.label} : ${line.description}`;
      }
      const quantite = line.quantite && line.quantite > 0 ? line.quantite : 1;
      const blocs = quantite > 1 ? `${quantite} × ` : "";
      return `- ${line.label} : ${line.description} — ${blocs}${line.heures} h à ${formatCurrency(
        line.tauxHoraire!
      )} $/h = ${formatCurrency(subtotal)} $ CA`;
    })
    .join("\n");
}

function formatLinesEn(lines?: ContractLine[]): string {
  if (!lines || lines.length === 0) {
    return "[description of services provided]";
  }
  return lines
    .map((line) => {
      const subtotal = computeLineSubtotal(line);
      if (subtotal === null) {
        return `- ${line.label}: ${line.description}`;
      }
      const quantite = line.quantite && line.quantite > 0 ? line.quantite : 1;
      const blocs = quantite > 1 ? `${quantite} × ` : "";
      return `- ${line.label}: ${line.description} — ${blocs}${line.heures} h at ${formatCurrency(
        line.tauxHoraire!
      )} $/h = ${formatCurrency(subtotal)} $ CAD`;
    })
    .join("\n");
}

function getContractTextFr(params: ContractParams): string {
  const {
    entrepriseNom = "[Nom de l'entreprise]",
    entrepriseAdresse = "[adresse de l'entreprise]",
    clientNom = "[Nom du client]",
    clientEntreprise,
    lines,
    montant = "[montant]",
    billingType = "unique",
    dureeMois,
    delaisPaiement = "[modalités de paiement, ex. 50 % à la signature, 50 % à la livraison]",
    preavisJours = "15",
    villeJuridiction = "[ville]",
  } = params;

  const clientPartie = clientEntreprise
    ? `${clientEntreprise}, représentée par ${clientNom}`
    : clientNom;

  const modalitesPrix =
    billingType === "mensuel"
      ? `un montant mensuel estimé de ${montant} $ CA, taxes applicables en sus, facturé chaque mois${
          dureeMois ? ` pour une durée de ${dureeMois} mois` : ""
        }, selon les modalités suivantes : ${delaisPaiement}`
      : `la somme totale estimée de ${montant} $ CA, taxes applicables en sus, selon les modalités suivantes : ${delaisPaiement}`;

  return `CONTRAT DE PRESTATION DE SERVICES

ENTRE :
${entrepriseNom}, personne morale légalement constituée en vertu des lois de la province de Québec, ayant sa place d'affaires au ${entrepriseAdresse} (ci-après « le Prestataire »)

ET :
${clientPartie} (ci-après « le Client »)

(ci-après collectivement les « Parties »)

PRÉAMBULE
Les Parties souhaitent convenir des modalités selon lesquelles le Prestataire fournira des services au Client, tel que décrit ci-dessous. En conséquence, les Parties conviennent de ce qui suit :

1. OBJET DU CONTRAT ET PORTÉE DES SERVICES
Le Prestataire s'engage à fournir au Client les services suivants (l'estimation ci-dessous est fondée sur un taux horaire et constitue une estimation, sujette à ajustement selon l'ampleur réelle des travaux) :

${formatLinesFr(lines)}

2. DURÉE
Le présent contrat entre en vigueur à la date de signature électronique et demeure en vigueur jusqu'à l'exécution complète des services, sauf résiliation anticipée conformément à l'article 6.

3. PRIX ET MODALITÉS DE PAIEMENT (initiales requises)
En contrepartie des services rendus, le Client s'engage à verser au Prestataire ${modalitesPrix}.

4. OBLIGATIONS DU PRESTATAIRE
Le Prestataire s'engage à exécuter les services avec diligence, compétence et conformément aux règles de l'art, dans le respect des délais convenus avec le Client.

5. OBLIGATIONS DU CLIENT
Le Client s'engage à fournir au Prestataire toute l'information et la collaboration nécessaires à la bonne exécution des services, ainsi qu'à effectuer les paiements convenus dans les délais prévus.

6. RÉSILIATION (initiales requises)
Chacune des Parties peut résilier le présent contrat moyennant un préavis écrit de ${preavisJours} jours, sous réserve du paiement intégral des services déjà rendus à la date de résiliation.

7. CONFIDENTIALITÉ
Les Parties s'engagent à conserver confidentielle toute information de nature confidentielle obtenue dans le cadre du présent contrat et à ne pas la divulguer à des tiers sans consentement écrit préalable, sauf si la loi l'exige.

8. PROPRIÉTÉ INTELLECTUELLE
Sauf entente contraire écrite entre les Parties, les droits de propriété intellectuelle relatifs aux livrables sont cédés au Client dès réception du paiement intégral prévu à l'article 3.

9. LIMITATION DE RESPONSABILITÉ (initiales requises)
La responsabilité du Prestataire envers le Client, pour quelque cause que ce soit, ne saurait excéder le montant total payé par le Client en vertu du présent contrat, sauf en cas de faute lourde ou intentionnelle.

10. DROIT APPLICABLE ET JURIDICTION
Le présent contrat est régi par les lois de la province de Québec et les lois fédérales du Canada qui s'y appliquent. Tout litige découlant du présent contrat relève de la compétence exclusive des tribunaux du district judiciaire de ${villeJuridiction}, Québec.

11. SIGNATURE ÉLECTRONIQUE
Les Parties reconnaissent que la signature électronique apposée ci-dessous, de même que les initiales apposées aux articles marqués « initiales requises », ont la même valeur juridique qu'une signature manuscrite, conformément à la Loi concernant le cadre juridique des technologies de l'information (RLRQ, c. C-1.1) et au Code civil du Québec.

EN FOI DE QUOI, les Parties ont signé électroniquement le présent contrat à la date et à l'heure indiquées dans le certificat de traçabilité ci-joint.`;
}

function getContractTextEn(params: ContractParams): string {
  const {
    entrepriseNom = "[Company name]",
    entrepriseAdresse = "[company address]",
    clientNom = "[Client name]",
    clientEntreprise,
    lines,
    montant = "[amount]",
    billingType = "unique",
    dureeMois,
    delaisPaiement = "[payment terms, e.g. 50% upon signature, 50% upon delivery]",
    preavisJours = "15",
    villeJuridiction = "[city]",
  } = params;

  const clientPartie = clientEntreprise
    ? `${clientEntreprise}, represented by ${clientNom}`
    : clientNom;

  const pricingTerms =
    billingType === "mensuel"
      ? `an estimated monthly amount of $${montant} CAD, applicable taxes extra, billed each month${
          dureeMois ? ` for a term of ${dureeMois} months` : ""
        }, according to the following terms: ${delaisPaiement}`
      : `the estimated total amount of $${montant} CAD, applicable taxes extra, according to the following terms: ${delaisPaiement}`;

  return `SERVICE AGREEMENT

BETWEEN:
${entrepriseNom}, a legal entity duly incorporated under the laws of the Province of Québec, with its place of business at ${entrepriseAdresse} (hereinafter the "Provider")

AND:
${clientPartie} (hereinafter the "Client")

(hereinafter collectively the "Parties")

RECITALS
The Parties wish to agree on the terms under which the Provider will provide services to the Client, as described below. The Parties therefore agree as follows:

1. PURPOSE OF THE AGREEMENT AND SCOPE OF SERVICES
The Provider agrees to provide the Client with the following services (the estimate below is based on an hourly rate and constitutes an estimate, subject to adjustment based on the actual scope of work):

${formatLinesEn(lines)}

2. TERM
This Agreement takes effect on the date of electronic signature and remains in effect until the services have been fully performed, unless terminated earlier in accordance with Section 6.

3. PRICE AND PAYMENT TERMS (initials required)
In consideration of the services rendered, the Client agrees to pay the Provider ${pricingTerms}.

4. PROVIDER'S OBLIGATIONS
The Provider agrees to perform the services with diligence, skill, and in accordance with industry standards, within the timelines agreed with the Client.

5. CLIENT'S OBLIGATIONS
The Client agrees to provide the Provider with all information and cooperation necessary for the proper performance of the services, and to make agreed payments within the required timelines.

6. TERMINATION (initials required)
Either Party may terminate this Agreement upon ${preavisJours} days' written notice, subject to payment in full for services already rendered as of the date of termination.

7. CONFIDENTIALITY
The Parties agree to keep confidential any confidential information obtained in connection with this Agreement and not to disclose it to third parties without prior written consent, unless required by law.

8. INTELLECTUAL PROPERTY
Unless otherwise agreed in writing between the Parties, intellectual property rights relating to the deliverables are assigned to the Client upon receipt of payment in full as set out in Section 3.

9. LIMITATION OF LIABILITY (initials required)
The Provider's liability to the Client, for any cause whatsoever, shall not exceed the total amount paid by the Client under this Agreement, except in the case of gross or intentional fault.

10. GOVERNING LAW AND JURISDICTION
This Agreement is governed by the laws of the Province of Québec and the federal laws of Canada applicable therein. Any dispute arising from this Agreement falls under the exclusive jurisdiction of the courts of the judicial district of ${villeJuridiction}, Québec.

11. ELECTRONIC SIGNATURE
The Parties acknowledge that the electronic signature affixed below, as well as the initials affixed to the sections marked "initials required," have the same legal value as a handwritten signature, in accordance with An Act to establish a legal framework for information technology (CQLR, c. C-1.1) and the Civil Code of Québec.

IN WITNESS WHEREOF, the Parties have electronically signed this Agreement on the date and time indicated in the attached audit trail certificate.`;
}

export function getContractText(params: ContractParams = {}): string {
  return params.lang === "en" ? getContractTextEn(params) : getContractTextFr(params);
}
