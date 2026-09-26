import { redirect } from 'next/navigation';
import { getPortfolioContent, portfolioAdminEmailHint, requirePortfolioAdmin, cmsAdminConfigured } from '@/lib/cms';
import { getClaims } from '@/lib/supabase/server';
import { deleteProject, logoutAction, saveProject, saveSite } from './actions';
import ProjectMediaManager from '@/components/cms/ProjectMediaManager';
import type { ProjectMedia } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const claims = await getClaims();
  if (!claims) redirect('/admin/login');
  const email = typeof claims.email === 'string' ? claims.email : '';
  if (!cmsAdminConfigured()) {
    return <main className="admin-shell"><div className="admin-card"><div className="admin-eyebrow">KRISH / CMS</div><h1>Finish the CMS<br/><span>configuration.</span></h1><p>Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, <code>SUPABASE_SECRET_KEY</code> and <code>PORTFOLIO_ADMIN_EMAILS</code>. Current allowlist: {portfolioAdminEmailHint() || 'not set'}.</p><a className="admin-back" href="/">← Back to site</a></div></main>;
  }

  const db = await requirePortfolioAdmin();
  const content = await getPortfolioContent();
  const { saved, error } = await searchParams;
  const { data: projects, error: projectsError } = await db.from('portfolio_projects').select('*').order('sort_index', { ascending: true });

  const siteValues: Record<string, string> = {
    display_name: content.displayName, nav_label: content.navLabel, hero_kicker: content.heroKicker,
    hero_title_a: content.heroTitle[0], hero_title_b: content.heroTitle[1], hero_title_c: content.heroTitle[2],
    location: content.location, availability: content.availability, hero_meta: content.heroMeta,
    marquee: content.marquee, intro_kicker: content.introKicker, intro_title: content.introTitle,
    about_kicker: content.aboutKicker, about_title: content.aboutTitle, contact_kicker: content.contactKicker,
    contact_title: content.contactTitle, contact_email: content.contactEmail, footer_note: content.footerNote,
  };

  const projectRows = projectsError ? content.projects : (projects ?? content.projects);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div><div className="admin-eyebrow">KRISH / CONTENT STUDIO</div><h1>Control the<br/><span>experience.</span></h1></div>
        <div className="admin-header-actions"><span>{email}</span><a href="/">View live ↗</a><form action={logoutAction}><button type="submit">Sign out</button></form></div>
      </header>
      {saved && <div className="admin-saved">Saved / {saved}</div>}
      {error && <div className="admin-error" role="alert"><strong>CMS error</strong><span>{error}</span></div>}
      {projectsError && !error && <div className="admin-error" role="alert"><strong>Project data error</strong><span>{projectsError.message}</span></div>}

      <section className="admin-section">
        <div className="admin-section-head"><span>01 / site settings</span><span>Live front-end content</span></div>
        <form action={saveSite} className="admin-form admin-form-grid">
          {[
            ['display_name','Display name'],['nav_label','Nav label'],['hero_kicker','Hero kicker'],['hero_title_a','Hero line 01'],['hero_title_b','Hero line 02'],['hero_title_c','Hero line 03'],
            ['location','Location'],['availability','Availability'],['hero_meta','Hero meta'],['marquee','Marquee'],['intro_kicker','Intro kicker'],['intro_title','Intro title'],
            ['about_kicker','About kicker'],['about_title','About title'],['contact_kicker','Contact kicker'],['contact_title','Contact title'],['contact_email','Contact email'],['footer_note','Footer note'],
          ].map(([key, label]) => <label key={key}>{label}<input name={key} defaultValue={siteValues[key] ?? ''} /></label>)}
          <label className="span-2">Hero body<textarea name="hero_body" defaultValue={content.heroBody} /></label>
          <label className="span-2">Intro body<textarea name="intro_body" defaultValue={content.introBody} /></label>
          <label className="span-2">About body<textarea name="about_body" defaultValue={content.aboutBody} /></label>
          <label className="span-2">Contact body<textarea name="contact_body" defaultValue={content.contactBody} /></label>
          <div className="admin-toggles span-2">
            <label><input type="checkbox" name="motion_enabled" defaultChecked={content.motion.enabled} /> Motion enabled</label>
            <label><input type="checkbox" name="motion_webgl" defaultChecked={content.motion.webgl} /> WebGL enabled</label>
            <label>Intensity<input name="motion_intensity" type="number" min="0.45" max="1.7" step="0.05" defaultValue={content.motion.intensity} /></label>
          </div>
          <button className="admin-submit span-2" type="submit">Save site system ↗</button>
        </form>
      </section>

      <section className="admin-section">
        <div className="admin-section-head"><span>02 / projects</span><span>CRUD + case studies</span></div>
        <div className="admin-projects">
          {projectRows.map((project: Record<string, unknown>) => (
            <details className="admin-project" key={String(project.id)}>
              <summary><span>{String(project.sort_index ?? 0).padStart(2,'0')}</span><strong>{String(project.title)}</strong><em>{String(project.status)}</em></summary>
              <form action={saveProject} className="admin-form admin-form-grid">
                <input type="hidden" name="id" value={String(project.id)} />
                {['slug','title','eyebrow','category','year','status','role','stack','metric_label','metric_value','live_url','repo_url'].map((key) =>
                  <label key={key}>{key.replaceAll('_',' ')}<input name={key} defaultValue={String(project[key] ?? '')} /></label>
                )}
                <label>Order<input name="sort_index" type="number" defaultValue={Number(project.sort_index ?? 0)} /></label>
                <label>Accent<select name="accent" defaultValue={String(project.accent ?? 'acid')}><option value="acid">Acid</option><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="orange">Orange</option></select></label>
                <label className="check"><input type="checkbox" name="featured" defaultChecked={Boolean(project.featured)} /> Featured on home</label>
                <label className="span-2">Case study sections (JSON)<textarea name="sections" defaultValue={JSON.stringify(project.sections ?? [], null, 2)} /></label>
                <div className="admin-row-actions span-2"><button className="admin-submit" type="submit">Save project ↗</button><button className="admin-danger" type="submit" formAction={deleteProject}>Delete project</button></div>
              </form>
              <ProjectMediaManager
                projectId={String(project.id)}
                initialMedia={Array.isArray(project.media) ? project.media as ProjectMedia[] : []}
              />
            </details>
          ))}
        </div>
        <details className="admin-project admin-new">
          <summary><span>+</span><strong>Add project</strong><em>New</em></summary>
          <form action={saveProject} className="admin-form admin-form-grid">
            <input type="hidden" name="id" value="" />
            <label>Slug<input name="slug" required placeholder="new-project" /></label>
            <label>Title<input name="title" required placeholder="NEW PROJECT" /></label>
            <label>Eyebrow<input name="eyebrow" /></label>
            <label>Category<input name="category" /></label>
            <label>Year<input name="year" defaultValue="2026" /></label>
            <label>Status<input name="status" defaultValue="Concept" /></label>
            <label>Role<input name="role" /></label>
            <label>Stack<input name="stack" /></label>
            <label>Order<input name="sort_index" type="number" defaultValue={(projects?.length ?? 0) + 1} /></label>
            <label>Accent<select name="accent" defaultValue="acid"><option value="acid">Acid</option><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="orange">Orange</option></select></label>
            <label className="span-2">Intro<textarea name="intro" /></label>
            <label className="span-2">Short description<textarea name="short" /></label>
            <label className="span-2">Sections JSON<textarea name="sections" defaultValue="[]" /></label>
            <button className="admin-submit span-2" type="submit">Create project ↗</button>
          </form>
        </details>
      </section>
    </main>
  );
}
