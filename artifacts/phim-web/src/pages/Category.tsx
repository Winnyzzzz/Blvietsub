import { useState, useEffect } from "react";
import { useGetMoviesByCategory } from "@workspace/api-client-react";
import { useQueryParams } from "@/hooks/use-query-params";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { Pagination } from "@/components/ui/Pagination";

export default function Category() {
  const queryParams = useQueryParams();
  const initialLabel = queryParams.get("label") || "";
  
  const [page, setPage] = useState(1);
  const [currentLabel, setCurrentLabel] = useState(initialLabel);

  useEffect(() => {
    if (initialLabel !== currentLabel) {
      setCurrentLabel(initialLabel);
      setPage(1);
    }
  }, [initialLabel, currentLabel]);

  const { data, isLoading } = useGetMoviesByCategory(
    { label: currentLabel, page },
    { query: { enabled: !!currentLabel } }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-32 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <MovieGrid 
          isLoading={isLoading} 
          isEmpty={!isLoading && !!currentLabel && (!data?.movies || data.movies.length === 0)}
          title={`Thể loại: ${currentLabel}`}
          subtitle="Khám phá các bộ phim hay nhất trong thể loại này."
        >
          {data?.movies?.map((movie, index) => (
            <MovieCard key={`${movie.url}-${index}`} movie={movie} index={index} />
          ))}
        </MovieGrid>

        {data && data.movies && data.movies.length > 0 && (
          <Pagination 
            currentPage={data.currentPage || page} 
            hasNextPage={data.hasNextPage || false}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
