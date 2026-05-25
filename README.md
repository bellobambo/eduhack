This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Create a local env file with your OpenAI key:

```bash
OPENAI_API_KEY=your_key_here
# Optional: override the default model
OPENAI_MODEL=gpt-4.1-mini
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Endpoints

### `GET /`

Shows a simple documentation page for users. It lists the available endpoints,
what each endpoint does, what it accepts, and what it returns. It also includes
an upload tester for the question generation endpoint.

### `POST /api/upload`

Uploads study material and generates multiple-choice exam questions from it.

Accepts form data:

```txt
file: File                    # required, .txt/.pdf/.docx
questionCount: 5              # optional, defaults to 5
description: "Week 3 biology" # optional context for the uploaded file
```

`context` is also accepted as an alias for `description`.

Returns:

```json
{
  "result": "Generated multiple-choice questions..."
}
```

### `POST /api/explain`

Explains a student's answer with short AI tutor feedback.

Accepts JSON:

```json
{
  "question": "What is photosynthesis?",
  "selectedAnswer": "Plants taking in oxygen",
  "correctAnswer": "Plants converting light energy into chemical energy",
  "context": "Optional lesson notes or topic context"
}
```

`answer` is also accepted as an alias for `selectedAnswer`.

It returns:

```json
{
  "explanation": "..."
}
```

### `OPTIONS /api/upload` and `OPTIONS /api/explain`

Supports CORS preflight requests for browser clients.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
