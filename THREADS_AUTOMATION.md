# Threads posting automation

This project can publish Threads posts directly from terminal using the official Threads API.

## 1) Setup

1. Copy `threads.env.example` to `.env`.
2. Fill these values in `.env`:
   - `THREADS_USER_ID`
   - `THREADS_ACCESS_TOKEN`

Your app and token should have Threads API permissions for publishing.

## 2) Quick start

Post from inline text:

`npm run threads:post -- --text "Bali AI breakfast today at 10:00. Who is in?"`

Post from file:

`npm run threads:post -- --file ./post.txt`

Dry run without network call:

`npm run threads:post -- --text "Test post" --dry-run`

## 3) Optional flags

- `--topic "<topic_tag>"`
- `--link "<url>"`
- `--reply-control "<value>"`

Allowed `--reply-control` values:

- `everyone`
- `accounts_you_follow`
- `mentioned_only`
- `parent_post_author_only`
- `followers_only`

## 4) Notes

- Text posts are limited by Threads API to 500 UTF 8 bytes.
- Script creates a media container and then publishes it.
- Keep `.env` private.
