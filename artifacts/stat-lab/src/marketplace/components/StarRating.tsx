import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className="h-3.5 w-3.5"
            style={{
              fill: filled ? "#147b69" : "#e5e7eb",
              color: filled ? "#147b69" : "#e5e7eb",
            }}
          />
        );
      })}
    </div>
  );
}
