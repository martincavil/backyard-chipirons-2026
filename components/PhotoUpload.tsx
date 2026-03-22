'use client';

import { useRef, ChangeEvent } from 'react';

interface PhotoUploadProps {
  photo: string | null;
  onChange: (photo: string) => void;
  size?: number;
}

export function PhotoUpload({ photo, onChange, size = 60 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
