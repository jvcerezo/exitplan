import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
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

    const contentType = body.contentType ?? "application/octet-stream";

    if (contentType.startsWith("text/") || body.fileName.endsWith(".csv")) {
      const raw = decodeBase64(body.fileBase64).toString("utf-8");
      return NextResponse.json({ text: normalizeText(raw) });
    }

    const ocrText = await extractWithOcrSpace(body.fileBase64, body.fileName);
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
