import { NextRequest, NextResponse } from "next/server";
import { getContract } from "@/lib/contractStore";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const record = await getContract(params.id);

  if (!record || !record.pdfBase64) {
    return NextResponse.json(
      { error: "PDF introuvable pour ce contrat." },
      { status: 404 }
    );
  }

  const pdfBytes = Buffer.from(record.pdfBase64, "base64");

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrat-signe-${record.id}.pdf"`,
    },
  });
}
