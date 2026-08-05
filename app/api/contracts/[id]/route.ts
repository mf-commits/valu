import { NextRequest, NextResponse } from "next/server";
import { getContract, deleteContract } from "@/lib/contractStore";

export const runtime = "nodejs";

// Supprime un contrat — uniquement s'il n'a jamais été signé. Un contrat
// signé est un document légal (avec certificat de traçabilité) qu'on
// conserve toujours ; il n'existe volontairement aucun moyen de le
// supprimer depuis l'interface.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const record = await getContract(params.id);
  if (!record) {
    return NextResponse.json({ error: "Contrat introuvable." }, { status: 404 });
  }
  if (record.status === "signed") {
    return NextResponse.json(
      { error: "Un contrat signé ne peut pas être supprimé." },
      { status: 403 }
    );
  }
  await deleteContract(params.id);
  return NextResponse.json({ ok: true });
}
