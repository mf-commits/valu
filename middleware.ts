import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Note : "/api/contracts/:id" protège la suppression d'un contrat, mais ne
  // couvre pas "/api/contracts/:id/pdf" (segment supplémentaire) — ce
  // dernier doit rester public, le client le télécharge depuis la page
  // publique /contrat/[id] une fois son contrat signé.
  matcher: [
    "/",
    "/nouveau",
    "/parametres",
    "/api/contracts",
    "/api/contracts/:id",
    "/api/settings",
  ],
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const passcode = process.env.ADMIN_PASSCODE;

  // Aucun mot de passe configuré : accès libre (à éviter en production).
  if (!passcode) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("cs_auth")?.value;
  const expected = await sha256Hex(passcode);

  if (cookie === expected) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
