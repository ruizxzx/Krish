'use client';

import { useMemo, useRef, useState } from 'react';
import type { ProfileMedia } from '@/lib/content';
import { createClient } from '@/lib/supabase/client';
import { saveProfileMedia } from '@/app/admin/actions';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function labelFromFilename(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Krish Sarkar';
}

export default function ProfilePhotoManager({ initialMedia }: { initialMedia?: ProfileMedia }) {
  const [media, setMedia] = useState<ProfileMedia | undefined>(initialMedia);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage('Profile photo must be under 25 MB.');
      return;
    }

    setBusy(true);
    setMessage('Uploading photo…');

    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      const path = `profile/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from('portfolio-media').upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
      const next: ProfileMedia = {
        src: data.publicUrl,
        path,
        alt: labelFromFilename(file.name),
      };

      const result = await saveProfileMedia(next);
      if (!result.ok) {
        await supabase.storage.from('portfolio-media').remove([path]);
        throw new Error(result.error || 'Could not save profile photo.');
      }

      if (media?.path) await supabase.storage.from('portfolio-media').remove([media.path]);
      setMedia(next);
      setMessage('Profile photo saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!media) return;
    setBusy(true);
    setMessage('Removing photo…');
    try {
      const result = await saveProfileMedia(null);
      if (!result.ok) throw new Error(result.error || 'Could not remove profile photo.');
      if (media.path) await supabase.storage.from('portfolio-media').remove([media.path]);
      setMedia(undefined);
      setMessage('Profile photo removed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Remove failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cms-profile-photo">
      <div className="cms-profile-photo-head">
        <div>
          <strong>Profile photo</strong>
          <span>Shown in the About / identity surface with liquid-glass hover treatment.</span>
        </div>
        <div className="cms-profile-photo-actions">
          <button type="button" className="admin-submit" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? 'Working…' : media ? 'Replace photo ↗' : 'Upload photo ↗'}
          </button>
          {media && <button type="button" className="admin-danger" onClick={() => void remove()} disabled={busy}>Remove</button>}
          <input ref={inputRef} hidden type="file" accept="image/*" onChange={(event) => void upload(event.target.files?.[0])} />
        </div>
      </div>

      <div className="cms-profile-photo-preview">
        {media ? <img src={media.src} alt={media.alt} /> : <div className="cms-profile-photo-placeholder"><span>K</span><em>No portrait uploaded</em></div>}
        <div className="cms-profile-glass"><span>MOVE</span></div>
      </div>

      {message && <p className="cms-profile-photo-status" role="status">{message}</p>}
    </div>
  );
}
