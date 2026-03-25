import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Pagination({ currentPage, hasNextPage, onNext, onPrev }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-12">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200",
          currentPage <= 1
            ? "bg-white/5 text-zinc-600 cursor-not-allowed"
            : "bg-white/10 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Trang trước</span>
      </button>

      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white font-bold border border-white/10">
        {currentPage}
      </div>

      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200",
          !hasNextPage
            ? "bg-white/5 text-zinc-600 cursor-not-allowed"
            : "bg-white/10 text-white hover:bg-primary hover:text-white shadow-lg hover:shadow-primary/25"
        )}
      >
        <span>Trang sau</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
