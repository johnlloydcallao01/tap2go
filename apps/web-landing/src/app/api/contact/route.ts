import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 12_000;

function getCmsContactUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cms.tap2goph.com/api"
      : "http://localhost:3001/api");
  const url = new URL(apiBase);
  const path = url.pathname.replace(/\/+$/, "");
  url.pathname = `${path.endsWith("/api") ? path : `${path}/api`}/website/contact`;
  return url.toString();
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let originUrl: URL;
  try {
    if (!origin) throw new Error("Missing origin");
    originUrl = new URL(origin);
  } catch {
    return NextResponse.json({ error: "Please submit the form from this website." }, { status: 403 });
  }
  if (originUrl.origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Please submit the form from this website." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Please submit a valid contact form." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Please submit a valid contact form." }, { status: 400 });
  }

  const forwardedIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (forwardedIp) headers.set("X-Forwarded-For", forwardedIp);

  try {
    const response = await fetch(getCmsContactUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);
      const error =
        errorBody && typeof errorBody === "object" && "error" in errorBody &&
        typeof errorBody.error === "string"
          ? errorBody.error
          : "We could not send your message right now. Please try again later.";
      const status = [400, 429, 503].includes(response.status) ? response.status : 502;
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. We’ll be in touch as soon as we can.",
    });
  } catch (error) {
    console.error(
      "[contact-form] CMS request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
}
