import { NextRequest, NextResponse } from "next/server";
import { sha256 } from "@/lib/hash";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { passcode } = (await request.json()) as { passcode?: string };
  const expected = process.env.ADMIN_PASSCODE;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSCODE n'est pas configuré sur le serveur." },
      { status: 500 }
    );
  }

  if (!passcode || passcode !== expected) {
    return NextResponse.json({ error: "Mot de passe invalide." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("cs_auth", sha256(expected), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
