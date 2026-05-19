This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

For local auth, copy `.env.local.example` to `.env.local` and set `AUTH_SECRET` to a random value. Auth.js requires this secret before `auth()`, `signIn()`, or `signOut()` can run.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Codebound Game Structure

The first Phaser slice lives under `src/` so game code stays separate from React route code:

- `src/app/game/page.tsx` renders the `/game` route.
- `src/components/game/GameCanvas.tsx` owns client-side Phaser mounting and teardown.
- `src/game/phaser/scenes/` contains Phaser scenes such as `GameScene`.
- `src/game/phaser/objects/` is reserved for reusable Phaser game objects.
- `src/game/phaser/systems/` is reserved for reusable game-loop systems.
- `src/data/` contains static game config, including languages, enemies, and concepts.
- `src/types/` contains shared TypeScript types for game data and systems.
