'use client';

import { useMemo, useRef, useState } from 'react';
import type { ProjectMedia } from '@/lib/content';
import { createClient } from '@/lib/supabase/client';
import { saveProjectMedia } from '@/app/admin/actions';

type Props = {
  projectId: string;
  initialMedia: ProjectMedia[];
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function labelFromFilename(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Project media';
}

function isSupported(file: File) {
  return file.type.startsWith('image/') || file.type === 'video/mp4' || file.type === 'video/webm' || file.type === 'video/quicktime';
}

export default function ProjectMediaManager({ projectId, initialMedia }: Props) {
  const [media, setMedia] = useState<ProjectMedia[]>(initialMedia);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const persist = async (next: ProjectMedia[]) => {
    const previous = media;
    setMedia(next);
    setMessage('Saving media order…');
    const result = await saveProjectMedia(projectId, next);
    if (!result.ok) {
      setMedia(previous);
      setMessage(result.error || 'Could not save media.');
      throw new Error(result.error || 'Could not save media.');
    }
    setMessage('Saved automatically.');
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    try {
      const added: ProjectMedia[] = [];
      for (const file of Array.from(files)) {
        if (!isSupported(file)) throw new Error(`Unsupported format: ${file.name}`);
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 100 MB.`);

        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
        const path = `${projectId}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('portfolio-media').upload(path, file, {
          cacheControl: '31536000',
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;

        const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
        added.push({
          id: crypto.randomUUID(),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          src: data.publicUrl,
          path,
          alt: labelFromFilename(file.name),
          caption: '',
          featured: media.length === 0 && added.length === 0,
        });
      }

      await persist([...media, ...added]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (item: ProjectMedia) => {
    setBusy(true);
    try {
      const next = media.filter((entry) => entry.id !== item.id);
      await persist(next);
      if (item.path) await supabase.storage.from('portfolio-media').remove([item.path]);
    } catch {
      // persist() already restored the previous state and message.
    } finally {
      setBusy(false);
    }
  };

  const dropOn = async (targetIndex: number) => {
    if (!draggedId) return;
    const sourceIndex = media.findIndex((entry) => entry.id === draggedId);
    if (sourceIndex < 0 || sourceIndex === targetIndex) {
      setDraggedId(null);
      return;
    }

    const next = [...media];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, moved);
    setDraggedId(null);

    try {
      await persist(next);
    } catch {
      // persist() restores the previous state and shows the error.
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= media.length) return;
    const next = [...media];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    try {
      await persist(next);
    } catch {
      // persist() already restored the previous state and message.
    }
  };

  const patch = (id: string, patchValue: Partial<ProjectMedia>) => {
    setMedia((current) => current.map((entry) => entry.id === id ? { ...entry, ...patchValue } : entry));
  };

  const saveDetails = async () => {
    setBusy(true);
    try {
      await persist(media);
    } catch {
      // persist() already restored the previous state and message.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cms-media-manager">
      <div className="cms-media-toolbar">
        <div>
          <strong>Project media</strong>
          <span>Images + looping video · {media.length.toString().padStart(2, '0')} assets</span>
        </div>
        <div className="cms-media-toolbar-actions">
          <button type="button" className="admin-submit" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Working…' : 'Upload media ↗'}
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            onChange={(event) => void upload(event.target.files)}
          />
        </div>
      </div>

      <div className="cms-media-note">
        MP4/WebM/MOV and common image formats. Videos render muted, autoplaying and looping. Keep individual files under 100 MB for the CMS.
      </div>

      {message && <div className="cms-media-status" role="status">{message}</div>}

      {media.length === 0 ? (
        <button type="button" className="cms-media-empty" onClick={() => inputRef.current?.click()}>
          <span>+</span>
          <strong>Drop the visual language here.</strong>
          <em>Upload the first image or looping video.</em>
        </button>
      ) : (
        <div className="cms-media-grid">
          {media.map((item, index) => (
            <article
              className={`cms-media-card ${draggedId === item.id ? 'is-dragging' : ''}`}
              key={item.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void dropOn(index);
              }}
            >
              <div className="cms-media-preview">
                {item.type === 'video'
                  ? <video src={item.src} muted loop playsInline autoPlay preload="metadata" />
                  : <img src={item.src} alt={item.alt} loading="lazy" />}
                <span className="cms-media-type">{item.type === 'video' ? 'LOOP / VIDEO' : 'IMAGE'}</span>
                {item.featured && <span className="cms-media-featured">HERO</span>}
              </div>
              <div className="cms-media-card-body">
                <div className="cms-media-index">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div className="cms-media-index-actions">
                    <button
                      type="button"
                      className="cms-media-drag"
                      draggable
                      title="Drag to reorder"
                      aria-label={`Drag ${item.alt || 'media'} to reorder`}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', item.id);
                        setDraggedId(item.id);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      disabled={busy}
                    >
                      <i /><i /><i />
                    </button>
                    <button type="button" onClick={() => void move(index, -1)} disabled={busy || index === 0}>↑</button>
                    <button type="button" onClick={() => void move(index, 1)} disabled={busy || index === media.length - 1}>↓</button>
                  </div>
                    <button type="button" onClick={() => void move(index, -1)} disabled={busy || index === 0}>↑</button>
                    <button type="button" onClick={() => void move(index, 1)} disabled={busy || index === media.length - 1}>↓</button>
                  </div>
                </div>
                <label>Alt / label<input value={item.alt} onChange={(event) => patch(item.id, { alt: event.target.value })} /></label>
                <label>Caption<input value={item.caption ?? ''} onChange={(event) => patch(item.id, { caption: event.target.value })} /></label>
                <div className="cms-media-actions">
                  <button type="button" className="admin-submit" onClick={() => void saveDetails()} disabled={busy}>Save details</button>
                  <button type="button" className="admin-danger" onClick={() => void remove(item)} disabled={busy}>Remove</button>
                  <button type="button" className="cms-media-hero-button" onClick={() => void persist(media.map((entry) => ({ ...entry, featured: entry.id === item.id })))} disabled={busy || item.featured}>
                    {item.featured ? 'Hero media' : 'Set hero'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
