/** Veri kaynağı geçici hata verirse sayfayı düşürmeden yedek değer döndürür. */
export async function safeLoad<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[safeLoad:${label}]`, error);
    return fallback;
  }
}
