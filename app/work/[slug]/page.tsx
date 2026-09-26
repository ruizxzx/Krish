import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioContent } from '@/lib/cms';
import { DEFAULT_CONTENT, type ProjectMedia } from '@/lib/content';
import { PageReveal, SiteCursor } from '@/components/SiteEffects';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return DEFAULT_CONTENT.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const item = content.projects.find((project) => project.slug === slug);
  return {
    title: item ? `${item.title} — Krish Sarkar` : 'Project — Krish Sarkar',
    description: item?.intro || DEFAULT_CONTENT.heroBody,
  };
}

function MediaVisual({ item, priority = false }: { item: ProjectMedia; priority?: boolean }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        poster={item.poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        aria-label={item.alt}
      />
    );
  }

  return <img src={item.src} alt={item.alt} loading={priority ? 'eager' : 'lazy'} />;
}

function PlaceholderArt({ label }: { label: string }) {
  return (
    <div className="project-media-placeholder">
      <div className="project-placeholder-grid" />
      <div className="project-placeholder-orbit project-placeholder-orbit--a" />
      <div className="project-placeholder-orbit project-placeholder-orbit--b" />
      <div className="project-placeholder-core"><span /></div>
      <span>{label} / VISUAL SYSTEM</span>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const media = project.media ?? [];
  const heroMedia = media.find((item) => item.featured) ?? media[0];
  const projectIndex = content.projects.findIndex((item) => item.slug === project.slug);
  const nextProject = content.projects[(projectIndex + 1) % content.projects.length];

  return (
    <PageReveal>
      <main className="project-page-v4">
        <SiteCursor />

        <header className="project-nav-v4">
          <Link href="/" className="project-brand" data-cursor="link" data-cursor-label="HOME">
            <span>{content.displayName}</span>
            <em>Creative developer / 2026</em>
          </Link>
          <div className="project-nav-meta">
            <span>{project.category}</span>
            <Link href="/#work" data-cursor="link" data-cursor-label="BACK">Back to work ↗</Link>
          </div>
        </header>

        <section className="project-intro-v4">
          <div className="project-intro-top shell">
            <span>Project / {project.index}</span>
            <span>{project.year} / {project.status}</span>
            <span>{project.metricLabel} / {project.metricValue}</span>
          </div>

          <div className="project-intro-grid shell">
            <div className="project-title-block">
              <p data-page-intro>{project.eyebrow}</p>
              <h1 data-page-intro>{project.title}</h1>
              <div className="project-title-rule" data-line />
            </div>

            <div className="project-intro-copy">
              <p data-page-intro>{project.intro}</p>
              <span data-page-intro>{project.short}</span>
            </div>
          </div>

          <div className="project-intro-foot shell">
            <div className="project-meta-grid" data-page-intro>
              {[
                ['Role', project.role],
                ['Stack', project.stack],
                ['Category', project.category],
                ['Status', project.status],
              ].map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}
            </div>
            <span className="project-scroll-note">Scroll / enter case study ↓</span>
          </div>
        </section>

        <section className="project-hero-media-v4 shell" data-reveal>
          <div className="project-media-frame project-media-frame--hero" data-cursor="image" data-cursor-label={heroMedia?.type === 'video' ? 'PLAY' : 'ZOOM'}>
            {heroMedia ? <MediaVisual item={heroMedia} priority /> : <PlaceholderArt label={project.title} />}
            <div className="project-media-overlay">
              <span>{heroMedia?.type === 'video' ? 'LOOP / 01' : 'IMAGE / 01'}</span>
              <span>{project.title}</span>
            </div>
          </div>
        </section>

        <section className="project-statement-v4">
          <div className="shell project-statement-grid">
            <span className="micro">01 / direction</span>
            <h2 data-reveal-text>{project.intro}</h2>
          </div>
        </section>

        <section className="project-media-sequence-v4 shell">
          <div className="project-sequence-head">
            <span>02 / visual language</span>
            <span>{media.length.toString().padStart(2, '0')} assets</span>
          </div>

          {media.length > 0 ? (
            <div className="project-media-sequence">
              {media.map((item, index) => (
                <figure
                  className={`project-media-block project-media-block--${index % 2 === 0 ? 'wide' : 'offset'}`}
                  key={item.id}
                  data-reveal
                  data-cursor="image"
                  data-cursor-label={item.type === 'video' ? 'PLAY' : 'ZOOM'}
                >
                  <div className="project-media-frame">
                    <MediaVisual item={item} />
                    <div className="project-media-overlay">
                      <span>{String(index + 1).padStart(2, '0')} / {item.type === 'video' ? 'LOOP' : 'IMAGE'}</span>
                      <span>{item.caption || item.alt}</span>
                    </div>
                  </div>
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <div className="project-empty-media" data-reveal>
              <PlaceholderArt label={project.title} />
              <p>Upload images or looping video from the CMS to replace this visual system.</p>
            </div>
          )}
        </section>

        <section className="project-case-v4 shell">
          <div className="project-case-label">
            <span>03 / case study</span>
            <span>System notes</span>
          </div>
          <div className="project-case-list">
            {project.sections.map((section, index) => (
              <article key={section.heading} data-reveal>
                <span className="project-case-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="micro">{section.kicker}</p>
                  <h2 data-reveal-text>{section.heading}</h2>
                  <p className="project-case-body" data-reveal-text>{section.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="project-next-v4">
          <div className="shell">
            <div className="project-next-head"><span>04 / next project</span><span>Keep moving</span></div>
            <Link href={`/work/${nextProject.slug}`} className="project-next-link" data-cursor="project" data-cursor-label="OPEN">
              <span>{nextProject.index}</span>
              <strong>{nextProject.title}</strong>
              <em>↗</em>
            </Link>
          </div>
        </section>

        <footer className="project-footer-v4 shell">
          <Link href="/#work" data-cursor="link" data-cursor-label="BACK">← All work</Link>
          <div>
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" data-cursor="link" data-cursor-label="OPEN">Open live ↗</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" data-cursor="link" data-cursor-label="OPEN">Source ↗</a>}
          </div>
          <a href="#top" data-cursor="link">Top ↑</a>
        </footer>
      </main>
    </PageReveal>
  );
}
