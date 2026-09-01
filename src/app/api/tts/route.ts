import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { synthesizeArticleSpeech } from "@/lib/tts";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const origin = await assertSameOriginRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.error }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const limited = await rateLimit(`tts:${session.user.id}:${ip}`, {
    limit: 10,
    windowMs: 5 * 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Çok fazla istek. ${limited.retryAfterSec} sn sonra deneyin.` },
      { status: 429 },
    );
  }

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  try {
    const speech = await synthesizeArticleSpeech(text);
    return new NextResponse(new Uint8Array(speech.buffer), {
      headers: {
        "Content-Type": speech.mime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ses üretilemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
