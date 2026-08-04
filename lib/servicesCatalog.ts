// Catalogue de services proposés — coché à la création d'un contrat, chaque
// service ajoute une ligne (personnalisable) à la section « Portée des
// services » du contrat. Ajuste librement labels et descriptions par défaut.

export type ContractLine = {
  label: string;
  description: string;
};

export type CatalogService = ContractLine & {
  id: string;
};

export const servicesCatalog: CatalogService[] = [
  {
    id: "social",
    label: "Médias sociaux",
    description:
      "Gestion et création de contenu pour les réseaux sociaux : stratégie, calendrier de publication, création de contenu, gestion de communauté.",
  },
  {
    id: "paid-ads",
    label: "Publicité payante",
    description:
      "Conception, lancement et optimisation de campagnes publicitaires payantes (Meta, Google, etc.), incluant suivi de performance.",
  },
  {
    id: "seo",
    label: "SEO / GEO",
    description:
      "Optimisation pour les moteurs de recherche traditionnels et génératifs (référencement naturel et visibilité dans les outils d'IA).",
  },
  {
    id: "branding",
    label: "Branding",
    description:
      "Positionnement de marque, identité visuelle et stratégie de communication.",
  },
  {
    id: "web",
    label: "Site web",
    description: "Conception, développement ou refonte de site web.",
  },
  {
    id: "content",
    label: "Contenu",
    description:
      "Création de contenu stratégique (textes, visuels, vidéos) aligné sur les objectifs d'affaires du client.",
  },
];
