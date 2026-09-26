'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Project, SiteContent, Service } from '@/lib/content';
import { SiteCursor } from '@/components/SiteEffects';

const WebGLBackground = dynamic(() => import('./WebGLBackground').then((m) => m.WebGLBackground), {
  ssr: false,
  loading: () => <div className="webgl-fallback" aria-hidden="true" />,
});

gsap.registerPlugin(ScrollTrigger);

type Props = { content: SiteContent };

function SplitWord({ value, className = '' }: { value: string; className?: string }) {
  return (
    <span className={`split-word ${className}`} aria-label={value}>
      {value.split('').map((char, index) => (
        <span className="split-char" key={`${char}-${index}`}>{char === ' ' ? '\u00A0' : char}</span>
      ))}
    </span>
  );
}

function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const value = Math.min(100, Math.round((now - started) / 7));
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const timer = window.setTimeout(onDone, 1050);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-top"><span>KRISH / 26</span><span>PORTFOLIO SYSTEM</span></div>
      <div className="preloader-center">
        <div className="preloader-word">K</div>
        <div className="preloader-track"><span style={{ transform: `scaleX(${progress / 100})` }} /><b>{progress}%</b></div>
      </div>
      <div className="preloader-bottom"><span>Loading visual engine</span><span>WebGL · GSAP · CMS</span></div>
    </div>
  );
}

function Cursor() { return null; }

