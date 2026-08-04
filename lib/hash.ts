import { createHash } from "crypto";

// Empreinte d'intégrité utilisée dans le certificat de traçabilité :
// permet de prouver que le contrat et la signature n'ont pas été modifiés après coup.
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
