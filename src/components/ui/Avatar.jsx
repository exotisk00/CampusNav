import { useEffect, useRef, useState } from 'react';
import { Camera, User } from 'lucide-react';
import './Avatar.css';

export default function Avatar({
  src,
  name,
  size = 40,
  editable = false,
  onImageChange,
  className = '',
}) {
  const [previewUrl, setPreviewUrl] = useState(src || null);
  const fileRef = useRef(null);

  useEffect(() => {
    setPreviewUrl(src || null);
  }, [src]);

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageChange?.(file, url);
    }
  };

  return (
    <div
      className={`avatar ${editable ? 'avatar-editable' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      onClick={editable ? () => fileRef.current?.click() : undefined}
    >
      {previewUrl ? (
        <img src={previewUrl} alt={name} className="avatar-image" />
      ) : (
        <div className="avatar-placeholder">
          {size > 32 ? initials : <User size={size * 0.5} />}
        </div>
      )}
      {editable && (
        <>
          <div className="avatar-edit-overlay">
            <Camera size={Math.max(16, size * 0.22)} />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </>
      )}
    </div>
  );
}
