# Krish Sarkar — Creative Portfolio

A cinematic creative-developer portfolio built with Next.js, React, Three.js / React Three Fiber, GSAP, Lenis and Supabase.

## Included

- Original Awwwards-style art direction and motion language
- Procedural WebGL hero scene with orbital geometry, floating UI panels, particles, pointer response and scroll response
- GSAP + Lenis cinematic scroll choreography, text reveals, parallax, hover tilt, magnetic controls and reactive cursor
- Responsive navigation and reduced-motion fallback
- Supabase-powered Content Studio at \`/admin\`
- Protected CMS authentication and server-side writes
- CMS-driven homepage, project case studies, experience, services and socials
- Idempotent Supabase schema and seed data in \`supabase/schema.sql\`

## CMS setup

1. Create a dedicated Supabase project for the portfolio.
2. Run \`supabase/schema.sql\` in the Supabase SQL editor.
3. Create an admin email/password user in Supabase Auth.
4. Set these environment variables locally and in Vercel:

\`\`\`env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
PORTFOLIO_ADMIN_EMAILS=you@example.com
\`\`\`

\`PORTFOLIO_ADMIN_EMAILS\` is a comma-separated allowlist. Keep \`SUPABASE_SECRET_KEY\` server-only.

Open \`/admin/login\` or \`/admin\` after the Auth user exists. Without CMS environment variables, the public site automatically falls back to the built-in portfolio content.

## Development

\`\`\`bash
npm install
npm run dev
npm run typecheck
npm run build
\`\`\`
