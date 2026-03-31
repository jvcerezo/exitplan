import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook endpoint for Supabase Database Webhooks.
 * Triggered on INSERT to bug_reports table.
 * Sends a notification to Discord with the feedback details.
 *
 * Setup:
 * 1. Set DISCORD_WEBHOOK_URL in your Vercel environment variables
 * 2. Set WEBHOOK_SECRET in your Vercel environment variables
 * 3. In Supabase Dashboard → Database → Webhooks → Create:
 *    - Table: bug_reports
 *    - Events: INSERT
 *    - URL: https://your-domain.vercel.app/api/webhooks/new-feedback
 *    - Headers: { "x-webhook-secret": "<your WEBHOOK_SECRET>" }
 */

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const record = body.record;

    if (!record) {
      return NextResponse.json({ error: "No record" }, { status: 400 });
    }

    const title = record.title || "No title";
    const description = record.description || "No description";
    const status = record.status || "new";
    const createdAt = record.created_at
      ? new Date(record.created_at).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
        })
      : "Unknown";

    // Parse feedback type from title
    const typeMatch = title.match(/^\[(bug|suggestion|praise)\]/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "unknown";
    const emoji =
      type === "bug" ? "🐛" : type === "suggestion" ? "💡" : type === "praise" ? "💜" : "📋";

    // Parse rating from title
    const starMatch = title.match(/⭐+/);
    const rating = starMatch ? starMatch[0] : "";

    // Discord webhook
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordUrl) {
      const color =
        type === "bug" ? 0xdc2626 : type === "suggestion" ? 0x3b82f6 : type === "praise" ? 0x10b981 : 0x6b7280;

      await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `${emoji} New ${type.charAt(0).toUpperCase() + type.slice(1)} ${rating}`,
              description:
                description.length > 1000
                  ? description.slice(0, 1000) + "..."
                  : description,
              color,
              fields: [
                {
                  name: "Status",
                  value: status,
                  inline: true,
                },
                {
                  name: "Time",
                  value: createdAt,
                  inline: true,
                },
              ],
              footer: {
                text: "Sandalan Feedback",
              },
            },
          ],
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
