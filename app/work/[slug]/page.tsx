import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioContent } from '@/lib/cms';
import { DEFAULT_CONTENT } from '@/lib/content';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return DEFAULT_CONTENT.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.slug === slug);
  return { title: project ? `${project.title} — Krish Sarkar` : 'Project — Krish Sarkar', description: project?.intro || DEFAULT_CONTENT.heroBody };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="project-page">
      <header className="project-nav"><Link href="/" className="nav-logo">{content.displayName}</Link><Link href="/#work" className="project-back">Back to work ↗</Link></header>
      <section className="project-hero shell">
        <p className="micro">{project.index} / {project.category}</p>
        <h1 className="project-page-title">{project.title}</h1>
        <p className="project-page-intro">{project.intro}</p>
        <div className="project-meta">{[['Role', project.role], ['Stack', project.stack], ['Year', project.year], ['Status', project.status]].map(([label, value]) => <span key={label}><b>{label}</b>{value}</span>)}</div>
      </section>
      <section className={`project-art project-art--${project.accent}`} aria-label={`${project.title} visual system`}><div className="art-noise" /><div className="art-grid" /><div className="art-orb art-orb--one" /><div className="art-orb art-orb--two" /><div className="art-core" /><div className="art-label">{project.title} / {project.metricLabel} / {project.metricValue}</div><div className="art-corner">Interactive case study / 01</div></section>
      <section className="project-copy shell">{project.sections.map((section) => <article key={section.heading}><p className="micro">{section.kicker}</p><h2>{section.heading}</h2><p>{section.body}</p></article>)}</section>
      <footer className="project-footer shell"><Link href="/#work">← Back to selected work</Link>{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Open live ↗</a>}</footer>
    </main>
  );
}
