# Senior Project Site

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Framework**: [Next.js 15.5.3](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **React**: 19.1.0
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Validation**: [Zod](https://zod.dev) for runtime validation and type inference
- **Authentication**: JWT-based auth with httpOnly cookies

## Project Setup

This project has been configured with:

### Tailwind CSS
- Tailwind CSS v4 with PostCSS
- Provides pre-built CSS classes like `flex`, `pt-4`, `text-center` to style elements directly in HTML
- [Tailwind Documentation](https://tailwindcss.com/docs)

### shadcn/ui
- Ready-to-use React components (buttons, forms, modals, etc.)
- Components you can copy and customize directly in your project
- Built for accessibility and customization
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)

#### Supporting Libraries
- **lucide-react**: SVG icon library ([Browse icons](https://lucide.dev/icons))
- **class-variance-authority**: Helps create component variations (e.g., button sizes/colors)
- **clsx & tailwind-merge**: Tools for managing CSS classes in components

### Database (Drizzle ORM + Neon PostgreSQL)
- **Drizzle ORM**: Type-safe database queries with full TypeScript support
- **Neon**: Serverless PostgreSQL
- Database schema is defined in `src/db/schema.ts`

#### Database Commands
- `npm run db:generate` - Generate migrations after schema changes
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio to view/edit data

### AI Theme Generator
- Powered by the [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/react`, and `@ai-sdk/openai`) configured to call [OpenRouter](https://openrouter.ai/)
- Set `OPENROUTER_API_KEY` in `.env` (optionally override the defaults with `OPENROUTER_THEME_MODEL`, `OPENROUTER_SITE_URL`, etc.)
- The Advanced Theme Editor's **Generate** tab streams chat responses via `/api/theme-generator`, which returns a complete theme payload through a tool call
- When the tool call finishes, the preview automatically applies the generated colors, fonts, and spacing so you can fine-tune them in the other tabs

## Getting Started

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
