/** ui-avatars.com — yüklenemeyen profil görselleri için yedek. */
export function avatarFallbackUrl(name: string, size = 176) {
  const label = name.trim() || "Yazar";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=0a2f5c&color=fff&size=${size}&bold=true`;
}

/** Firma / logo alanları için metin tabanlı yedek. */
export function logoFallbackUrl(name: string, size = 128) {
  const label = name.trim() || "Firma";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=f3f4f6&color=0a2f5c&size=${size}&bold=true`;
}
