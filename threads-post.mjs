#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const API_BASE = "https://graph.threads.net/v1.0";

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    text: "",
    file: "",
    topicTag: "",
    linkAttachment: "",
    replyControl: "",
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--text") {
      args.text = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--file") {
      args.file = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--topic") {
      args.topicTag = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--link") {
      args.linkAttachment = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--reply-control") {
      args.replyControl = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      printHelpAndExit(0);
    }
    console.error(`Unknown argument: ${token}`);
    printHelpAndExit(1);
  }

  return args;
}

function printHelpAndExit(code) {
  console.log(`
Usage:
  node threads-post.mjs --text "Your post"
  node threads-post.mjs --file ./post.txt

Options:
  --text "<text>"                Post text.
  --file "<path>"                Read post text from file.
  --topic "<topic_tag>"          Optional topic tag.
  --link "<url>"                 Optional link attachment URL.
  --reply-control "<value>"      everyone | accounts_you_follow | mentioned_only | parent_post_author_only | followers_only
  --dry-run                      Validate and print payload only.
  -h, --help                     Show help.

Environment variables (.env):
  THREADS_USER_ID=<your_threads_user_id>
  THREADS_ACCESS_TOKEN=<your_threads_user_access_token>
`);
  process.exit(code);
}

function getPostText(args) {
  let text = args.text;
  if (!text && args.file) {
    const filePath = path.resolve(process.cwd(), args.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Text file not found: ${filePath}`);
    }
    text = fs.readFileSync(filePath, "utf8");
  }
  text = (text || "").trim();
  if (!text) {
    throw new Error("Post text is empty. Use --text or --file.");
  }
  return text;
}

function validate(text, args) {
  const byteLength = Buffer.byteLength(text, "utf8");
  if (byteLength > 500) {
    throw new Error(
      `Text is too long for Threads text post: ${byteLength} bytes (max 500 bytes).`
    );
  }

  if (args.topicTag && /[&.]/.test(args.topicTag)) {
    throw new Error("Topic tag cannot contain '&' or '.'.");
  }

  const allowedReplyControls = new Set([
    "",
    "everyone",
    "accounts_you_follow",
    "mentioned_only",
    "parent_post_author_only",
    "followers_only",
  ]);
  if (!allowedReplyControls.has(args.replyControl)) {
    throw new Error(
      "Invalid --reply-control value. See --help for allowed values."
    );
  }
}

async function postForm(pathname, form, label) {
  const url = `${API_BASE}${pathname}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `${label} failed (${response.status}): ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv);
  const text = getPostText(args);
  validate(text, args);

  const userId = process.env.THREADS_USER_ID;
  const accessToken = process.env.THREADS_ACCESS_TOKEN;

  if (!userId || !accessToken) {
    throw new Error(
      "Missing THREADS_USER_ID or THREADS_ACCESS_TOKEN in environment."
    );
  }

  const createPayload = {
    media_type: "TEXT",
    text,
    access_token: accessToken,
  };

  if (args.topicTag) createPayload.topic_tag = args.topicTag;
  if (args.linkAttachment) createPayload.link_attachment = args.linkAttachment;
  if (args.replyControl) createPayload.reply_control = args.replyControl;

  if (args.dryRun) {
    console.log("Dry run. Payload is valid.");
    console.log(JSON.stringify({ userId, createPayload }, null, 2));
    return;
  }

  const createResult = await postForm(
    `/${encodeURIComponent(userId)}/threads`,
    createPayload,
    "Create media container"
  );

  if (!createResult.id) {
    throw new Error(`Container ID missing: ${JSON.stringify(createResult)}`);
  }

  const publishResult = await postForm(
    `/${encodeURIComponent(userId)}/threads_publish`,
    {
      creation_id: createResult.id,
      access_token: accessToken,
    },
    "Publish media container"
  );

  console.log("Published successfully.");
  console.log(JSON.stringify(publishResult, null, 2));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
