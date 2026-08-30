/** Dosya içeriğinden MIME tespiti — client Content-Type’a güvenilmez. */

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function detectUploadMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  // WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  // MP4 / QuickTime family (ftyp)
  if (buf.toString("ascii", 4, 8) === "ftyp") return "video/mp4";
  // WebM / Matroska
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return "video/webm";
  }

  return null;
}

export function extensionForMime(mime: string) {
  return EXT_BY_MIME[mime] ?? null;
}

export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

export function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}
