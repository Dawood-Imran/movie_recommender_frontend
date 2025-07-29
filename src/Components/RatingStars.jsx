import { Star } from 'lucide-react';

export default function RatingStars({ rating, onRate, isLoading }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={isLoading}
          onClick={() => onRate(star)}
          className={`transition-all duration-200 ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
        >
          <Star
            className={`h-6 w-6 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  );
}
