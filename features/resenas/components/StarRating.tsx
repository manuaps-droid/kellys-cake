"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = 
  | { readonly?: false; value: number; onChange: (val: number) => void; size?: 'sm' | 'md' | 'lg' }
  | { readonly: true; value: number; size?: 'sm' | 'md' | 'lg' };

export function StarRating(props: StarRatingProps) {
  const { value, size = 'md', readonly } = props;
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentDisplayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'transition-colors duration-200 focus:outline-none',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
          onClick={() => !readonly && props.onChange(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(null)}
          aria-label={`Calificar con ${star} estrellas`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= currentDisplayValue
                ? 'text-kc-gold fill-kc-gold'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
