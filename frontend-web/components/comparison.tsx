'use client';
import { useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import type { GalleryImage } from '@/lib/api';
export default function Comparison({
  before,
  after,
}: {
  before: GalleryImage;
  after: GalleryImage;
}) {
  const [value, setValue] = useState(50);
  return (
    <div className="comparison">
      <img src={after.url} alt={after.alt} loading="lazy" />
      <img
        className="comparison-before"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        src={before.url}
        alt={before.alt}
        loading="lazy"
      />
      <span className="comparison-label before">ANTES</span>
      <span className="comparison-label after">DESPUÉS</span>
      <div className="comparison-line" style={{ left: `${value}%` }}>
        <span>
          <ChevronsLeftRight size={20} />
        </span>
      </div>
      <label className="sr-only" htmlFor={`compare-${before.file_id}`}>
        Deslizar para comparar el antes y el después
      </label>
      <input
        id={`compare-${before.file_id}`}
        aria-valuetext={`${value}% de la imagen anterior`}
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}
