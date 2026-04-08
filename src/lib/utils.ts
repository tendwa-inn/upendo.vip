import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "../types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateVisibilityScore = (user: User) => {
  const swipeWeight = 0.4;
  const replyWeight = 0.6;

  const normalizedSwipeCount = Math.min((user.swipeCount || 0) / 500, 1); // Normalize to a max of 500 swipes
  const replyRate = user.replyRate || 0;

  return (normalizedSwipeCount * swipeWeight) + (replyRate * replyWeight);
};
