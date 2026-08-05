// Modèle de contrat de prestation de services conforme aux usages du Québec,
// disponible en français et en anglais.
// ⚠️ Contenu fourni par la cliente elle-même (pas un avis juridique généré
// par défaut) — voir CONTRACT_ASSUMPTIONS dans le rapport de changement pour
// les valeurs déduites (pénalités, préavis, ville, durée de confidentialité).

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
  entrepriseCourriel?: string;
  entrepriseTelephone?: string;
  clientNom?: string;
  clientEntreprise?: string;
  clientEmail?: string;
  clientTelephone?: string;
  lines?: ContractLine[];
  montant?: string;
  billingType?: BillingType;
  dureeMois?: number;
  delaisPaiement?: string;
  preavisJours?: string;
  villeJuridiction?: string;
  penaliteRetardPourcent?: string;
  penaliteRetardJours?: string;
  suspensionApresJours?: string;
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
    entrepriseCourriel = "hello@servicesvalu.com",
    entrepriseTelephone = "(418) 953-4746",
    clientNom = "[Nom du client]",
    clientEntreprise,
    clientEmail,
    clientTelephone,
    lines,
    montant = "[montant]",
    billingType = "unique",
    dureeMois,
    delaisPaiement = "[modalités de paiement, ex. 50 % à la signature, 50 % à la livraison]",
    preavisJours = "15",
    villeJuridiction = "Québec",
    penaliteRetardPourcent = "5",
    penaliteRetardJours = "5",
    suspensionApresJours = "10",
  } = params;

  const clientPartie = clientEntreprise
    ? `${clientEntreprise}, représentée par ${clientNom}`
    : clientNom;

  const clientContactParts: string[] = [];
  if (clientEmail) clientContactParts.push(`Courriel : ${clientEmail}`);
  if (clientTelephone) clientContactParts.push(`Téléphone : ${clientTelephone}`);
  const clientContactLine =
    clientContactParts.length > 0 ? `\n${clientContactParts.join(" | ")}` : "";

  const modalitesSection =
    billingType === "mensuel"
      ? `- Frais récurrents : Le Client autorise l'Entreprise à prélever la somme mensuelle de ${montant} $ CA (taxes en sus).
- Mode de paiement : Prélèvement automatique mensuel, effectué à la même date que la signature électronique du présent contrat.
- Période d'engagement : ${
          dureeMois
            ? `Pour une durée de ${dureeMois} mois à compter de la date de signature électronique.`
            : "Sans durée d'engagement minimale déterminée ; le mandat se poursuit jusqu'à résiliation par l'une des Parties conformément à l'article 13."
        }
- Modalités précises convenues : ${delaisPaiement}.`
      : `- Montant total : Le Client autorise l'Entreprise à percevoir la somme totale de ${montant} $ CA (taxes en sus), selon les modalités suivantes : ${delaisPaiement}.`;

  return `CONTRAT DE PRESTATION DE SERVICES

ENTRE LES SOUSSIGNÉS :
${entrepriseNom}, personne morale légalement constituée, ayant son siège social au ${entrepriseAdresse}, Québec, représentée par ses représentants dûment autorisés (ci-après désignée l'« Entreprise » ou le « Fournisseur »)
Courriel : ${entrepriseCourriel} | Téléphone : ${entrepriseTelephone}

ET :
${clientPartie} (ci-après désignée le « Client »)${clientContactLine}

1. OBJET DU CONTRAT ET NATURE DES SERVICES
Le présent contrat définit les conditions générales applicables à l'ensemble des prestations de services conclues entre l'Entreprise et le Client. L'Entreprise s'engage à fournir au Client les services convenus entre les parties, et le Client s'engage à rémunérer l'Entreprise selon les modalités prévues au présent contrat.

Les services faisant l'objet du présent mandat sont les suivants :

${formatLinesFr(lines)}

1.1. Vente exclusive en banques d'heures
Tous les services offerts par l'Entreprise sont vendus exclusivement sous forme de banques d'heures afin d'assurer une réactivité et une flexibilité optimales.

- Il est de la responsabilité du Client d'effectuer un suivi régulier et de valider l'utilisation des heures auprès de sa chargée de projet.
- Les objectifs, livrables et estimations proposés dans le cadre d'une banque d'heures servent uniquement de repères indicatifs sur ce qui peut être accompli. Ils ne constituent en aucun cas une garantie de résultat, de livraison ou de remise de services.

1.2. Cadre d'utilisation et expiration des banques d'heures

- Les heures de service sont déplaçables sur la durée du mandat, selon le jugement et l'évaluation de l'Entreprise.
- Les heures non consommées à la fin d'un mois sont reportables pour un délai maximal de trente (30) jours. Au-delà de ce délai de 30 jours, les heures non utilisées sont définitivement expirées et non remboursables.

1.3. Épuisement de la banque d'heures et travaux supplémentaires
Dès que la banque d'heures mensuelle est épuisée, tout travail ou ajustement supplémentaire (incluant les demandes de rapports personnalisés ou de révisions majeures) fera l'objet d'une approbation préalable du Client et sera facturé au tarif horaire régulier en vigueur de l'Entreprise.

2. MODALITÉS DE PAIEMENT ET FACTURATION (paraphe requis)

- Politique de paiement avant service :
   - Banque d'heures mensuelle : Le paiement est exigible et perçu intégralement avant le début de la prestation de services.
   - Forfait spécifique : Un acompte de 50 % est exigé avant le début des travaux, et le solde de 50 % doit être réglé avant la remise finale des livrables.
- Autorisation de prélèvement : Le Client autorise expressément l'Entreprise à effectuer les prélèvements requis sur sa carte de crédit via la plateforme Square, ou par prélèvement bancaire préautorisé via QuickBooks.
${modalitesSection}
- Pénalités de retard : Le paiement est exigible à la date fixée. Tout retard de paiement entraîne automatiquement, et sans préavis, l'application d'une pénalité de ${penaliteRetardPourcent} % du montant total dû par tranche de ${penaliteRetardJours} jours de retard, calculée dès le premier jour d'impayé. L'Entreprise se réserve le droit de suspendre la prestation de services en cas de défaut de paiement supérieur à ${suspensionApresJours} jours.

3. PROPRIÉTÉ INTELLECTUELLE ET CAPITAL NUMÉRIQUE

- Transfert au Client : L'Entreprise reconnaît l'importance pour le Client de préserver son capital numérique. Ainsi, l'ensemble des créations (visuels, textes, stratégies, vidéos) réalisées spécifiquement pour le Client deviennent la propriété exclusive du Client uniquement après le paiement intégral de la totalité des factures afférentes au contrat. En cas de non-paiement ou d'impayé, l'Entreprise conserve l'entière propriété des créations.
- Outils et gabarits propriétaires de l'Entreprise : Les méthodes internes, procédés créatifs, concepts originaux, fichiers sources complexes et gabarits (templates) préexistants ou développés par ${entrepriseNom} demeurent la propriété exclusive de l'Entreprise. En cas de fin de contrat, certains gabarits propriétaires ne pourront être modifiés ou adaptés selon les désirs du Client afin de préserver l'intégrité des outils internes de l'Entreprise.

4. OBLIGATIONS ET COLLABORATION DU CLIENT (paraphe requis)
Le Client comprend qu'il fait partie intégrante de la réussite des projets. L'Entreprise agit à titre d'extension de l'équipe du Client et non à titre de simple exécutant.
Le Client s'engage à :

- Délai d'accès et mise en place : Fournir rapidement à l'Entreprise tous les accès, informations et documents nécessaires. Pour les nouveaux contrats, la mise en place est prévue dans un délai de deux (2) semaines suivant la signature. Tout retard dans la transmission des accès par le Client aura un impact direct sur l'échéancier de mise en place.
- Disponibilités et communications : Respecter les disponibilités des chargées de projet et valider leurs plages horaires via le lien de calendrier présent dans leur signature de courriel. Un délai de réponse de 24 heures ouvrables est considéré comme raisonnable. Le Client comprend qu'une absence de réponse immédiate ne constitue pas un manque de disponibilité, mais garantit le respect du temps de création et de la concentration accordée à ses dossiers ou à ceux des autres clients.
- Suivi et approbations : Participer aux réunions de suivi et effectuer les validations requises dans un délai raisonnable afin de ne pas retarder les projets.
- Périodes d'expérimentation (Testing) : Faire confiance au processus stratégique et respecter les délais de test. Bien que l'objectif soit l'obtention de résultats, le parcours d'expérimentation et d'optimisation peut parfois s'avérer plus long que prévu.

5. SÉCURITÉ DES DONNÉES ET AUTORISATION D'ENREGISTREMENT (paraphe requis)

- Captation et enregistrements : Le Client autorise expressément l'Entreprise à enregistrer (audio et/ou vidéo) les échanges, réunions et séances de travail à l'aide d'outils technologiques sécurisés tels que Plaud. Ces enregistrements sont utilisés strictement pour le suivi de dossier, la qualité et la formation interne, en toute confidentialité.
- Protocole de sécurité hautement diligent : Afin d'assurer la protection maximale des données de ses clients :
   - L'Entreprise utilise la plateforme 1Password pour la gestion, le chiffrement et le stockage hautement sécurisé des mots de passe et informations sensibles.
   - L'Entreprise collabore activement avec Résolock, une firme spécialisée en sécurité numérique, afin d'auditer et d'appliquer les meilleures pratiques de l'industrie.

6. FRAIS TIERS, BUDGETS MÉDIAS ET PLATEFORMES EXTERNES

- Frais à la charge du Client : Tous les frais publicitaires (budgets médias dus à Meta, Google Ads, TikTok, etc.) ainsi que les coûts d'abonnements logiciels ou de licences tierces requis pour le projet sont à la charge exclusive du Client.
- Indépendance des plateformes tierces : L'Entreprise n'est pas responsable des décisions, suspensions de compte publicitaire, modifications d'algorithmes, pannes ou fermetures de comptes imposées par des plateformes tierces (ex. : suspension arbitraire d'un compte publicitaire par Meta ou Google). Le contrat, l'engagement et les paiements des banques d'heures demeurent entièrement valides, effectifs et exigibles même en cas de problème survenu sur une plateforme tierce.

7. CLAUSE DE NON-SOLLICITATION ET INDEMNITÉ FORFAITAIRE
Le Client s'engage expressément à ne pas solliciter, débaucher, embaucher directement ou engager à son compte (que ce soit à titre d'employé, de consultant ou de sous-traitant) tout membre de l'équipe, employé, chargé de projet ou sous-traitant de l'Entreprise durant toute la durée du présent contrat ainsi que pour une période de douze (12) mois suivant la fin du présent contrat.
En cas de violation de la présente clause, le Client s'engage à verser à l'Entreprise, à titre de clause pénale et d'indemnité forfaitaire couvrant les frais de recrutement, de remplacement et de préjudice subi, un montant équivalent à six (6) mois de la rémunération brute globale de la personne concernée.

8. UTILISATION DE L'INTELLIGENCE ARTIFICIELLE (IA)
L'Entreprise est autorisée à utiliser des outils d'intelligence artificielle générative (ex. : ChatGPT, Midjourney ou autres logiciels d'analyse/création) dans le cadre de ses processus de recherche, de création et d'optimisation. L'Entreprise garantit une révision humaine systématique de tous les contenus produits ainsi que la stricte confidentialité des données transmises dans ces outils.

9. UTILISATION ET AUTORISATION MÉDIATIQUE (DROITS D'IMAGE) (paraphe requis)
Le Client accorde à l'Entreprise l'autorisation de :

- Mentionner le Client ou son entreprise à titre de référence client / partenaire sur ses réseaux sociaux, son site Web et son matériel promotionnel ;
- Utiliser, adapter et diffuser les visuels, photos et vidéos réalisés ou partagés dans le cadre du mandat sur les plateformes de l'Entreprise. L'Entreprise pourra démontrer les résultats de la collaboration de manière anonyme (sans mention directe de l'entreprise), ou sollicitera l'autorisation préalable du Client si le nom de l'entreprise doit y être explicitement associé.

10. CONFIDENTIALITÉ
Les parties s'engagent à ne pas divulguer ni utiliser les informations confidentielles (stratégies, données financières, secrets commerciaux) obtenues dans le cadre de leur collaboration. Cette obligation demeure en vigueur pendant une durée de deux (2) ans suivant la fin du présent contrat, sauf autorisation écrite préalable délivrée par l'Entreprise.

11. LIMITATION DE RESPONSABILITÉ, FORCE MAJEURE ET CYBERSÉCURITÉ (paraphe requis)

11.1. Erreurs et omissions involontaires
L'Entreprise fournit ses services avec diligence et professionnalisme. Le Client reconnaît que des erreurs humaines, coquilles ou contraintes techniques peuvent survenir. L'Entreprise ne pourra être tenue responsable des dommages indirects, pertes de profits ou atteintes à la réputation. En cas d'erreur avérée, la responsabilité de l'Entreprise se limite exclusivement à apporter les corrections nécessaires dans un délai raisonnable.

11.2. Cybersécurité
L'Entreprise met en œuvre des mesures de sécurité rigoureuses (incluant l'usage de 1Password et les recommandations de Résolock). Aucun système n'étant invulnérable, l'Entreprise est dégagée de toute responsabilité financière ou légale en cas de cyberattaque, piratage ou fuite de données externe, sauf en cas de faute lourde ou de négligence grave directement imputable à l'Entreprise.

11.3. Force majeure et pannes réseau
L'Entreprise est dégagée de toute responsabilité en cas d'impossibilité ou de retard dans l'exécution de ses obligations découlant d'un événement de force majeure ou d'incidents hors de son contrôle raisonnable, incluant notamment : pannes majeures du réseau Internet, interruptions de service d'infrastructure mondiale (ex. : pannes de Meta, AWS, Google), catastrophes naturelles ou cyberattaques d'envergure.

12. HEURES DE SERVICE, FERMETURES ET FÉRIÉS (paraphe requis)
Les services sont fournis du lundi au vendredi, de 7 h 30 à 16 h 00. Les demandes formulées en dehors de ces heures seront traitées lors du jour ouvrable suivant.
L'Entreprise sera fermée durant les périodes de congés et jours fériés officiels suivants :

Périodes de fermeture annuelles :
- Congé des Fêtes : Du 15 décembre au 10 janvier inclus (pour chaque année d'engagement).
- Congé estival (Vacances de la construction) : Les deux (2) dernières semaines de juillet.
- Semaine additionnelle : Une (1) semaine de fermeture variable durant l'année (notifiée à l'avance).

Calendrier des jours fériés officiels (2026 - 2027) :
- Jour de l'An : 1er janvier 2026 / 1er janvier 2027
- Vendredi saint : 3 avril 2026 / 26 mars 2027
- Lundi de Pâques : 6 avril 2026 / 29 mars 2027
- Journée nationale des patriotes / Fête de la Reine : 18 mai 2026 / 24 mai 2027
- Fête nationale du Québec : 24 juin 2026 / 24 juin 2027
- Fête du Canada : 1er juillet 2026 / 1er juillet 2027
- Fête du Travail : 7 septembre 2026 / 6 septembre 2027
- Action de grâce : 12 octobre 2026 / 11 octobre 2027
- Noël : 25 décembre 2026 / 25 décembre 2027
- Lendemain de Noël (Lendemain de la Fête) : 26 décembre 2026 / 26 décembre 2027

Note : Durant ces périodes de fermeture, toutes les urgences sont réorientées et adressées adéquatement, et la gestion des banques d'heures est réorganisée en conséquence.

13. RÉSILIATION DU CONTRAT
Chaque partie peut résilier le contrat en cas de manquement grave aux obligations contractuelles par l'autre partie, après notification écrite (par courriel) et à défaut de correction ou réponse satisfaisante dans un délai de ${preavisJours} jours.
En cas de résiliation anticipée par le Client sans faute commise par l'Entreprise ou sans respect du délai de préavis, le Client demeure pleinement redevable des services rendus, des heures déjà engagées ou exécutées, ainsi que des montants restants dus au titre de la période d'engagement minimal préavisée.

14. LOI APPLICABLE ET ÉLECTION DE DOMICILE (JURIDICTION)
Le présent contrat est régi et interprété conformément aux lois en vigueur dans la province de Québec (Canada). Tout litige, différend ou réclamation découlant du présent contrat ou s'y rapportant sera soumis exclusivement à la compétence des tribunaux du district judiciaire de ${villeJuridiction} (ou du siège social de l'Entreprise), province de Québec.
Les parties conviennent que la signature électronique ou la confirmation transmise par voie électronique a la même valeur juridique qu'une signature originale, conformément à la Loi concernant le cadre juridique des technologies de l'information (RLRQ, c. C-1.1) et au Code civil du Québec.

EN FOI DE QUOI, les Parties ont signé électroniquement le présent contrat à la date et à l'heure indiquées dans le certificat de traçabilité ci-joint.`;
}

