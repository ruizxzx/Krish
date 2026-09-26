export type Accent = 'acid' | 'violet' | 'cyan' | 'orange';

export type Project = {
  id: string;
  slug: string;
  index: string;
  title: string;
  eyebrow: string;
  category: string;
  year: string;
  status: string;
  role: string;
  stack: string;
  intro: string;
  short: string;
  accent: Accent;
  metricLabel: string;
  metricValue: string;
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  sections: { kicker: string; heading: string; body: string }[];
};

export type Experience = { id: string; year: string; company: string; role: string; description: string };
export type Service = { id: string; index: string; title: string; description: string; tags: string[] };
export type Social = { id: string; label: string; url: string };

export type SiteContent = {
  displayName: string;
  navLabel: string;
  heroKicker: string;
  heroTitle: [string, string, string];
  heroBody: string;
  heroMeta: string;
  location: string;
  availability: string;
  marquee: string;
  introKicker: string;
  introTitle: string;
  introBody: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutBody: string;
  contactKicker: string;
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  footerNote: string;
  projects: Project[];
  experience: Experience[];
  services: Service[];
  socials: Social[];
  motion: { enabled: boolean; intensity: number; webgl: boolean };
};

const makeProject = (project: Omit<Project, 'id'>): Project => ({ id: project.slug, ...project });

