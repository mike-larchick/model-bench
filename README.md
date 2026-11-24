# Model Bench

**Model Bench** is a side-by-side AI model comparison tool built with Next.js and the [OpenRouter](https://openrouter.ai) API. Enter a single prompt and instantly compare responses, latency, token usage, and estimated cost across up to three models — GPT-4o, Claude 3.5 Sonnet, Llama 3.1 70B, Gemini Flash, and more — all in one clean, dark-themed interface.

[Live Demo](https://model-bench.vercel.app)

---

## Tech Stack

- **[Next.js](https://nextjs.org)** (App Router, TypeScript)
- **[Tailwind CSS](https://tailwindcss.com)** (v4, dark theme)
- **[Auth.js / NextAuth.js v5](https://authjs.dev)** — GitHub OAuth
- **[OpenRouter API](https://openrouter.ai/docs)** — unified API for 100+ LLMs
- **[Vercel](https://vercel.com)** — deployment

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/model-bench.git
cd model-bench
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Then fill in the values in `.env.local`:

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Get from [openrouter.ai/keys](https://openrouter.ai/keys) |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

**Creating a GitHub OAuth App:**
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and generate a Client Secret

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local.example` in the Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://model-bench.vercel.app`)
5. Update the GitHub OAuth App's callback URL to `https://your-domain.vercel.app/api/auth/callback/github`
6. Deploy 🚀

---

## Project Structure

```
model-bench/
  app/
    page.tsx                  # Landing page with sign-in
    layout.tsx                # Root layout with SessionProvider
    api/
      auth/[...nextauth]/
        route.ts              # NextAuth route handler
      compare/
        route.ts              # POST: fires parallel OpenRouter requests
    playground/
      page.tsx                # Auth-protected comparison UI
  components/
    ModelSelector.tsx         # Dropdown to pick a model
    PromptInput.tsx           # Textarea + submit button
    ResponseCard.tsx          # Response text, latency, tokens, cost
    ComparisonGrid.tsx        # Lays out 2–3 ResponseCards side by side
  lib/
    openrouter.ts             # OpenRouter API client
    models.ts                 # Curated model list with pricing
  types/
    index.ts                  # Shared TypeScript types
  auth.ts                     # NextAuth config
  middleware.ts               # Protects /playground route
  .env.local.example          # Required environment variables
```
