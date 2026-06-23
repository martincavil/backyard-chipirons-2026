'use client';

import { useRef, ChangeEvent } from 'react';

interface PhotoUploadProps {
  photo: string | null;
  onChange: (photo: string) => void;
  size?: number;
}

// Photos are stored as base64 inline in localStorage/Supabase, so they're
// resized down before being kept — raw phone photos (several MB each) would
// blow past the localStorage quota once a dozen+ runners have one.
const MAX_DIMENSION = 320;
const JPEG_QUALITY = 0.7;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl !== 'string') return reject(new Error('Read failed'));

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unsupported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({ photo, onChange, size = 60 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      onChange(resized);
    } catch {
      // Fall back to the original file if resizing fails for any reason
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result && typeof ev.target.result === 'string') {
          onChange(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: photo
          ? 'none'
          : 'linear-gradient(135deg, #2a2a3e, #1a1a2e)',
        border: '2px dashed #444',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: size * 0.35, color: '#666' }}>📷</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
