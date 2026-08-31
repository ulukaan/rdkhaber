/** Google AdSense ads.txt satırı — IAB formatı. */
export function buildAdsTxtContent(clientId: string): string {
  const client = clientId.trim().toLowerCase();
  const pub = client.replace(/^ca-pub-/, "");
  if (!pub) {
    return "";
  }
  return `google.com, pub-${pub}, DIRECT, f08c47fec0942fa0\n`;
}
