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
  
  const [page, setPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);

  // Reset page when search query changes in URL
  useEffect(() => {
    if (initialQuery !== currentQuery) {
      setCurrentQuery(initialQuery);
      setPage(1);
    }
  }, [initialQuery, currentQuery]);

  const { data, isLoading } = useSearchMovies(
    { q: currentQuery, page },
    { query: { enabled: !!currentQuery } }
  );

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
