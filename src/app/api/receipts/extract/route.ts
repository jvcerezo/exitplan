import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_OCR_PAYLOAD_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const ocrRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function parseClientAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

function consumeRateLimit(identifier: string) {
  const now = Date.now();
  const existing = ocrRateLimitStore.get(identifier);

  if (!existing || existing.resetAt <= now) {
    ocrRateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  ocrRateLimitStore.set(identifier, existing);
  return { allowed: true, retryAfterSeconds: 0 };
}

function estimateBase64Bytes(base64: string) {
  const normalized = base64.replace(/\s+/g, "");
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}

function isAllowedFileName(fileName: string) {
  return /^[a-zA-Z0-9._-]{1,120}$/.test(fileName);
}

function isAllowedContentType(contentType: string) {
  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
  ]);
  return allowed.has(contentType);
}

function decodeBase64(base64: string) {
  return Buffer.from(base64, "base64");
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

async function extractWithOcrSpace(base64: string, fileName: string) {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const formData = new FormData();
  formData.append("apikey", apiKey);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("filetype", fileName.split(".").pop() ?? "png");
  formData.append("base64Image", `data:image/png;base64,${base64}`);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("OCR service request failed");
  }

  const json = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (json.IsErroredOnProcessing) {
    throw new Error(json.ErrorMessage?.join(" ") || "OCR processing failed");
  }

  const text = (json.ParsedResults ?? [])
    .map((entry) => entry.ParsedText ?? "")
    .join("\n")
    .trim();

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ warning: "Unauthorized" }, { status: 401 });
    }

    const clientAddress = parseClientAddress(request);
    const rateLimitResult = consumeRateLimit(`${user.id}:${clientAddress}`);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { warning: "Too many OCR requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        }
      );
    }

    const body = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      fileBase64?: string;
    };

    if (!body.fileName || !body.fileBase64) {
      return NextResponse.json(
        { warning: "Missing OCR file payload" },
        { status: 400 }
      );
    }

    const fileName = body.fileName.trim();
    if (!isAllowedFileName(fileName)) {
      return NextResponse.json(
        { warning: "Invalid file name" },
        { status: 400 }
      );
    }

    const contentType = (body.contentType ?? "application/octet-stream").trim().toLowerCase();
    if (!isAllowedContentType(contentType)) {
      return NextResponse.json(
        { warning: "Unsupported file type" },
        { status: 400 }
      );
    }

    const estimatedBytes = estimateBase64Bytes(body.fileBase64);
    if (estimatedBytes <= 0 || estimatedBytes > MAX_OCR_PAYLOAD_BYTES) {
      return NextResponse.json(
        { warning: "OCR payload exceeds allowed size" },
        { status: 413 }
      );
    }

    if (contentType.startsWith("text/") || fileName.endsWith(".csv")) {
      const raw = decodeBase64(body.fileBase64).toString("utf-8");
      return NextResponse.json({ text: normalizeText(raw) });
    }

    const ocrText = await extractWithOcrSpace(body.fileBase64, fileName);
    if (ocrText !== null) {
      return NextResponse.json({ text: normalizeText(ocrText) });
    }

    return NextResponse.json(
      {
        warning:
          "OCR provider is not configured. Set OCR_SPACE_API_KEY to auto-process image/PDF OCR jobs.",
      },
      { status: 422 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        warning:
          error instanceof Error
            ? error.message
            : "Failed to process OCR extraction",
      },
      { status: 500 }
    );
  }
}
