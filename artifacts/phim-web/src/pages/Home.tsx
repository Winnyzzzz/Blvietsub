import { useState } from "react";
import { useGetMovies } from "@workspace/api-client-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { Pagination } from "@/components/ui/Pagination";

export default function Home() {
  // cursors[0] = "" (page 1, no cursor), cursors[n] = cursor for page n+1
  const [cursors, setCursors] = useState<string[]>([""]);

  const currentCursor = cursors[cursors.length - 1];
  const currentPage = cursors.length;

  const { data, isLoading } = useGetMovies(
    currentCursor ? { cursor: currentCursor } : {}
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

      <main className="flex-1 pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <MovieGrid
            isLoading={isLoading}
            isEmpty={!isLoading && (!data?.movies || data.movies.length === 0)}
            title="Phim Mới Cập Nhật"
            subtitle="Danh sách các bộ phim được thêm mới nhất vào hệ thống."
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
