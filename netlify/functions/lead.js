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
  const time = safeString(p.time || "");
  const location = safeString(p.location || "");
  const pageUrl = safeString(p.page_url || p.pageUrl || p.url || "");
  const utm_source = safeString(p.utm_source || "");
  const utm_medium = safeString(p.utm_medium || "");
  const utm_campaign = safeString(p.utm_campaign || "");
  const utm_content = safeString(p.utm_content || "");
  const utm_term = safeString(p.utm_term || "");
  const gclid = safeString(p.gclid || "");

  const lines = [];
  lines.push("🔥 NEW LEAD");
  lines.push("");
  lines.push(`Name: ${name || "-"}`);
  lines.push(`Phone: ${phone || "-"}`);
  lines.push(`Email: ${email || "-"}`);
  lines.push("");
  lines.push("Service Location:");
  lines.push(`Address: ${address || "-"}`);
  lines.push(`ZIP: ${zip || "-"}`);
  lines.push(`Geo: ${location || "-"}`);
  lines.push("");
  lines.push("Appliance:");
  lines.push(`Type: ${appliance || "-"}`);
  lines.push(`Age: ${applianceAge || "-"}`);
  lines.push("");
  lines.push("Problem / Issue:");
  lines.push(issue || "-");
  lines.push("");
  lines.push(`Preferred time: ${time || "-"}`);
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

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true, reason: "No TELEGRAM vars" };

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
  if (!resp.ok || !out.ok) {
    return { ok: false, status: resp.status, telegram: out };
  }
  return { ok: true };
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

    // Успех если хоть куда-то улетело
    const anyOk = !!(tgRes.ok || mailRes.ok);

    return json(anyOk ? 200 : 502, {
      ok: anyOk,
      telegram: tgRes,
      email: mailRes,
    });
  } catch (e) {
    return json(500, { ok: false, error: "Server error", details: String(e?.message || e) });
  }
};