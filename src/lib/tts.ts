import { createHash } from "crypto";
import { elevenLabsConfigured, elevenLabsModel, elevenLabsVoice, synthesizeElevenLabsSpeech } from "@/lib/elevenlabs-tts";
import { azureSpeechConfigured, azureVoice, synthesizeAzureSpeech } from "@/lib/azure-tts";
import { synthesizePiperSpeech } from "@/lib/piper-tts";
import { toSpokenNewsText } from "@/lib/speech-text";

export type SpeechAudio = {
  buffer: Buffer;
  mime: "audio/mpeg" | "audio/wav";
};

const cache = new Map<string, { audio: SpeechAudio; at: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const CACHE_MAX = 24;

function cacheGet(hash: string) {
  const row = cache.get(hash);
  if (!row) return null;
  if (Date.now() - row.at > CACHE_TTL_MS) {
    cache.delete(hash);
    return null;
  }
  return row.audio;
}

function cacheSet(hash: string, audio: SpeechAudio) {
  cache.set(hash, { audio, at: Date.now() });
  if (cache.size <= CACHE_MAX) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
  if (oldest) cache.delete(oldest[0]);
}

export async function synthesizeArticleSpeech(text: string): Promise<SpeechAudio> {
  const cleaned = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) throw new Error("Okunacak metin yok");
  if (cleaned.length > 12_000) throw new Error("Metin çok uzun");

  const spoken = toSpokenNewsText(cleaned);
  const engine = elevenLabsConfigured()
    ? "elevenlabs"
    : azureSpeechConfigured()
      ? "azure"
      : "piper";
  const voice = elevenLabsConfigured()
    ? `${elevenLabsModel()}:${elevenLabsVoice()}`
    : azureSpeechConfigured()
      ? azureVoice()
      : "tr_TR-fahrettin-medium";
  const hash = createHash("sha256")
    .update(`${engine}:${voice}:news-v7:${spoken}`)
    .digest("hex");
  const cached = cacheGet(hash);
  if (cached) return cached;

  if (elevenLabsConfigured()) {
    try {
      const audio = { buffer: await synthesizeElevenLabsSpeech(spoken), mime: "audio/mpeg" as const };
      cacheSet(hash, audio);
      return audio;
    } catch (err) {
      console.error("[tts] ElevenLabs başarısız, yedeğe düşülüyor", err);
    }
  }

  if (azureSpeechConfigured()) {
    try {
      const audio = { buffer: await synthesizeAzureSpeech(spoken), mime: "audio/mpeg" as const };
      cacheSet(hash, audio);
      return audio;
    } catch (err) {
      console.error("[tts] Azure başarısız, Piper yedeğe düşülüyor", err);
    }
  }

  const audio = { buffer: await synthesizePiperSpeech(spoken), mime: "audio/wav" as const };
  cacheSet(hash, audio);
  return audio;
}
