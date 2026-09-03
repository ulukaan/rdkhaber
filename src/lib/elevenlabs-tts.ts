const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL";
const DEFAULT_MODEL = "eleven_multilingual_v2";

export function elevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export function elevenLabsVoice() {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE;
}

export function elevenLabsModel() {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL;
}

function sentences(text: string) {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitForElevenLabs(text: string, max = 2200) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  const pushBuf = () => {
    if (buf) chunks.push(buf);
    buf = "";
  };

  for (const para of paras) {
    const parts = sentences(para.replace(/\s+/g, " "));
    for (const part of parts) {
      const next = buf ? `${buf} ${part}` : part;
      if (next.length > max && buf) {
        pushBuf();
        buf = part;
      } else {
        buf = next;
      }
    }
    if (buf) buf = `${buf}\n\n`;
  }
  pushBuf();
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

async function synthesizeChunk(text: string) {
  const voice = elevenLabsVoice();
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!.trim(),
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: elevenLabsModel(),
      voice_settings: {
        stability: 0.42,
        similarity_boost: 0.75,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${res.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function synthesizeElevenLabsSpeech(text: string) {
  const chunks = splitForElevenLabs(text);
  const parts: Buffer[] = [];
  for (const chunk of chunks) {
    parts.push(await synthesizeChunk(chunk));
  }
  return Buffer.concat(parts);
}
