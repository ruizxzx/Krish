import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CONTENT, type SiteContent, type Project, type Accent, type ProfileMedia } from '@/lib/content';

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

function publicClient() {
  if (!isConfigured) return null;
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) return null;
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function cmsEnabled() { return Boolean(publicClient()); }
export function cmsAdminConfigured() { return Boolean(adminClient() && process.env.PORTFOLIO_ADMIN_EMAILS); }

function csv(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
}

export async function getPortfolioContent(): Promise<SiteContent> {
  const supabase = publicClient();
  if (!supabase) return DEFAULT_CONTENT;
  try {
    const [{ data: site }, { data: projects }, { data: experience }, { data: services }, { data: socials }] = await Promise.all([
      supabase.from('portfolio_site').select('*').eq('id', 'default').maybeSingle(),
      supabase.from('portfolio_projects').select('*').order('sort_index', { ascending: true }),
      supabase.from('portfolio_experience').select('*').order('sort_index', { ascending: true }),
      supabase.from('portfolio_services').select('*').order('sort_index', { ascending: true }),
      supabase.from('portfolio_socials').select('*').order('sort_index', { ascending: true }),
    ]);

    if (!site && !projects?.length && !experience?.length && !services?.length && !socials?.length) return DEFAULT_CONTENT;

    const mappedProjects: Project[] = (projects?.length ? projects : DEFAULT_CONTENT.projects).map((p: Record<string, unknown>, i: number) => ({
      id: String(p.id ?? p.slug ?? i),
      slug: String(p.slug ?? ''),
      index: String(p.sort_index ?? String(i + 1).padStart(2, '0')).padStart(2, '0'),
      title: String(p.title ?? ''), eyebrow: String(p.eyebrow ?? ''), category: String(p.category ?? ''), year: String(p.year ?? ''),
      status: String(p.status ?? ''), role: String(p.role ?? ''), stack: String(p.stack ?? ''), intro: String(p.intro ?? ''), short: String(p.short ?? ''),
      accent: String(p.accent ?? 'acid') as Accent, metricLabel: String(p.metric_label ?? ''), metricValue: String(p.metric_value ?? ''),
      liveUrl: p.live_url ? String(p.live_url) : undefined, repoUrl: p.repo_url ? String(p.repo_url) : undefined,
      featured: Boolean(p.featured),
      media: Array.isArray(p.media)
        ? p.media
            .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && typeof (item as Record<string, unknown>).src === 'string')
            .map((item, index) => ({
              id: String(item.id ?? index),
              type: item.type === 'video' ? 'video' as const : 'image' as const,
              src: String(item.src),
              alt: String(item.alt ?? ''),
              caption: item.caption ? String(item.caption) : undefined,
              poster: item.poster ? String(item.poster) : undefined,
              path: item.path ? String(item.path) : undefined,
              featured: Boolean(item.featured),
            }))
        : [],
      sections: Array.isArray(p.sections) ? p.sections as Project['sections'] : [],
    }));

    const profileMedia: ProfileMedia | undefined =
      site?.profile_media &&
      typeof site.profile_media === 'object' &&
      !Array.isArray(site.profile_media) &&
      typeof (site.profile_media as Record<string, unknown>).src === 'string'
        ? {
            src: String((site.profile_media as Record<string, unknown>).src),
            path: typeof (site.profile_media as Record<string, unknown>).path === 'string'
              ? String((site.profile_media as Record<string, unknown>).path)
              : undefined,
            alt: typeof (site.profile_media as Record<string, unknown>).alt === 'string'
              ? String((site.profile_media as Record<string, unknown>).alt)
              : 'Krish Sarkar',
          }
        : undefined;

    return {
      ...DEFAULT_CONTENT,
      ...(site ? {
        displayName: String(site.display_name ?? DEFAULT_CONTENT.displayName),
        navLabel: String(site.nav_label ?? DEFAULT_CONTENT.navLabel),
        heroKicker: String(site.hero_kicker ?? DEFAULT_CONTENT.heroKicker),
        heroTitle: [String(site.hero_title_a ?? DEFAULT_CONTENT.heroTitle[0]), String(site.hero_title_b ?? DEFAULT_CONTENT.heroTitle[1]), String(site.hero_title_c ?? DEFAULT_CONTENT.heroTitle[2])] as SiteContent['heroTitle'],
        heroBody: String(site.hero_body ?? DEFAULT_CONTENT.heroBody), heroMeta: String(site.hero_meta ?? DEFAULT_CONTENT.heroMeta),
        location: String(site.location ?? DEFAULT_CONTENT.location), availability: String(site.availability ?? DEFAULT_CONTENT.availability),
        marquee: String(site.marquee ?? DEFAULT_CONTENT.marquee), introKicker: String(site.intro_kicker ?? DEFAULT_CONTENT.introKicker),
        introTitle: String(site.intro_title ?? DEFAULT_CONTENT.introTitle), introBody: String(site.intro_body ?? DEFAULT_CONTENT.introBody),
        aboutKicker: String(site.about_kicker ?? DEFAULT_CONTENT.aboutKicker), aboutTitle: String(site.about_title ?? DEFAULT_CONTENT.aboutTitle),
        aboutBody: String(site.about_body ?? DEFAULT_CONTENT.aboutBody), contactKicker: String(site.contact_kicker ?? DEFAULT_CONTENT.contactKicker),
        contactTitle: String(site.contact_title ?? DEFAULT_CONTENT.contactTitle), contactBody: String(site.contact_body ?? DEFAULT_CONTENT.contactBody),
        contactEmail: String(site.contact_email ?? DEFAULT_CONTENT.contactEmail), footerNote: String(site.footer_note ?? DEFAULT_CONTENT.footerNote),
        motion: { ...DEFAULT_CONTENT.motion, ...(site.motion ?? {}) },
        profileMedia,
      } : {}),
      projects: mappedProjects,
      experience: (experience?.length ? experience : DEFAULT_CONTENT.experience).map((x: Record<string, unknown>, i: number) => ({
        id: String(x.id ?? i), year: String(x.year ?? ''), company: String(x.company ?? ''), role: String(x.role ?? ''), description: String(x.description ?? ''),
      })),
      services: (services?.length ? services : DEFAULT_CONTENT.services).map((x: Record<string, unknown>, i: number) => ({
        id: String(x.id ?? i), index: String(x.sort_index ?? String(i + 1).padStart(2, '0')).padStart(2, '0'), title: String(x.title ?? ''), description: String(x.description ?? ''), tags: csv(x.tags),
      })),
      socials: (socials?.length ? socials : DEFAULT_CONTENT.socials).map((x: Record<string, unknown>, i: number) => ({
        id: String(x.id ?? i), label: String(x.label ?? ''), url: String(x.url ?? ''),
      })),
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

function allowedEmail(email: string | undefined | null) {
  const list = (process.env.PORTFOLIO_ADMIN_EMAILS ?? '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}

export async function requirePortfolioAdmin() {
  const supabase = adminClient();
  if (!supabase) throw new Error('CMS server configuration is missing.');
  const { getClaims } = await import('@/lib/supabase/server');
  const claims = await getClaims();
  const email = typeof claims?.email === 'string' ? claims.email : undefined;
  if (!allowedEmail(email)) throw new Error('Not authorized.');
  return supabase;
}

export function portfolioAdminEmailHint() {
  return (process.env.PORTFOLIO_ADMIN_EMAILS ?? '').split(',').map((v) => v.trim()).filter(Boolean).join(', ');
}
