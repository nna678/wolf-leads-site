// netlify/functions/lead.js
const nodemailer = require("nodemailer");

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

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyStr || "{}") || {};
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const params = new URLSearchParams(bodyStr || "");
      return Object.fromEntries(params.entries());
    } catch {
      return {};
    }
  }

  try {
    return JSON.parse(bodyStr || "{}") || {};
  } catch {
    return {};
  }
}

function buildText(p) {
  // Поддержка и твоего теста из консоли, и формы из index.html
  const name = safeString(p.name || p.full_name || p.customer_name || "");
  const phone = safeString(p.phone || "");
  const email = safeString(p.email || "");
  const address = safeString(p.address || "");
  const zip = safeString(p.zip || "");
  const appliance = safeString(p.appliance || "");
  const applianceAge = safeString(p.applianceAge || p["appliance-age"] || "");
  const issue = safeString(p.issue || p.problem || "");
  const time = safeString(p.time_label || p.time || "");
  const location = safeString(p.location || "");
  const feeAck = p.fee_acknowledged === true || p.fee_acknowledged === "true" || p.fee_acknowledged === "1";
  const consent = p.consent_accepted === true || p.consent_accepted === "true" || p.consent_accepted === "1";
  const pageUrl = safeString(p.page_url || p.pageUrl || p.url || "");
  const utm_source = safeString(p.utm_source || "");
  const utm_medium = safeString(p.utm_medium || "");
  const utm_campaign = safeString(p.utm_campaign || "");
  const utm_content = safeString(p.utm_content || "");
  const utm_term = safeString(p.utm_term || "");
  const gclid = safeString(p.gclid || "");
  const kw = safeString(p.kw || p.keyword || "");
  const priority = safeString(p.priority || (String(p.time || "") === "asap" ? "High" : "Normal"));
  const leadSource = `${utm_source || "-"} / ${utm_medium || "-"} / ${utm_campaign || "-"}`;
  const timestampLocal = safeString(p.timestamp_local || "") || new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const timeZone = safeString(p.timezone || "");

  const lines = [];
  lines.push("NEW SERVICE REQUEST");
  lines.push(`Name: ${name || "-"}`);
  lines.push(`Phone: ${phone || "-"}`);
  lines.push(`Email: ${email || "-"}`);
  lines.push(`Address: ${address || "-"}`);
  lines.push(`ZIP: ${zip || "-"}`);
  lines.push(`Geo: ${location || "-"}`);
  lines.push(`Appliance: ${appliance || "-"}`);
  lines.push(`Appliance age: ${applianceAge || "-"}`);
  lines.push(`Issue: ${issue || "-"}`);
  lines.push(`Preferred time: ${time || "-"}`);
  lines.push(`Service fee acknowledged: ${feeAck ? "Yes" : "No"}`);
  lines.push(`Consent accepted: ${consent ? "Yes" : "No"}`);
  lines.push(`Priority: ${priority || "-"}`);
  lines.push("");
  lines.push("UTM:");
  lines.push(`utm_source: ${utm_source || "-"}`);
  lines.push(`utm_medium: ${utm_medium || "-"}`);
  lines.push(`utm_campaign: ${utm_campaign || "-"}`);
  lines.push(`utm_content: ${utm_content || "-"}`);
  lines.push(`utm_term: ${utm_term || "-"}`);
  lines.push(`gclid: ${gclid || "-"}`);
  lines.push(`kw: ${kw || "-"}`);
  lines.push("");
  lines.push(`Local time: ${timestampLocal}${timeZone ? ` (${timeZone})` : ""}`);
  lines.push(`Page: ${pageUrl || "-"}`);

  return lines.join("\n");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true, reason: "No TELEGRAM vars" };

  const url = `${TG_API_BASE}/bot${token}/sendMessage`;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      const out = await resp.json().catch(() => ({}));
      if (!resp.ok || !out.ok) {
        if (attempt < 2) {
          await delay(400);
          continue;
        }
        return { ok: false, status: resp.status, telegram: out };
      }
      return { ok: true };
    } catch (e) {
      if (attempt < 2) {
        await delay(400);
        continue;
      }
      return { ok: false, error: String(e?.message || e) };
    } finally {
      clearTimeout(timeoutId);
    }
  }
  return { ok: false, error: "Telegram send failed" };
}

async function sendEmail(text) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEADS_EMAIL_TO;

  if (!host || !user || !pass || !to) {
    return { ok: false, skipped: true, reason: "No SMTP vars" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465=true, 587=false
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });

  const info = await transporter.sendMail({
    from: `"Website Leads" <${user}>`,
    to,
    subject: "New Service Request (Website)",
    text,
  });

  return { ok: true, messageId: info.messageId };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  if (event.httpMethod === "GET") {
    return json(200, { ok: true, service: "lead", time: new Date().toISOString() });
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed. Use POST." });
  }

  const payload = parseBody(event);

  // Минимум — телефон. Остальное можно пустым.
  const phone = safeString(payload.phone);
  if (!phone) {
    return json(400, { ok: false, error: "Required field: phone" });
  }

  const text = buildText(payload);

  try {
    // Пытаемся отправить в оба канала, и возвращаем подробный отчёт
    const [tg, mail] = await Promise.allSettled([sendTelegram(text), sendEmail(text)]);

    const tgRes = tg.status === "fulfilled" ? tg.value : { ok: false, error: String(tg.reason) };
    const mailRes = mail.status === "fulfilled" ? mail.value : { ok: false, error: String(mail.reason) };

    // Успех только если улетело и в Telegram, и на email
    const bothOk = !!(tgRes.ok && mailRes.ok);

    const summary = {
      zip: safeString(payload.zip || ""),
      appliance: safeString(payload.appliance || ""),
      time: safeString(payload.time_label || payload.time || ""),
      priority: safeString(payload.priority || (String(payload.time || "") === "asap" ? "High" : "Normal")),
      utm_source: safeString(payload.utm_source || ""),
      utm_medium: safeString(payload.utm_medium || ""),
      utm_campaign: safeString(payload.utm_campaign || ""),
      kw: safeString(payload.kw || payload.keyword || ""),
    };
    console.info("Lead summary", summary);

    const errorDetails = [];
    if (!tgRes.ok) {
      const reason = tgRes.reason || tgRes.error || tgRes.telegram?.description || "Telegram failed";
      errorDetails.push(`telegram: ${reason}`);
    }
    if (!mailRes.ok) {
      const reason = mailRes.reason || mailRes.error || "Email failed";
      errorDetails.push(`email: ${reason}`);
    }

    if (!bothOk) {
      console.error("Lead send failed", { telegram: tgRes, email: mailRes });
    }

    return json(bothOk ? 200 : 502, {
      ok: bothOk,
      telegram: tgRes,
      email: mailRes,
      error: bothOk ? undefined : `Lead send failed: ${errorDetails.join(" | ")}`,
    });
  } catch (e) {
    console.error("Lead handler error", e);
    return json(500, { ok: false, error: "Server error", details: String(e?.message || e) });
  }
};