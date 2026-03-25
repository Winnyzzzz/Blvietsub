import { useState } from "react";
import { useGetMovies } from "@workspace/api-client-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/movie/Hero";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { Pagination } from "@/components/ui/Pagination";

export default function Home() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMovies({ page });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pb-20">
        {page === 1 && <Hero />}
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
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
              currentPage={data.currentPage || page} 
              hasNextPage={data.hasNextPage || false}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: page === 1 ? window.innerHeight - 100 : 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
