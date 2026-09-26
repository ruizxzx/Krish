'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SiteCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const trails = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dotEl = dot.current;
    const ringEl = ring.current;
    const labelEl = label.current;
    if (!dotEl || !ringEl || !labelEl) return;

    let x = innerWidth * 0.5;
    let y = innerHeight * 0.5;
    let tx = x;
    let ty = y;
    let rx = x;
    let ry = y;
    let vx = 0;
    let vy = 0;
    let px = x;
    let py = y;
    let scrollY = window.scrollY;
    let scrollVelocity = 0;
    let targetScrollVelocity = 0;
    let frame = 0;
    let spotlight: HTMLElement | null = null;
    let spotlightX = 50;
    let spotlightY = 50;
    let targetSpotlightX = 50;
    let targetSpotlightY = 50;
    const trailPositions = Array.from({ length: 9 }, () => ({ x, y }));

    const move = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;

      const hero = (event.target as HTMLElement | null)?.closest<HTMLElement>('.hero--brutal');
      if (hero) {
        spotlight = hero;
        targetSpotlightX = (event.clientX / innerWidth) * 100;
        targetSpotlightY = (event.clientY / innerHeight) * 100;
      }
    };

    const over = (event: MouseEvent) => {
      const owner = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      const state = owner?.dataset.cursor || 'default';
      ringEl.dataset.state = state;
      labelEl.textContent =
        owner?.dataset.cursorLabel ||
        (state === 'project' ? 'VIEW' : state === 'drag' ? 'DRAG' : state === 'link' ? 'OPEN' : state === 'image' ? 'ZOOM' : '');

      document.body.dataset.cursorState = state;
    };

    const down = () => {
      ringEl.dataset.pressed = 'true';
      window.setTimeout(() => {
        ringEl.dataset.pressed = 'false';
      }, 160);
    };

    const scroll = () => {
      const next = window.scrollY;
      targetScrollVelocity = Math.max(-32, Math.min(32, next - scrollY));
      scrollY = next;
    };

    const loop = () => {
      const dx = tx - px;
      const dy = ty - py;
      px = tx;
      py = ty;
      vx += (dx - vx) * 0.2;
      vy += (dy - vy) * 0.2;

      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      rx += (x - rx) * 0.1;
      ry += (y - ry) * 0.1;

      const speed = Math.min(Math.hypot(vx, vy), 35);
      const angle = Math.atan2(vy, vx) * 180 / Math.PI;
      const stretch = 1 + speed * 0.012;

      dotEl.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 + speed * 0.018})`;
      ringEl.style.transform = `translate3d(${rx}px,${ry}px,0) rotate(${angle}deg) scaleX(${stretch})`;

      for (let i = 0; i < trailPositions.length; i += 1) {
        const point = trailPositions[i];
        const leadX = i === 0 ? x : trailPositions[i - 1].x;
        const leadY = i === 0 ? y : trailPositions[i - 1].y;
        const ease = 0.28 - i * 0.018;
        point.x += (leadX - point.x) * Math.max(ease, 0.12);
        point.y += (leadY - point.y) * Math.max(ease, 0.12);
        const trail = trails.current[i];
        if (trail) {
          const scale = Math.max(0.2, 0.72 - i * 0.06) * (1 + speed * 0.006);
          trail.style.transform = `translate3d(${point.x}px,${point.y}px,0) scale(${scale})`;
          trail.style.opacity = `${Math.max(0.03, 0.42 - i * 0.043)}`;
        }
      }

      spotlightX += (targetSpotlightX - spotlightX) * 0.08;
      spotlightY += (targetSpotlightY - spotlightY) * 0.08;
      if (spotlight) {
        spotlight.style.setProperty('--spot-x', `${spotlightX}%`);
        spotlight.style.setProperty('--spot-y', `${spotlightY}%`);
      }

      targetScrollVelocity *= 0.88;
      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.16;
      document.body.style.setProperty('--scroll-velocity', `${scrollVelocity}px`);

      frame = requestAnimationFrame(loop);
    };

    addEventListener('mousemove', move, { passive: true });
    addEventListener('mouseover', over, { passive: true });
    addEventListener('mousedown', down, { passive: true });
    addEventListener('scroll', scroll, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      removeEventListener('mousemove', move);
      removeEventListener('mouseover', over);
      removeEventListener('mousedown', down);
      removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
      delete document.body.dataset.cursorState;
      document.body.style.removeProperty('--scroll-velocity');
      if (spotlight) {
        spotlight.style.removeProperty('--spot-x');
        spotlight.style.removeProperty('--spot-y');
      }
    };
  }, []);

  return (
    <>
      {Array.from({ length: 9 }, (_, index) => (
        <div
          key={index}
          ref={(node) => { trails.current[index] = node; }}
          className="cursor-trail"
          aria-hidden="true"
        />
      ))}
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring"><span ref={label}>VIEW</span></div>
    </>
  );
}

export function PageReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-reveal],[data-reveal-text],[data-page-intro]', { clearProps: 'all' });
        return;
      }

      gsap.fromTo(
        '[data-page-intro]',
        { clipPath: 'inset(0 0 100% 0)', y: 24, opacity: 0 },
        { clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1, duration: 1.05, ease: 'power4.out', stagger: 0.07 }
      );

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((item) => {
        gsap.fromTo(
          item,
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-text]').forEach((item) => {
        gsap.fromTo(
          item,
          { yPercent: 105, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: { trigger: item, start: 'top 90%', once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-line]').forEach((item) => {
        gsap.fromTo(
          item,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: item, start: 'top 92%', once: true },
          }
        );
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return <div ref={root} className="page-motion-root">{children}</div>;
}
