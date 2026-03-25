import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface MovieGridProps {
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  title?: string;
  subtitle?: string;
}

export function MovieGrid({ children, isLoading, isEmpty, title, subtitle }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-zinc-400 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-4xl">🎬</span>
        </div>
        <h3 className="text-xl font-display font-semibold text-white">Không tìm thấy kết quả</h3>
        <p className="text-zinc-500 max-w-md">Hãy thử tìm kiếm với từ khóa khác hoặc khám phá các danh mục phổ biến của chúng tôi.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-8 flex flex-col gap-2">
          {title && <h2 className="text-2xl md:text-3xl font-display font-bold text-white border-l-4 border-primary pl-4">{title}</h2>}
          {subtitle && <p className="text-zinc-400 pl-5">{subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {children}
      </div>
    </div>
  );
}
