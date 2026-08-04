// Modèle de contrat de prestation de services conforme aux usages du Québec.
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

export type ContractParams = {
  entrepriseNom?: string;
  entrepriseAdresse?: string;
  clientNom?: string;
  lines?: ContractLine[];
  montant?: string;
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

function formatLines(lines?: ContractLine[]): string {
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

export function getContractText(params: ContractParams = {}): string {
  const {
    entrepriseNom = "[Nom de l'entreprise]",
    entrepriseAdresse = "[adresse de l'entreprise]",
    clientNom = "[Nom du client]",
    lines,
    montant = "[montant]",
    delaisPaiement = "[modalités de paiement, ex. 50 % à la signature, 50 % à la livraison]",
    preavisJours = "15",
    villeJuridiction = "[ville]",
  } = params;

  return `CONTRAT DE PRESTATION DE SERVICES

ENTRE :
${entrepriseNom}, personne morale légalement constituée en vertu des lois de la province de Québec, ayant sa place d'affaires au ${entrepriseAdresse} (ci-après « le Prestataire »)

ET :
${clientNom} (ci-après « le Client »)

(ci-après collectivement les « Parties »)

PRÉAMBULE
Les Parties souhaitent convenir des modalités selon lesquelles le Prestataire fournira des services au Client, tel que décrit ci-dessous. En conséquence, les Parties conviennent de ce qui suit :

1. OBJET DU CONTRAT ET PORTÉE DES SERVICES
Le Prestataire s'engage à fournir au Client les services suivants (l'estimation ci-dessous est fondée sur un taux horaire et constitue une estimation, sujette à ajustement selon l'ampleur réelle des travaux) :

${formatLines(lines)}

2. DURÉE
Le présent contrat entre en vigueur à la date de signature électronique et demeure en vigueur jusqu'à l'exécution complète des services, sauf résiliation anticipée conformément à l'article 6.

3. PRIX ET MODALITÉS DE PAIEMENT (initiales requises)
En contrepartie des services rendus, le Client s'engage à verser au Prestataire la somme totale estimée de ${montant} $ CA, taxes applicables en sus, selon les modalités suivantes : ${delaisPaiement}.

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
