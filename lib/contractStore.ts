import { getStore } from "@netlify/blobs";
import type { BillingType, ContractLang, ContractLine } from "@/lib/contractContent";

export type ContractStatus = "pending" | "signed";

export type InitialEntry = {
  key: string;
  label: string;
  dataUrl: string;
};

export type ContractRecord = {
  id: string;
  lang: ContractLang;
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientEntreprise?: string;
  lines: ContractLine[];
  montant: string;
  billingType: BillingType;
  dureeMois?: number;
  delaisPaiement: string;
  status: ContractStatus;
  createdAt: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  ip?: string;
  userAgent?: string;
  hash?: string;
  pdfBase64?: string;
  initials?: InitialEntry[];
};

export type ContractSummary = Pick<
  ContractRecord,
  | "id"
  | "lang"
  | "clientNom"
  | "clientEmail"
  | "clientEntreprise"
  | "status"
  | "createdAt"
  | "montant"
  | "billingType"
  | "signedAt"
>;

function contractsStore() {
  return getStore("contracts");
}

function indexStore() {
  return getStore("contracts-index");
}

async function readIndex(): Promise<ContractSummary[]> {
  const store = indexStore();
  const data = await store.get("index", { type: "json" });
  return (data as ContractSummary[]) || [];
}

async function writeIndex(entries: ContractSummary[]) {
  const store = indexStore();
  await store.setJSON("index", entries);
}

function toSummary(record: ContractRecord): ContractSummary {
  return {
    id: record.id,
    lang: record.lang,
    clientNom: record.clientNom,
    clientEmail: record.clientEmail,
    clientEntreprise: record.clientEntreprise,
    status: record.status,
    createdAt: record.createdAt,
    montant: record.montant,
    billingType: record.billingType,
    signedAt: record.signedAt,
  };
}

export async function createContract(
  input: Omit<ContractRecord, "id" | "status" | "createdAt">
): Promise<ContractRecord> {
  const { v4: uuidv4 } = await import("uuid");
  const record: ContractRecord = {
    ...input,
    id: uuidv4(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await contractsStore().setJSON(record.id, record);

  const index = await readIndex();
  index.unshift(toSummary(record));
  await writeIndex(index);

  return record;
}

export async function getContract(id: string): Promise<ContractRecord | null> {
  const data = await contractsStore().get(id, { type: "json" });
  return (data as ContractRecord) || null;
}

export async function updateContract(
  id: string,
  updates: Partial<ContractRecord>
): Promise<ContractRecord | null> {
  const existing = await getContract(id);
  if (!existing) return null;

  const updated: ContractRecord = { ...existing, ...updates };
  await contractsStore().setJSON(id, updated);

  const index = await readIndex();
  const nextIndex = index.map((entry) =>
    entry.id === id ? toSummary(updated) : entry
  );
  await writeIndex(nextIndex);

  return updated;
}

export async function listContracts(): Promise<ContractSummary[]> {
  return readIndex();
}

// Supprime un contrat — réservé aux contrats "pending" (jamais signés) côté
// appelant. Un contrat déjà signé constitue un document légal avec un
// certificat de traçabilité : on ne le supprime jamais, on le garde comme
// registre. Voir app/api/contracts/[id]/route.ts pour la vérification.
export async function deleteContract(id: string): Promise<void> {
  await contractsStore().delete(id);
  const index = await readIndex();
  await writeIndex(index.filter((entry) => entry.id !== id));
}
