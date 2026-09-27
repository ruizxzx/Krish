'use client';

import { useEffect, useState } from 'react';
import type { ProjectMedia } from '@/lib/content';

type Props = {
  item: ProjectMedia;
  priority?: boolean;
  className?: string;
};

function Visual({ item, priority = false, modal = false }: { item: ProjectMedia; priority?: boolean; modal?: boolean }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        poster={item.poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        controls={modal}
        preload={priority || modal ? 'auto' : 'metadata'}
        aria-label={item.alt}
      />
    );
  }
  return <img src={item.src} alt={item.alt} loading={priority ? 'eager' : 'lazy'} />;
}

export default function ProjectMediaViewer({ item, priority = false, className = '' }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`project-media-viewer ${className}`}
        onClick={() => setOpen(true)}
        aria-label={`Zoom ${item.alt || 'project media'}`}
        data-cursor="image"
        data-cursor-label="ZOOM"
      >
        <Visual item={item} priority={priority} />
      </button>

      {open && (
        <div className="project-lightbox" role="dialog" aria-modal="true" aria-label={`${item.alt || 'Project media'} fullscreen view`} onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <div className="project-lightbox-top">
            <span>{item.type === 'video' ? 'LOOP / FULL VIEW' : 'IMAGE / FULL VIEW'}</span>
            <button type="button" onClick={() => setOpen(false)} data-cursor="link" data-cursor-label="CLOSE">Close ×</button>
          </div>
          <div className="project-lightbox-stage">
            <Visual item={item} modal />
          </div>
          <div className="project-lightbox-bottom">
            <span>{item.caption || item.alt}</span>
            <span>ESC / CLOSE</span>
          </div>
        </div>
      )}
    </>
  );
}