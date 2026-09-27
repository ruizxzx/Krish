'use client';

import { useRef } from 'react';

type Props = {
  src: string;
  alt: string;
};

export default function LiquidPortrait({ src, alt }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 50, y: 50 });
  const current = useRef({ x: 50, y: 50 });

  const loop = () => {
    raf.current = null;
    const el = frame.current;
    if (!el) return;
    current.current.x += (target.current.x - current.current.x) * 0.12;
    current.current.y += (target.current.y - current.current.y) * 0.12;
    el.style.setProperty('--mx', `${current.current.x}%`);
    el.style.setProperty('--my', `${current.current.y}%`);
    if (Math.abs(target.current.x - current.current.x) > 0.1 || Math.abs(target.current.y - current.current.y) > 0.1) {
      raf.current = requestAnimationFrame(loop);
    }
  };

  const move = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    target.current.x = ((event.clientX - rect.left) / rect.width) * 100;
    target.current.y = ((event.clientY - rect.top) / rect.height) * 100;
    if (raf.current === null) raf.current = requestAnimationFrame(loop);
  };

  const reset = () => {
    target.current.x = 50;
    target.current.y = 50;
    if (raf.current === null) raf.current = requestAnimationFrame(loop);
  };

  return (
    <div ref={frame} className="liquid-portrait" onMouseMove={move} onMouseLeave={reset}>
      <img src={src} alt={alt} draggable={false} />
      <span className="liquid-portrait-tint" />
      <span className="liquid-portrait-lens" aria-hidden="true" />
      <span className="liquid-portrait-shine" aria-hidden="true" />
      <span className="liquid-portrait-label" aria-hidden="true">PORTRAIT / GLASS</span>
    </div>
  );
}