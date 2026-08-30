/** Resmi / halka açık canlı yayın kaynakları — UI’da kaynak adı gösterilmez */

export type LiveSource =
  | { type: "hls"; url: string }
  | { type: "youtube"; channelId: string };

/** slug → canlı yayın */
export const CHANNEL_LIVE: Partial<Record<string, LiveSource>> = {
  "trt-1": { type: "hls", url: "https://tv-trt1.medya.trt.com.tr/master.m3u8" },
  "trt-belgesel": { type: "hls", url: "https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8" },
  "trt-3-spor": { type: "youtube", channelId: "UCebdo7-2NdjcktKzco64iNw" },
  "cnn-turk": { type: "youtube", channelId: "UCJCYKGZ4ZyjjshYa6fhRgRw" },
  haberturk: { type: "youtube", channelId: "UCK3mI2lsk3LSo8PBUc8JTSw" },
  ntv: { type: "youtube", channelId: "UCGMghpDmBAqhz2p7eLHX-eg" },
  "a-haber": { type: "youtube", channelId: "UCKQhfw-lzz0uKnE1fY1PsAA" },
  "bloomberg-ht": { type: "youtube", channelId: "UCWgGEIw9k_BB0VRMhy_w21Q" },
  "360": { type: "youtube", channelId: "UCfqRQZ40fwEdaDWPuR7tvcw" },
  "kanal-d": { type: "youtube", channelId: "UCFoe1tg8MuHjRzmqXtV816A" },
  "show-tv": { type: "youtube", channelId: "UCRfLDCtkSwmTdwHrbmC78Xg" },
  "star-tv": { type: "youtube", channelId: "UC7J-BL-W-AVLbUUvn-pbd5Q" },
  now: { type: "youtube", channelId: "UCbq0bGdShXK5dMzEDU7nThA" },
  atv: { type: "youtube", channelId: "UCUVZ7T_kwkxDOGFcDlFI-hg" },
  "kanal-7": { type: "youtube", channelId: "UC3qbyYLVyx5Hn62Xea0416Q" },
  tv8: { type: "youtube", channelId: "UCp4N3g1zcvp8WE2qJ_JKqBg" },
};

export function getChannelLive(slug: string): LiveSource | null {
  return CHANNEL_LIVE[slug] ?? null;
}

export function youtubeLiveEmbedUrl(channelId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&${params}`;
}
