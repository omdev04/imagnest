# Telephoto

Telephoto is a Next.js 16 App Router application that stores metadata in MongoDB and media in Telegram, with a custom CDN route for image delivery.

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`.

## Cloudflare Workers Deployment

This repository is configured to deploy through OpenNext on Cloudflare Workers.

### 1. Install dependencies

```bash
npm install
```

### 2. Authenticate Wrangler

```bash
npx wrangler login
```

### 3. Configure environment variables

Set the same secrets you currently use locally in the Cloudflare Worker settings or via Wrangler secrets, especially:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHANNEL_ID`
- `TELEGRAM_BOT_TOKEN_1`
- `TELEGRAM_CHANNEL_ID_1`
- `TELEGRAM_BOT_TOKEN_2`
- `TELEGRAM_CHANNEL_ID_2`

Example:

```bash
npx wrangler secret put MONGODB_URI
npx wrangler secret put NEXTAUTH_SECRET
```

### 4. Build for Workers

```bash
npm run build:worker
```

### 5. Preview locally on the Cloudflare runtime

```bash
npm run preview:worker
```

### 6. Deploy

```bash
npm run deploy:worker
```

## Runtime Notes

- The image CDN path no longer depends on local disk caching when running on Cloudflare. It uses the Workers cache instead.
- Image resizing now relies on Cloudflare image transformations in production. Local development falls back to serving the original Telegram asset.
- Telegram uploads and bot operations now use direct Bot API `fetch` calls instead of `node-telegram-bot-api`, which makes the Worker runtime compatible.
- MongoDB access still uses Mongoose. You should use a MongoDB deployment reachable from Cloudflare Workers, such as MongoDB Atlas or another public endpoint with network access.# telegramcdn
