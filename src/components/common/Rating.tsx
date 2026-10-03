import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  showCount = false,
  count,
  interactive = false,
  onChange,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = value >= starValue;
          const isHalf = !isFilled && value >= starValue - 0.7;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`${interactive ? 'cursor-pointer hover:scale-115 transition-transform' : 'cursor-default'} focus:outline-none`}
              aria-label={`${starValue} star`}
            >
              {isFilled ? (
                <Star className={`${starSize} fill-amber-400 text-amber-400`} />
              ) : isHalf ? (
                <StarHalf className={`${starSize} fill-amber-400 text-amber-400`} />
              ) : (
                <Star className={`${starSize} text-slate-300 dark:text-slate-600`} />
              )}
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {value.toFixed(1)}
          {typeof count === 'number' && (
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
              ({count.toLocaleString()})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
