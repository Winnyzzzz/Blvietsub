import { useState, useEffect } from "react";
import { useSearchMovies } from "@workspace/api-client-react";
import { useQueryParams } from "@/hooks/use-query-params";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { Pagination } from "@/components/ui/Pagination";

export default function Search() {
  const queryParams = useQueryParams();
  const initialQuery = queryParams.get("q") || "";

  const [cursors, setCursors] = useState<string[]>([""]);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery !== currentQuery) {
      setCurrentQuery(initialQuery);
      setCursors([""]);
    }
  }, [initialQuery, currentQuery]);

  const currentCursor = cursors[cursors.length - 1];
  const currentPage = cursors.length;

  const { data, isLoading } = useSearchMovies(
    currentCursor ? { q: currentQuery, cursor: currentCursor } : { q: currentQuery },
    { query: { enabled: !!currentQuery } }
  );

  function handleNext() {
    if (data?.nextCursor) {
      setCursors((prev) => [...prev, data.nextCursor!]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    if (cursors.length > 1) {
      setCursors((prev) => prev.slice(0, -1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-32 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <MovieGrid
          isLoading={isLoading}
          isEmpty={!isLoading && !!currentQuery && (!data?.movies || data.movies.length === 0)}
          title={currentQuery ? `Kết quả tìm kiếm cho: "${currentQuery}"` : "Tìm kiếm phim"}
          subtitle={data?.movies ? `Tìm thấy dữ liệu phù hợp` : "Nhập từ khóa vào ô tìm kiếm phía trên."}
        >
          {data?.movies?.map((movie, index) => (
            <MovieCard key={`${movie.url}-${index}`} movie={movie} index={index} />
          ))}
        </MovieGrid>

        {data && data.movies && data.movies.length > 0 && (
          <Pagination
            currentPage={currentPage}
            hasNextPage={data.hasNextPage ?? false}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
