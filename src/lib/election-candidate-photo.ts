import { normalizeYskPlace } from "@/lib/ysk-api";

/** Parti rengine göre otomatik avatar (ui-avatars). YSK API fotoğraf sağlamaz. */
export function buildCandidateAvatarUrl(name: string, partyColor = "#d0021b") {
  const bg = partyColor.replace("#", "");
  const encoded = encodeURIComponent(name.trim() || "Aday");
  return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=fff&size=256&bold=true&format=png`;
}

/** Veritabanı / YSK / demo için görüntülenecek fotoğraf URL'si. */
export function resolveCandidatePhotoUrl(input: {
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl?: string | null;
}) {
  const stored = input.photoUrl?.trim();
  if (stored) return stored;

  return buildCandidateAvatarUrl(input.name, input.partyColor);
}

/** Aday adından karşılaştırma anahtarı (eşleştirme için). */
export function normalizeCandidateKey(name: string) {
  return normalizeYskPlace(name)
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
}
