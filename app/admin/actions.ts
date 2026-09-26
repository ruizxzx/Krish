'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePortfolioAdmin } from '@/lib/cms';
import { createClient } from '@/lib/supabase/server';

function text(formData: FormData, name: string) { return String(formData.get(name) ?? '').trim(); }

function adminErrorUrl(message: string) {
  const safe = message.replace(/\s+/g, ' ').trim().slice(0, 320);
  return '/admin?error=' + encodeURIComponent(safe);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const row = error as Record<string, unknown>;
    const parts = [row.message, row.code ? `code=${row.code}` : '', row.details ? `details=${row.details}` : '', row.hint ? `hint=${row.hint}` : '']
      .filter(Boolean)
      .map(String);
    if (parts.length) return parts.join(' — ');
  }
  return 'Unexpected server error.';
}

export async function saveSite(formData: FormData) {
  let failure: string | null = null;

  try {
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
    if (error) throw error;
  } catch (error) {
    console.error('[CMS] saveSite failed', error);
    failure = 'Save site failed — ' + describeError(error);
  }

  if (failure) redirect(adminErrorUrl(failure));
  revalidatePath('/');
  revalidatePath('/work/[slug]', 'page');
  redirect('/admin?saved=site');
}

export async function saveProject(formData: FormData) {
  let failure: string | null = null;

  try {
    const db = await requirePortfolioAdmin();
    const id = text(formData, 'id');
    const sectionsValue = text(formData, 'sections');
    let parsedSections: Array<{ kicker: string; heading: string; body: string }> = [];

    if (sectionsValue) {
      const parsed: unknown = JSON.parse(sectionsValue);
      if (!Array.isArray(parsed)) throw new Error('Sections must be an array.');
      parsedSections = parsed.map((item) => {
        if (!item || typeof item !== 'object') throw new Error('Invalid section.');
        const row = item as Record<string, unknown>;
        return { kicker: String(row.kicker ?? ''), heading: String(row.heading ?? ''), body: String(row.body ?? '') };
      });
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

    if (!row.slug || !row.title) throw new Error('Project slug and title are required.');

    const query = id
      ? db.from('portfolio_projects').update(row).eq('id', id)
      : db.from('portfolio_projects').insert(row);
    const { error } = await query;
    if (error) throw error;
  } catch (error) {
    console.error('[CMS] saveProject failed', error);
    failure = 'Save project failed — ' + describeError(error);
  }

  if (failure) redirect(adminErrorUrl(failure));
  revalidatePath('/');
  const slug = text(formData, 'slug');
  if (slug) revalidatePath('/work/' + slug);
  redirect('/admin?saved=project');
}

export async function deleteProject(formData: FormData) {
  let failure: string | null = null;

  try {
    const db = await requirePortfolioAdmin();
    const id = text(formData, 'id');
    if (!id) return;
    const { error } = await db.from('portfolio_projects').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('[CMS] deleteProject failed', error);
    failure = 'Delete project failed — ' + describeError(error);
  }

  if (failure) redirect(adminErrorUrl(failure));
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
