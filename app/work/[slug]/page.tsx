import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioContent } from '@/lib/cms';
import { DEFAULT_CONTENT } from '@/lib/content';
import { PageReveal, SiteCursor } from '@/components/SiteEffects';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return DEFAULT_CONTENT.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const item = content.projects.find((project) => project.slug === slug);
  return { title: item ? `${item.title} — Krish Sarkar` : 'Project — Krish Sarkar', description: item?.intro || DEFAULT_CONTENT.heroBody };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <PageReveal>
      <main className="project-page">
        <SiteCursor />
        <header className="project-nav">
          <Link href="/" className="nav-logo" data-cursor="link" data-cursor-label="HOME">{content.displayName}</Link>
          <Link href="/#work" className="project-back" data-cursor="link" data-cursor-label="BACK">Back to work ↗</Link>
        </header>

        <section className="project-hero shell">
          <p className="micro" data-page-intro>{project.index} / {project.category}</p>
          <h1 className="project-page-title" data-page-intro>{project.title}</h1>
          <p className="project-page-intro" data-page-intro>{project.intro}</p>
          <div className="project-meta" data-page-intro>
            {[['Role', project.role], ['Stack', project.stack], ['Year', project.year], ['Status', project.status]].map(([label, value]) =>
              <span key={label}><b>{label}</b>{value}</span>
            )}
          </div>
        </section>

        <section className={`project-art project-art--${project.accent}`} aria-label={`${project.title} visual system`} data-reveal data-cursor="image" data-cursor-label="ZOOM">
          <div className="art-noise" /><div className="art-grid" /><div className="art-orb art-orb--one" /><div className="art-orb art-orb--two" /><div className="art-core" />
          <div className="art-label">{project.title} / {project.metricLabel} / {project.metricValue}</div>
          <div className="art-corner">Interactive case study / 01</div>
        </section>

        <section className="project-copy shell">
          {project.sections.map((section) =>
            <article key={section.heading} data-reveal>
              <p className="micro">{section.kicker}</p>
              <h2 data-reveal-text>{section.heading}</h2>
              <p data-reveal-text>{section.body}</p>
            </article>
          )}
        </section>

        <footer className="project-footer shell" data-reveal>
          <Link href="/#work" data-cursor="link" data-cursor-label="BACK">← Back to selected work</Link>
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" data-cursor="link" data-cursor-label="OPEN">Open live ↗</a>}
        </footer>
      </main>
    </PageReveal>
  );
}