export const DEFAULT_CONTENT: SiteContent = {
  displayName: 'KRISH / 26',
  navLabel: 'Independent creative developer',
  heroKicker: 'Creative developer · engineer · product builder',
  heroTitle: ['I BUILD', 'DIGITAL', 'WORLDS.'],
  heroBody: 'I design and engineer digital products where systems, motion and visual identity become one experience.',
  heroMeta: 'NEXT.JS · REACT · THREE.JS · GSAP · SUPABASE',
  location: 'Kolkata / India',
  availability: 'Available for selected work',
  marquee: 'BUILD — BREAK — MOVE — REPEAT — BUILD — BREAK — MOVE — REPEAT —',
  introKicker: '01 / point of view',
  introTitle: 'Interfaces should not just work. They should leave a trace.',
  introBody: 'The best digital experiences use hierarchy, motion and interaction with restraint. I build products that are useful first, then unforgettable.',
  aboutKicker: '04 / about',
  aboutTitle: 'Engineer brain. Art direction eye.',
  aboutBody: 'My work lives between front-end engineering, product systems and visual experimentation. I care about the invisible layer: state, performance, content, timing and the tiny details that make an interface feel alive.',
  contactKicker: '06 / contact',
  contactTitle: 'LET’S MAKE SOMETHING MOVE.',
  contactBody: 'Product work, creative development, interaction systems and digital worlds.',
  contactEmail: 'hello@krish.dev',
  footerNote: 'Built with Next.js / Three.js / GSAP / Supabase',
  motion: { enabled: true, intensity: 1, webgl: true },
  projects: [
    makeProject({ slug: 'tablely', index: '01', title: 'TABLELY', eyebrow: 'Restaurant operating system', category: 'Product system', year: '2026', status: 'Building', role: 'Product / Full-stack', stack: 'Next.js · Supabase · Realtime', intro: 'A restaurant ordering operating system designed around the table, not the checkout page.', short: 'Sessions, carts, orders, payments and operator workflows in one live system.', accent: 'acid', metricLabel: 'SYSTEM STATE', metricValue: 'REALTIME', featured: true, sections: [{ kicker: '01 / idea', heading: 'Make the table the interface.', body: 'TABLELY treats the physical table as the primary context for ordering. Guest ordering, restaurant operations and payment state share one continuous experience.' }, { kicker: '02 / system', heading: 'State before decoration.', body: 'The architecture is explicit about sessions, visits and orders so realtime changes remain understandable across guests, staff and counters.' }, { kicker: '03 / result', heading: 'Less friction between intention and action.', body: 'The product removes duplicate handoffs and turns restaurant order flow into one coherent operating surface.' }] }),
    makeProject({ slug: 'instaly', index: '02', title: 'INSTALY', eyebrow: 'Creator commerce platform', category: 'Creator commerce', year: '2026', status: 'Building', role: 'Product / Full-stack', stack: 'Next.js · Supabase · Razorpay', intro: 'A creator storefront combining identity, link-in-bio, digital products and freelance services.', short: 'A creator operating layer: profile, storefront, marketplace, analytics and audience capture.', accent: 'violet', metricLabel: 'CREATOR SURFACES', metricValue: '01 → ∞', featured: true, sections: [{ kicker: '01 / identity', heading: 'One profile. Many surfaces.', body: 'INSTALY gives creators a flexible home for links, products, services, analytics and audience capture without making each feature feel bolted on.' }, { kicker: '02 / commerce', heading: 'Selling should feel native.', body: 'Discovery, checkout, digital delivery and creator-owned presentation share the same visual language.' }, { kicker: '03 / marketplace', heading: 'Products meet services.', body: 'A future-facing layer where creators can sell assets, packages and freelance offers from the same identity.' }] }),
    makeProject({ slug: 'offscrpt', index: '03', title: 'OFFSCRPT', eyebrow: 'Editorial digital commerce', category: 'Digital products', year: '2026', status: 'Concept', role: 'Brand / Interface', stack: 'React · Motion · Commerce', intro: 'A sharper storefront language for creators selling assets, templates, experiments and small digital objects.', short: 'An editorial commerce system that refuses to look like a template marketplace.', accent: 'cyan', metricLabel: 'ART DIRECTION', metricValue: 'EDITORIAL', featured: true, sections: [{ kicker: '01 / language', heading: 'Commerce can have a point of view.', body: 'OFFSCRPT explores a product layout where the storefront is part of the product story rather than a neutral wrapper.' }, { kicker: '02 / interaction', heading: 'Every click earns its motion.', body: 'Hover, scroll and transition effects reinforce hierarchy, discovery and intent instead of adding noise.' }, { kicker: '03 / rhythm', heading: 'Show less. Make it feel more.', body: 'A restrained visual system makes small digital objects feel collectible and deliberate.' }] }),
    makeProject({ slug: 'portfolio-lab', index: '04', title: 'PORTFOLIO LAB', eyebrow: 'Interaction laboratory', category: 'Experiments', year: '2026', status: 'Live system', role: 'Creative developer', stack: 'Three.js · GSAP · WebGL', intro: 'The portfolio itself as a laboratory for interaction, motion, typography and procedural graphics.', short: 'A living testbed for spatial UI, motion systems and browser-native 3D.', accent: 'orange', metricLabel: 'MOTION', metricValue: '∞', featured: false, sections: [{ kicker: '01 / principle', heading: 'The interface should move with intent.', body: 'Large type, spatial shifts and a responsive WebGL layer create a sense of depth without hiding the content.' }, { kicker: '02 / engineering', heading: 'Motion is infrastructure.', body: 'Animation primitives are centralized so interactions stay consistent across pages, sections and responsive states.' }, { kicker: '03 / experiment', heading: 'The browser becomes material.', body: 'The system treats the browser as a canvas for typography, geometry, timing and interaction.' }] }),
  ],
  experience: [
    { id: '1', year: '2025 — now', company: 'Independent', role: 'Creative developer / product builder', description: 'Building TABLELY, INSTALY and a growing library of interfaces, experiments and product systems.' },
    { id: '2', year: '2024 — 2025', company: 'Product experiments', role: 'Full-stack / interaction', description: 'Exploring creator commerce, realtime systems, payment flows and interaction-heavy product surfaces.' },
  ],
  services: [
    { id: '1', index: '01', title: 'Creative development', description: 'Premium front-end engineering for ambitious products and digital experiences.', tags: ['Next.js', 'React', 'TypeScript', 'WebGL'] },
    { id: '2', index: '02', title: 'Interaction systems', description: 'GSAP motion, scroll choreography, cursor systems, transitions and responsive behavior.', tags: ['GSAP', 'Lenis', 'Motion', '3D'] },
    { id: '3', index: '03', title: 'Product interfaces', description: 'Design-minded product work where flows, data, states and visual language ship together.', tags: ['UX', 'Systems', 'Realtime', 'CMS'] },
    { id: '4', index: '04', title: 'Digital worlds', description: 'WebGL scenes, procedural graphics and spatial interfaces that make the web feel physical.', tags: ['Three.js', 'R3F', 'Shaders', 'Interaction'] },
  ],
  socials: [{ id: '1', label: 'GitHub', url: 'https://github.com/ruizxzx' }, { id: '2', label: 'LinkedIn', url: 'https://www.linkedin.com/' }],
};

export const PROJECTS = DEFAULT_CONTENT.projects;
