// netlify/functions/lead.js

const TG_API_BASE = "https://api.telegram.org";

function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

function safeString(v) {
  return String(v ?? "").trim();
}

function decodeBody(event) {
  // Netlify sometimes passes base64-encoded body
  const raw = event.body || "";
  if (event.isBase64Encoded) {
    try {
      return Buffer.from(raw, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
  return raw;
}

function parseBody(event) {
  const bodyStr = decodeBody(event);

  const ct =
    (event.headers?.["content-type"] ||
      event.headers?.["Content-Type"] ||
      "") + "";
  const contentType = ct.toLowerCase();

  // Try JSON
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyStr || "{}") || {};
    } catch {
      return {};
    }
  }

  // Try form-urlencoded
  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const params = new URLSearchParams(bodyStr || "");
      return Object.fromEntries(params.entries());
    } catch {
      return {};
    }
  }

  // Fallback: try JSON anyway, otherwise empty
  try {
    return JSON.parse(bodyStr || "{}") || {};
  } catch {
    return {};
  }
}

function buildText(payload) {
  const name = safeString(payload.name);
  const phone = safeString(payload.phone);
  const problem = safeString(payload.problem);

  const pageUrl = safeString(payload.page_url || payload.pageUrl || payload.url);
  const utm_source = safeString(payload.utm_source);
  const utm_medium = safeString(payload.utm_medium);
  const utm_campaign = safeString(payload.utm_campaign);
  const utm_content = safeString(payload.utm_content);
  const utm_term = safeString(payload.utm_term);
  const gclid = safeString(payload.gclid);

  const lines = [];
  lines.push("🔥 NEW LEAD");
  lines.push("");
  lines.push(`Name: ${name || "-"}`);
  lines.push(`Phone: ${phone || "-"}`);
  lines.push("");
  lines.push("Problem:");
  lines.push(problem || "-");
  lines.push("");
  lines.push(`Page: ${pageUrl || "-"}`);
  lines.push("");
  lines.push("UTM:");
  lines.push(`${utm_source || "-"} / ${utm_medium || "-"} / ${utm_campaign || "-"}`);
  lines.push(`content: ${utm_content || "-"}`);
  lines.push(`term: ${utm_term || "-"}`);
  lines.push(`gclid: ${gclid || "-"}`);

  return lines.join("\n");
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed. Use POST." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return json(500, {
      ok: false,
      error: "Missing env vars. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Netlify.",
    });
  }

  const payload = parseBody(event);

  const name = safeString(payload.name);
  const phone = safeString(payload.phone);
  const problem = safeString(payload.problem);

  // Минимальная валидация — можно ослабить, если нужно
  if (!name || !phone || !problem) {
    return json(400, {
      ok: false,
      error: "Required fields: name, phone, problem",
      received: {
        name: !!name,
        phone: !!phone,
        problem: !!problem,
      },
    });
  }

  const text = buildText(payload);

  try {
    const url = `${TG_API_BASE}/bot${token}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const out = await resp.json().catch(() => ({}));

    // Если Telegram отказал — вернём причину (очень помогает дебажить)
    if (!resp.ok || !out.ok) {
      return json(502, {
        ok: false,
        error: "Telegram send failed",
        status: resp.status,
        telegram: out, // тут обычно будет "chat not found", "bot was blocked", "not enough rights", etc.
      });
    }

    return json(200, { ok: true });
  } catch (e) {
    return json(500, {
      ok: false,
      error: "Server error",
      details: String(e?.message || e),
    });
  }
};