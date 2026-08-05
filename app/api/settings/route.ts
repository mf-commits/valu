import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settingsStore";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      entrepriseNom,
      entrepriseAdresse,
      introVideoUrl,
      introVideoUrlEn,
      welcomeMessage,
      welcomeMessageEn,
    } = body as {
      entrepriseNom?: string;
      entrepriseAdresse?: string;
      introVideoUrl?: string;
      introVideoUrlEn?: string;
      welcomeMessage?: string;
      welcomeMessageEn?: string;
    };

    const updated = await saveSettings({
      entrepriseNom: entrepriseNom?.trim(),
      entrepriseAdresse: entrepriseAdresse?.trim(),
      introVideoUrl: introVideoUrl?.trim(),
      introVideoUrlEn: introVideoUrlEn?.trim(),
      welcomeMessage,
      welcomeMessageEn,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des paramètres." },
      { status: 500 }
    );
  }
}
