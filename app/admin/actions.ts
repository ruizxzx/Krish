'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePortfolioAdmin } from '@/lib/cms';
import { createClient } from '@/lib/supabase/server';

function text(formData: FormData, name: string) { return String(formData.get(name) ?? '').trim(); }

function adminErrorUrl(message: string) {
  const safe = message.replace(/\s+/g, ' ').trim().slice(0, 240);
  return '/admin?error=' + encodeURIComponent(safe);
}

function redirectDbError(operation: string, error: { message?: string; code?: string; details?: string; hint?: string }) {
  const parts = [operation, error.message, error.code ? `code=${error.code}` : '', error.details ? `details=${error.details}` : '', error.hint ? `hint=${error.hint}` : '']
    .filter(Boolean)
    .join(' — ');
  redirect(adminErrorUrl(parts));
}

function sections(value: string) {
  if (!value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error('Sections must be an array.');
    return parsed.map((item) => {
      if (!item || typeof item !== 'object') throw new Error('Invalid section.');
      const row = item as Record<string, unknown>;
      return { kicker: String(row.kicker ?? ''), heading: String(row.heading ?? ''), body: String(row.body ?? '') };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid sections JSON.';
    throw new Error(message);
  }
}

export async function saveSite(formData: FormData) {
  const db = await requirePortfolioAdmin();
  const payload = {
    id: 'default',
    display_name: text(formData, 'display_name'),
    nav_label: text(formData, 'nav_label'),
    hero_kicker: text(formData, 'hero_kicker'),
    hero_title_a: text(formData, 'hero_title_a'),
    hero_title_b: text(formData, 'hero_title_b'),
    hero_title_c: text(formData, 'hero_title_c'),
    hero_body: text(formData, 'hero_body'),
    hero_meta: text(formData, 'hero_meta'),
    location: text(formData, 'location'),
    availability: text(formData, 'availability'),
    marquee: text(formData, 'marquee'),
    intro_kicker: text(formData, 'intro_kicker'),
    intro_title: text(formData, 'intro_title'),
    intro_body: text(formData, 'intro_body'),
    about_kicker: text(formData, 'about_kicker'),
    about_title: text(formData, 'about_title'),
    about_body: text(formData, 'about_body'),
    contact_kicker: text(formData, 'contact_kicker'),
    contact_title: text(formData, 'contact_title'),
    contact_body: text(formData, 'contact_body'),
    contact_email: text(formData, 'contact_email'),
    footer_note: text(formData, 'footer_note'),
    motion: {
      enabled: formData.get('motion_enabled') === 'on',
      webgl: formData.get('motion_webgl') === 'on',
      intensity: Math.max(0.45, Math.min(Number(formData.get('motion_intensity') ?? 1) || 1, 1.7)),
    },
    updated_at: new Date().toISOString(),
  };

  const { error } = await db.from('portfolio_site').upsert(payload);
  if (error) {
    console.error('[CMS] saveSite failed', error);
    redirectDbError('Save site failed', error);
  }

  revalidatePath('/');
  revalidatePath('/work/[slug]', 'page');
  redirect('/admin?saved=site');
}

export async function saveProject(formData: FormData) {
  const db = await requirePortfolioAdmin();
  const id = text(formData, 'id');
  let parsedSections: ReturnType<typeof sections>;

  try {
    parsedSections = sections(text(formData, 'sections'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid sections JSON.';
    redirect(adminErrorUrl('Save project failed — ' + message));
  }

  const row = {
    slug: text(formData, 'slug'),
    sort_index: Number(formData.get('sort_index') ?? 0) || 0,
    title: text(formData, 'title'),
    eyebrow: text(formData, 'eyebrow'),
    category: text(formData, 'category'),
    year: text(formData, 'year'),
    status: text(formData, 'status'),
    role: text(formData, 'role'),
    stack: text(formData, 'stack'),
    intro: text(formData, 'intro'),
    short: text(formData, 'short'),
    accent: text(formData, 'accent') || 'acid',
    metric_label: text(formData, 'metric_label'),
    metric_value: text(formData, 'metric_value'),
    live_url: text(formData, 'live_url') || null,
    repo_url: text(formData, 'repo_url') || null,
    featured: formData.get('featured') === 'on',
    sections: parsedSections,
    updated_at: new Date().toISOString(),
  };

  if (!row.slug || !row.title) {
    redirect(adminErrorUrl('Save project failed — Project slug and title are required.'));
  }

  const query = id ? db.from('portfolio_projects').update(row).eq('id', id) : db.from('portfolio_projects').insert(row);
  const { error } = await query;
  if (error) {
    console.error('[CMS] saveProject failed', error);
    redirectDbError('Save project failed', error);
  }

  revalidatePath('/');
  revalidatePath('/work/' + row.slug);
  redirect('/admin?saved=project');
}

export async function deleteProject(formData: FormData) {
  const db = await requirePortfolioAdmin();
  const id = text(formData, 'id');
  if (!id) return;
  const { error } = await db.from('portfolio_projects').delete().eq('id', id);
  if (error) {
    console.error('[CMS] deleteProject failed', error);
    redirectDbError('Delete project failed', error);
  }
  revalidatePath('/');
  revalidatePath('/work/[slug]', 'page');
  redirect('/admin?saved=deleted');
}

export async function logoutAction() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
