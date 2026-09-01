import { NextResponse } from "next/server";
import { readUploadedFile } from "@/lib/upload-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: Params) {
  const { path: parts } = await params;
  const rel = (parts ?? []).join("/");
  const file = await readUploadedFile(`/uploads/${rel}`);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