function getContractTextEn(params: ContractParams): string {
  const {
    entrepriseNom = "[Company name]",
    entrepriseAdresse = "[company address]",
    entrepriseCourriel = "hello@servicesvalu.com",
    entrepriseTelephone = "(418) 953-4746",
    clientNom = "[Client name]",
    clientEntreprise,
    clientEmail,
    clientTelephone,
    lines,
    montant = "[amount]",
    billingType = "unique",
    dureeMois,
    delaisPaiement = "[payment terms, e.g. 50% upon signature, 50% upon delivery]",
    preavisJours = "15",
    villeJuridiction = "Québec",
    penaliteRetardPourcent = "5",
    penaliteRetardJours = "5",
    suspensionApresJours = "10",
  } = params;

  const clientPartie = clientEntreprise
    ? `${clientEntreprise}, represented by ${clientNom}`
    : clientNom;

  const clientContactParts: string[] = [];
  if (clientEmail) clientContactParts.push(`Email: ${clientEmail}`);
  if (clientTelephone) clientContactParts.push(`Phone: ${clientTelephone}`);
  const clientContactLine =
    clientContactParts.length > 0 ? `\n${clientContactParts.join(" | ")}` : "";

  const paymentSection =
    billingType === "mensuel"
      ? `- Recurring fees: The Client authorizes the Company to charge the monthly amount of $${montant} CAD (taxes extra).
- Payment method: Automatic monthly withdrawal, processed on the same date as the electronic signature of this Agreement.
- Engagement period: ${
          dureeMois
            ? `For a term of ${dureeMois} months from the date of electronic signature.`
            : "No minimum engagement period specified; the engagement continues until terminated by either Party in accordance with Section 13."
        }
- Specific terms agreed upon: ${delaisPaiement}.`
      : `- Total amount: The Client authorizes the Company to collect the total amount of $${montant} CAD (taxes extra), according to the following terms: ${delaisPaiement}.`;

  return `SERVICE AGREEMENT

BETWEEN THE UNDERSIGNED:
${entrepriseNom}, a legal entity duly incorporated, with its head office in ${entrepriseAdresse}, Québec, represented by its duly authorized representatives (hereinafter the "Company" or the "Provider")
Email: ${entrepriseCourriel} | Phone: ${entrepriseTelephone}

AND:
${clientPartie} (hereinafter the "Client")${clientContactLine}

1. PURPOSE OF THE AGREEMENT AND NATURE OF SERVICES
This Agreement sets out the general terms and conditions applicable to all services provided between the Company and the Client. The Company agrees to provide the Client with the services agreed upon between the parties, and the Client agrees to pay the Company in accordance with the terms set out in this Agreement.

The services covered by this engagement are as follows:

${formatLinesEn(lines)}

1.1. Exclusive sale as hour banks
All services offered by the Company are sold exclusively as hour banks in order to ensure optimal responsiveness and flexibility.

- It is the Client's responsibility to regularly follow up and validate hour usage with their project manager.
- The objectives, deliverables, and estimates proposed under an hour bank are provided as indicative benchmarks of what can be accomplished only. They do not, under any circumstances, constitute a guarantee of results, delivery, or completion of services.

1.2. Usage framework and expiry of hour banks

- Service hours may be shifted over the term of the engagement, at the Company's discretion and assessment.
- Hours not used by the end of a given month may be carried over for a maximum period of thirty (30) days. Beyond this 30-day period, unused hours are permanently forfeited and non-refundable.

1.3. Depletion of the hour bank and additional work
Once the monthly hour bank is depleted, any additional work or adjustment (including requests for custom reports or major revisions) will require the Client's prior approval and will be billed at the Company's regular hourly rate then in effect.

2. PAYMENT AND BILLING TERMS (initials required)

- Pay-before-service policy:
   - Monthly hour bank: Payment is due and collected in full before services begin.
   - Specific package: A 50% deposit is required before work begins, with the remaining 50% due before final delivery of the deliverables.
- Pre-authorization: The Client expressly authorizes the Company to process the required charges to their credit card via the Square platform, or by pre-authorized bank withdrawal via QuickBooks.
${paymentSection}
- Late payment penalties: Payment is due on the agreed date. Any late payment automatically incurs, without notice, a penalty of ${penaliteRetardPourcent}% of the total amount owed for every ${penaliteRetardJours} days of delay, calculated from the first day payment is overdue. The Company reserves the right to suspend services in the event of non-payment exceeding ${suspensionApresJours} days.

3. INTELLECTUAL PROPERTY AND DIGITAL ASSETS

- Transfer to the Client: The Company recognizes the importance to the Client of preserving their digital assets. Accordingly, all creations (visuals, copy, strategies, videos) produced specifically for the Client become the Client's exclusive property only once full payment of all invoices related to this Agreement has been received. In the event of non-payment, the Company retains full ownership of the creations.
- The Company's proprietary tools and templates: Internal methods, creative processes, original concepts, complex source files, and templates pre-existing or developed by ${entrepriseNom} remain the exclusive property of the Company. Upon termination of the Agreement, certain proprietary templates may not be modified or adapted at the Client's request, in order to preserve the integrity of the Company's internal tools.

4. CLIENT OBLIGATIONS AND COLLABORATION (initials required)
The Client understands that they are an integral part of the projects' success. The Company acts as an extension of the Client's team, not merely as a service executor.
The Client agrees to:

- Access and onboarding timeline: Promptly provide the Company with all necessary access, information, and documents. For new engagements, onboarding is expected within two (2) weeks of signing. Any delay by the Client in providing access will directly impact the onboarding timeline.
- Availability and communication: Respect project managers' availability and book time slots via the calendar link in their email signature. A response time of 24 business hours is considered reasonable. The Client understands that not receiving an immediate response does not indicate a lack of availability, but rather reflects respect for the creative focus and time dedicated to their account and those of other clients.
- Follow-up and approvals: Attend check-in meetings and provide required approvals within a reasonable timeframe so as not to delay projects.
- Testing periods: Trust the strategic process and respect testing timelines. While the goal is to achieve results, the process of experimentation and optimization can sometimes take longer than expected.

5. DATA SECURITY AND RECORDING AUTHORIZATION (initials required)

- Recording: The Client expressly authorizes the Company to record (audio and/or video) exchanges, meetings, and working sessions using secure technology tools such as Plaud. These recordings are used strictly for account follow-up, quality assurance, and internal training, and are kept confidential.
- Highly diligent security protocol: To ensure maximum protection of client data:
   - The Company uses the 1Password platform for the secure management, encryption, and storage of passwords and sensitive information.
   - The Company works actively with Résolock, a firm specializing in digital security, to audit and apply industry best practices.

6. THIRD-PARTY FEES, MEDIA BUDGETS, AND EXTERNAL PLATFORMS

- Fees payable by the Client: All advertising fees (media budgets owed to Meta, Google Ads, TikTok, etc.) as well as software subscription or third-party license costs required for the project are the Client's sole responsibility.
- Independence of third-party platforms: The Company is not responsible for decisions, ad account suspensions, algorithm changes, outages, or account closures imposed by third-party platforms (e.g., an arbitrary ad account suspension by Meta or Google). This Agreement, the engagement, and hour bank payments remain fully valid, effective, and payable even in the event of an issue on a third-party platform.

7. NON-SOLICITATION CLAUSE AND LIQUIDATED DAMAGES
The Client expressly agrees not to solicit, poach, directly hire, or otherwise engage (whether as an employee, consultant, or subcontractor) any team member, employee, project manager, or subcontractor of the Company during the term of this Agreement and for a period of twelve (12) months following its termination.
In the event of a breach of this clause, the Client agrees to pay the Company, as liquidated damages covering recruitment, replacement, and prejudice-related costs, an amount equivalent to six (6) months of the individual's total gross compensation.

8. USE OF ARTIFICIAL INTELLIGENCE (AI)
The Company is authorized to use generative artificial intelligence tools (e.g., ChatGPT, Midjourney, or other analysis/creation software) as part of its research, creative, and optimization processes. The Company guarantees systematic human review of all content produced, as well as strict confidentiality of any data submitted to these tools.

9. MEDIA USE AND AUTHORIZATION (IMAGE RIGHTS) (initials required)
The Client grants the Company permission to:

- Reference the Client or their business as a client/partner reference on its social media, website, and promotional materials;
- Use, adapt, and share visuals, photos, and videos created or shared as part of the engagement on the Company's platforms. The Company may showcase the results of the collaboration anonymously (without directly naming the business), or will seek the Client's prior authorization if the business name is to be explicitly associated with it.

10. CONFIDENTIALITY
The parties agree not to disclose or use confidential information (strategies, financial data, trade secrets) obtained in the course of their collaboration. This obligation remains in effect for two (2) years following the end of this Agreement, unless prior written authorization is granted by the Company.

11. LIMITATION OF LIABILITY, FORCE MAJEURE, AND CYBERSECURITY (initials required)

11.1. Unintentional errors and omissions
The Company provides its services with diligence and professionalism. The Client acknowledges that human error, typos, or technical constraints may occur. The Company shall not be liable for indirect damages, loss of profits, or reputational harm. In the event of a proven error, the Company's liability is limited exclusively to making the necessary corrections within a reasonable timeframe.

11.2. Cybersecurity
The Company implements rigorous security measures (including the use of 1Password and Résolock's recommendations). As no system is invulnerable, the Company is released from any financial or legal liability in the event of an external cyberattack, hacking, or data breach, except in the case of gross fault or gross negligence directly attributable to the Company.

11.3. Force majeure and network outages
The Company is released from any liability for failure or delay in performing its obligations resulting from an event of force majeure or incidents beyond its reasonable control, including, without limitation: major Internet outages, global infrastructure service disruptions (e.g., outages at Meta, AWS, Google), natural disasters, or large-scale cyberattacks.

12. SERVICE HOURS, CLOSURES, AND STATUTORY HOLIDAYS (initials required)
Services are provided Monday to Friday, 7:30 a.m. to 4:00 p.m. Requests made outside these hours will be handled on the next business day.
The Company will be closed during the following holiday and closure periods:

Annual closure periods:
- Holiday closure: From December 15 to January 10, inclusive (for each year of the engagement).
- Summer closure (construction holiday): The last two (2) weeks of July.
- Additional week: One (1) variable closure week during the year (notified in advance).

Statutory holiday calendar (2026 - 2027):
- New Year's Day: January 1, 2026 / January 1, 2027
- Good Friday: April 3, 2026 / March 26, 2027
- Easter Monday: April 6, 2026 / March 29, 2027
- National Patriots' Day: May 18, 2026 / May 24, 2027
- Saint-Jean-Baptiste Day (Québec National Holiday): June 24, 2026 / June 24, 2027
- Canada Day: July 1, 2026 / July 1, 2027
- Labour Day: September 7, 2026 / September 6, 2027
- Thanksgiving: October 12, 2026 / October 11, 2027
- Christmas Day: December 25, 2026 / December 25, 2027
- Boxing Day: December 26, 2026 / December 26, 2027

Note: During these closure periods, all urgent matters are redirected and handled appropriately, and hour bank management is adjusted accordingly.

13. TERMINATION OF THE AGREEMENT
Either party may terminate this Agreement in the event of a serious breach of contractual obligations by the other party, following written notice (by email) and failure to remedy or provide a satisfactory response within ${preavisJours} days.
In the event of early termination by the Client without fault on the part of the Company, or without respecting the required notice period, the Client remains fully liable for services rendered, hours already committed or performed, and any remaining amounts owed for the minimum notified engagement period.

14. GOVERNING LAW AND JURISDICTION
This Agreement is governed by and interpreted in accordance with the laws in force in the Province of Québec (Canada). Any dispute, disagreement, or claim arising from or related to this Agreement shall be submitted exclusively to the courts of the judicial district of ${villeJuridiction} (or of the Company's head office), Province of Québec.
The parties agree that an electronic signature or confirmation transmitted electronically has the same legal value as an original signature, in accordance with An Act to establish a legal framework for information technology (CQLR, c. C-1.1) and the Civil Code of Québec.

IN WITNESS WHEREOF, the Parties have electronically signed this Agreement on the date and time indicated in the attached audit trail certificate.`;
}

export function getContractText(params: ContractParams = {}): string {
  return params.lang === "en" ? getContractTextEn(params) : getContractTextFr(params);
}
