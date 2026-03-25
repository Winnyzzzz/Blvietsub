import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate an image placeholder logic just in case API returns bad URLs
export function getValidImageUrl(url?: string | null) {
  if (!url) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"; // fallback cinema seat
  // Some simple sanitization if needed
  if (url.startsWith('//')) return `https:${url}`;
  return url;
}