function Magnetic({ children, className = '', href = '#', target }: { children: ReactNode; className?: string; href?: string; target?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (event: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.setProperty('--mag-x', `${x * 0.18}px`);
    el.style.setProperty('--mag-y', `${y * 0.18}px`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mag-x', '0px');
    el.style.setProperty('--mag-y', '0px');
  };
  return <a ref={ref} href={href} target={target} rel={target ? 'noreferrer' : undefined} onMouseMove={move} onMouseLeave={leave} className={`magnetic ${className}`} data-cursor="link">{children}</a>;
}

function ProjectHoverMedia({ project }: { project: Project }) {
  const media = project.media ?? [];
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const frame = useRef<number | null>(null);
  const pointerX = useRef(0);
  const bounds = useRef<DOMRect | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    media.forEach((item, index) => {
      const video = videos.current[index];
      if (!video) return;
      if (hovered && index === active) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [active, hovered, media]);

  const applyPointer = () => {
    frame.current = null;
    if (!bounds.current || media.length < 2) return;
    const ratio = Math.max(0, Math.min(0.999, (pointerX.current - bounds.current.left) / bounds.current.width));
    const next = Math.min(media.length - 1, Math.floor(ratio * media.length));
    setActive((current) => current === next ? current : next);
  };

  const move = (event: MouseEvent<HTMLDivElement>) => {
    if (!bounds.current || media.length < 2) return;
    pointerX.current = event.clientX;
    if (frame.current === null) frame.current = requestAnimationFrame(applyPointer);
  };

  const enter = () => {
    const card = document.querySelector<HTMLElement>(\`[data-project-media="\${project.slug}"]\`);
    bounds.current = card?.getBoundingClientRect() ?? null;
    setHovered(true);
    setActive(0);
  };

  const leave = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    bounds.current = null;
    setHovered(false);
    setActive(0);
  };

  if (!media.length) {
    return (
      <div className="project-card-media project-card-media--generated" aria-hidden="true">
        <div className="project-card-grid" />
        <div className="project-card-noise" />
        <div className="project-card-orbit project-card-orbit--one" />
        <div className="project-card-orbit project-card-orbit--two" />
        <div className="project-card-core"><span /></div>
        <div className="project-card-scan" />
        <span className="project-card-code">{project.metricLabel} / {project.metricValue}</span>
        <span className="project-card-index">{project.index}</span>
      </div>
    );
  }

  return (
    <div
      className={\`project-card-media project-card-media--gallery \${hovered ? 'is-hovered' : ''}\`}
      data-project-media={project.slug}
      onMouseEnter={enter}
      onMouseMove={move}
      onMouseLeave={leave}
      aria-hidden="true"
    >
      <div className="project-card-gallery">
        {media.map((item, index) => (
          <div key={item.id} className={\`project-card-gallery-item \${index === active ? 'is-active' : ''}\`}>
            {item.type === 'video' ? (
              <video
                ref={(node) => { videos.current[index] = node; }}
                src={item.src}
                poster={item.poster || undefined}
                muted
                loop
                playsInline
                preload={index === 0 ? 'metadata' : 'none'}
              />
            ) : (
              <img src={item.src} alt="" loading="lazy" />
            )}
            <span className="project-card-gallery-shade" />
          </div>
        ))}
      </div>
      <div className="project-card-gallery-ui">
        <span>{project.metricLabel} / {project.metricValue}</span>
        <span>{String(active + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}</span>
      </div>
      {media.length > 1 && <div className="project-card-gallery-dots">{media.map((item, index) => <i key={item.id} className={index === active ? 'is-active' : ''} />)}</div>}
    </div>
  );
}

function TiltCard({ project }: { project: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const bounds = useRef<DOMRect | null>(null);

  const apply = () => {
    frame.current = null;
    const el = ref.current;
    const rect = bounds.current;
    if (!el || !rect) return;
    const px = (pointer.current.x - rect.left) / rect.width - 0.5;
    const py = (pointer.current.y - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', \`\${py * -5}deg\`);
    el.style.setProperty('--tilt-y', \`\${px * 5}deg\`);
    el.style.setProperty('--parallax-x', \`\${px * 18}px\`);
    el.style.setProperty('--parallax-y', \`\${py * 18}px\`);
  };

  const move = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    if (!bounds.current) bounds.current = el.getBoundingClientRect();
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
    if (frame.current === null) frame.current = requestAnimationFrame(apply);
  };

  const enter = () => {
    const el = ref.current;
    if (!el) return;
    bounds.current = el.getBoundingClientRect();
  };

  const leave = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    bounds.current = null;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--parallax-x', '0px');
    el.style.setProperty('--parallax-y', '0px');
  };

  return (
    <Link href={\`/work/\${project.slug}\`} ref={ref} className={\`project-card project-card--\${project.accent}\`} data-cursor="project" data-cursor-label={project.media?.length ? 'EXPLORE' : 'VIEW'} onMouseEnter={enter} onMouseMove={move} onMouseLeave={leave}>
      <ProjectHoverMedia project={project} />
      <div className="project-card-info">
        <div className="project-card-heading"><span>{project.eyebrow}</span><h3>{project.title}</h3></div>
        <div className="project-card-meta"><p>{project.short}</p><span>{project.year} <b>↗</b></span></div>
      </div>
    </Link>
  );
}
function ServiceRow({ item, index, active, onOpen }: { item: Service; index: number; active: number; onOpen: (next: number) => void }) {
  const isOpen = active === index;
  return (
    <button type="button" className={`service-row ${isOpen ? 'is-open' : ''}`} onClick={() => onOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
      <span className="service-index">{item.index}</span>
      <span className="service-main"><strong>{item.title}</strong><span className="service-tags">{item.tags.map((tag) => <em key={tag}>{tag}</em>)}</span></span>
      <span className="service-toggle">{isOpen ? '−' : '+'}</span>
      <span className="service-detail">{item.description}</span>
    </button>
  );
}

export function Portfolio({ content }: Props) {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(0);
  const done = useCallback(() => setReady(true), []);
  const featured = useMemo(() => content.projects.filter((project) => project.featured), [content.projects]);

  useEffect(() => {
    if (!ready) return;
    const isCoarse = matchMedia('(pointer: coarse)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || !content.motion.enabled;
    document.documentElement.dataset.motion = reduce ? 'reduced' : 'full';

    const lenis = reduce || isCoarse ? null : new Lenis({ duration: 1.15, smoothWheel: true, syncTouch: false, lerp: 0.075 });
    let raf = 0;
    if (lenis) {
      lenis.on('scroll', () => ScrollTrigger.update());
      const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }

    const el = root.current;
    if (!el) return () => { cancelAnimationFrame(raf); lenis?.destroy(); };

    const ctx = gsap.context(() => {
      gsap.set('.page-content', { opacity: 1 });
      if (reduce || isCoarse) {
        gsap.set('[data-reveal], .split-char, .hero-orbit, .hero-visual', { opacity: 1, y: 0, rotateX: 0, scale: 1, x: 0 });
      } else {
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .fromTo('.site-nav', { yPercent: -100 }, { yPercent: 0, duration: 0.8 })
          .fromTo('.hero-kicker span', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.07 }, '-=0.35')
          .fromTo('.hero-visual', { scale: 0.75, opacity: 0, rotate: -8 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.35, ease: 'expo.out' }, '-=0.2')
          .fromTo('.hero-title .split-char', { yPercent: 120, opacity: 0, rotateX: 70 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.028, ease: 'power4.out' }, '-=0.85')
          .fromTo('.hero-copy, .hero-actions', { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 }, '-=0.65');

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((item) => {
          gsap.fromTo(item, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 86%', once: true } });
        });

        gsap.utils.toArray<HTMLElement>('.split-scroll').forEach((item, index) => {
          gsap.to(item, { xPercent: index % 2 ? -13 : 13, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
        gsap.to('.hero-visual', { yPercent: -18, rotate: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 } });
        gsap.to('.hero-title', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.statement-word', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.utils.toArray<HTMLElement>('.project-card-media').forEach((item) => {
          gsap.to(item, { yPercent: -9, ease: 'none', scrollTrigger: { trigger: item.closest('.project-card') || item, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
      gsap.to('.scroll-progress-bar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.section-pin').forEach((item) => gsap.to(item, { y: -45, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true } }));
      ScrollTrigger.refresh();
    }, el);

    return () => { ctx.revert(); cancelAnimationFrame(raf); lenis?.destroy(); };
  }, [content.motion.enabled, ready]);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.classList.add('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useEffect(() => {
    const press = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    addEventListener('keydown', press);
    return () => removeEventListener('keydown', press);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {!ready && <Preloader onDone={done} />}
      <SiteCursor />
      <div className="scroll-progress-bar" aria-hidden="true" />
      <header className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
        <div className="nav-left"><a href="#top" className="nav-logo">{content.displayName}</a><span className="nav-role">{content.navLabel}</span></div>
        <nav className="nav-desktop" aria-label="Primary navigation">
          {['work', 'about', 'services', 'contact'].map((item) => <a key={item} href={`#${item}`} data-cursor="link">{item}</a>)}
        </nav>
        <div className="nav-right"><span className="nav-availability"><i /> {content.availability}</span><button className="nav-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen}><span>{menuOpen ? 'Close' : 'Menu'}</span><i /><i /></button></div>
      </header>
      <div className={`menu-panel ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-panel-inner">
          <span className="menu-label">Navigation / 00</span>
          <div className="menu-links">
            {['work', 'about', 'services', 'contact'].map((item, index) => <a key={item} href={`#${item}`} onClick={closeMenu}><b>0{index + 1}</b><span>{item}</span><em>↗</em></a>)}
          </div>
          <div className="menu-bottom"><span>{content.location}</span><span>{content.heroMeta}</span></div>
        </div>
      </div>

      <main ref={root} id="top" className="page-content">
        <section className="hero hero--brutal" id="home">
          {content.motion.webgl && <WebGLBackground intensity={content.motion.intensity} />}
          <div className="brutal-noise" aria-hidden="true" />
          <div className="brutal-grid" aria-hidden="true" />
          <div className="brutal-cross brutal-cross--a" aria-hidden="true">+</div>
          <div className="brutal-cross brutal-cross--b" aria-hidden="true">+</div>
          <div className="hero-brutal-top shell">
            <span data-page-intro>01 / independent developer</span>
            <span data-page-intro>{content.location}</span>
            <span data-page-intro>{content.availability}</span>
          </div>
          <div className="hero-brutal-main shell">
            <div className="hero-brutal-label" data-page-intro>Selected work / 2026</div>
            <h1 className="hero-brutal-title" aria-label="Krish Sarkar">
              <span data-page-intro>KRISH</span>
              <span className="hero-brutal-outline" data-page-intro>SARKAR<span className="hero-brutal-dot">.</span></span>
            </h1>
            <div className="hero-brutal-bottom">
              <div className="hero-brutal-statement" data-page-intro>
                <p>{content.heroBody}</p><span>{content.heroMeta}</span>
              </div>
              <a href="#work" className="hero-brutal-enter" data-cursor="link" data-cursor-label="ENTER" data-page-intro><span>Enter the work</span><b>↓</b></a>
            </div>
          </div>
          <div className="hero-brutal-edge shell"><span>Creative developer / product builder</span><span>Scroll to explore</span></div>
        </section>

        <div className="ticker"><div>{content.marquee}</div></div>

        <section className="intro-section shell section-pad" data-section="intro">
          <div className="section-head"><span>{content.introKicker}</span><span>01 — point of view</span></div>
          <div className="intro-grid">
            <div className="section-pin"><span className="pin-circle">+</span><span>scroll / read</span></div>
            <div><h2 className="display-heading" data-reveal>{content.introTitle}</h2><p className="intro-body" data-reveal>{content.introBody}</p></div>
          </div>
        </section>

        <section className="manifesto" aria-label="Manifesto">
          <div className="statement-row split-scroll">THE WEB</div>
          <div className="statement-row statement-row--outline split-scroll">SHOULD MOVE.</div>
          <div className="manifesto-foot shell"><span>Design is not decoration.</span><span>01—03</span><span>Interaction is material.</span></div>
        </section>

        <section id="work" className="work-section section-pad shell">
          <div className="section-head"><span>02 / selected work</span><span>{content.projects.length.toString().padStart(2, '0')} worlds</span></div>
          <div className="work-intro"><div><p className="micro">Systems / products / experiments</p><h2 className="display-heading" data-reveal>Things I make<br/><span>move.</span></h2></div><p className="work-intro-copy" data-reveal>Interfaces are systems of moments. These projects combine product thinking, engineering and visual direction into one continuous surface.</p></div>
          <div className="project-stack">
            {featured.map((project, index) => <div key={project.slug} className="project-wrap" data-reveal style={{ zIndex: featured.length - index }}><TiltCard project={project} /></div>)}
          </div>
          <div className="work-footer" data-reveal><span>All systems / {content.projects.length.toString().padStart(2, '0')}</span><Link href="/work/portfolio-lab" data-cursor="link">Open the laboratory ↗</Link></div>
        </section>

        <section id="about" className="about-section section-pad">
          <div className="shell">
            <div className="section-head"><span>{content.aboutKicker}</span><span>Engineer × art direction</span></div>
            <div className="about-grid">
              <div className="identity-card" data-reveal data-cursor="drag">
                <div className="identity-scan" /><div className="identity-top"><span>KRISH / 26</span><span>IDENTITY_01</span></div><div className="identity-mark"><span>K</span><i /><i /><i /></div><div className="identity-bottom"><span>Creative developer</span><span>{content.location}</span></div>
              </div>
              <div className="about-copy"><p className="micro" data-reveal>04 / about</p><h2 className="display-heading" data-reveal>{content.aboutTitle}</h2><p className="about-lead" data-reveal>{content.aboutBody}</p><div className="experience-list" data-reveal>{content.experience.map((item) => <article key={item.id}><span>{item.year}</span><div><h3>{item.company}</h3><strong>{item.role}</strong><p>{item.description}</p></div></article>)}</div></div>
            </div>
          </div>
        </section>

        <section id="services" className="services-section section-pad shell">
          <div className="section-head"><span>05 / capabilities</span><span>Click to unfold</span></div>
          <div className="services-grid"><div className="services-title"><p className="micro">What I build with</p><h2 className="display-heading" data-reveal>Make it<br/><span>feel real.</span></h2></div><div className="service-list">{content.services.map((item, index) => <ServiceRow key={item.id} item={item} index={index} active={serviceOpen} onOpen={setServiceOpen} />)}</div></div>
        </section>

        <section className="lab-section" aria-label="Laboratory">
          <div className="lab-shell shell">
            <div className="lab-copy"><span className="micro">05 / browser laboratory</span><h2 data-reveal>Geometry,<br/><em>timing,</em><br/>response.</h2><p data-reveal>Motion is treated as infrastructure. The visual system reacts to pointer position, scroll velocity and intent while preserving the hierarchy of the page.</p></div>
            <div className="lab-stage" data-cursor="drag"><div className="lab-stage-grid" /><div className="lab-object lab-object--a" /><div className="lab-object lab-object--b" /><div className="lab-object lab-object--c" /><span className="lab-tag lab-tag--a">03D</span><span className="lab-tag lab-tag--b">LIVE / 60</span></div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-glow" />
          <div className="shell contact-inner">
            <div className="section-head"><span>{content.contactKicker}</span><span>Open channel</span></div>
            <div className="contact-content"><p className="micro">{content.contactBody}</p><a href={`mailto:${content.contactEmail}`} className="contact-title" data-cursor="project" data-cursor-label="MAIL">{content.contactTitle.split(' ').map((word, index) => <span key={`${word}-${index}`}>{word}</span>)}</a><div className="contact-bottom"><Magnetic href={`mailto:${content.contactEmail}`} className="contact-email">{content.contactEmail}<b>↗</b></Magnetic><div className="socials">{content.socials.map((social) => <a key={social.id} href={social.url} target="_blank" rel="noreferrer" data-cursor="link">{social.label}<span>↗</span></a>)}</div></div></div>
          </div>
        </section>

        <footer className="footer shell"><span>© 2026 Krish Sarkar</span><span>{content.footerNote}</span><a href="#top" data-cursor="link">Back to top ↑</a></footer>
      </main>
    </>
  );
}