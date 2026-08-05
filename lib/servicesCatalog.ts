// Catalogue de services proposés — coché à la création d'un contrat, chaque
// service ajoute une ligne (personnalisable) à la section « Portée des
// services » du contrat. Ajuste librement labels et descriptions par défaut.
// Les versions "En" sont utilisées quand le contrat est créé en anglais —
// sans elles, le texte du service resterait en français même dans un
// contrat anglais.

export type ContractLine = {
  label: string;
  description: string;
};

export type CatalogService = ContractLine & {
  id: string;
  labelEn: string;
  descriptionEn: string;
};

export const servicesCatalog: CatalogService[] = [
  {
    id: "social",
    label: "Médias sociaux",
    description:
      "Gestion et création de contenu pour les réseaux sociaux : stratégie, calendrier de publication, création de contenu, gestion de communauté.",
    labelEn: "Social media",
    descriptionEn:
      "Social media management and content creation: strategy, publishing calendar, content creation, community management.",
  },
  {
    id: "paid-ads",
    label: "Publicité payante",
    description:
      "Conception, lancement et optimisation de campagnes publicitaires payantes (Meta, Google, etc.), incluant suivi de performance.",
    labelEn: "Paid advertising",
    descriptionEn:
      "Design, launch, and optimization of paid advertising campaigns (Meta, Google, etc.), including performance tracking.",
  },
  {
    id: "seo",
    label: "SEO / GEO",
    description:
      "Optimisation pour les moteurs de recherche traditionnels et génératifs (référencement naturel et visibilité dans les outils d'IA).",
    labelEn: "SEO / GEO",
    descriptionEn:
      "Optimization for traditional and generative search engines (organic search ranking and visibility in AI tools).",
  },
  {
    id: "branding",
    label: "Branding",
    description:
      "Positionnement de marque, identité visuelle et stratégie de communication.",
    labelEn: "Branding",
    descriptionEn: "Brand positioning, visual identity, and communication strategy.",
  },
  {
    id: "web",
    label: "Site web",
    description: "Conception, développement ou refonte de site web.",
    labelEn: "Website",
    descriptionEn: "Website design, development, or redesign.",
  },
  {
    id: "content",
    label: "Contenu",
    description:
      "Création de contenu stratégique (textes, visuels, vidéos) aligné sur les objectifs d'affaires du client.",
    labelEn: "Content",
    descriptionEn:
      "Strategic content creation (copy, visuals, video) aligned with the client's business goals.",
  },
];
