import { useState, useEffect } from "react";
import { useGetMovieDetail } from "@workspace/api-client-react";
import { useQueryParams } from "@/hooks/use-query-params";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MovieCard } from "@/components/movie/MovieCard";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { getValidImageUrl } from "@/lib/utils";
import {
  Loader2, Play, Calendar, Clock, Globe, Users, Film, AlertCircle,
  Server, ListVideo
} from "lucide-react";
import { Link } from "wouter";

export default function MovieDetail() {
  const queryParams = useQueryParams();
  const urlParam = queryParams.get("url") || "";

  const { data: movie, isLoading, isError } = useGetMovieDetail(
    { url: urlParam },
    { query: { enabled: !!urlParam, retry: 1 } }
  );

  const [selectedServerIdx, setSelectedServerIdx] = useState(0);
  const [selectedEpNum, setSelectedEpNum] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (movie) {
      const servers = movie.serverGroups;
      if (servers && servers.length > 0) {
        const firstServer = servers[0];
        const firstEp = firstServer.episodes[0];
        if (firstEp) {
          setSelectedServerIdx(0);
          setSelectedEpNum(firstEp.num);
          setCurrentUrl(firstEp.url);
        }
      } else if (movie.iframeUrl || movie.embedUrl) {
        setCurrentUrl(movie.iframeUrl || movie.embedUrl || "");
      }
    }
  }, [movie]);

  function handleSelectServer(idx: number) {
    setSelectedServerIdx(idx);
    const servers = movie?.serverGroups;
    if (!servers) return;
    const firstEp = servers[idx]?.episodes[0];
    if (firstEp) {
      setSelectedEpNum(firstEp.num);
      setCurrentUrl(firstEp.url);
    }
  }

  function handleSelectEpisode(num: string, url: string) {
    setSelectedEpNum(num);
    setCurrentUrl(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-zinc-400 font-medium">Đang tải thông tin phim...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center flex flex-col items-center gap-6 glass-panel p-10 rounded-3xl">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
              <p className="text-zinc-400">Không thể tải thông tin phim này. Có thể đường dẫn không hợp lệ hoặc phim đã bị xóa.</p>
            </div>
            <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              Trở về Trang Chủ
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const servers = movie.serverGroups || [];
  const currentServer = servers[selectedServerIdx];
  const hasEpisodes = servers.length > 0 && (servers[0]?.episodes?.length ?? 0) > 0;

  const renderPlayer = () => {
    if (!currentUrl) {
      return (
        <div className="w-full aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden group">
          <img src={getValidImageUrl(movie.thumbnail)} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" alt="Thumbnail" />
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 backdrop-blur-md">
              <Play className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-300 font-medium text-lg">Server video đang được cập nhật</p>
            <p className="text-zinc-500 text-sm mt-1">Vui lòng quay lại sau</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-white/10 relative">
        <iframe
          key={currentUrl}
          src={currentUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title={movie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Background Blur Overlay */}
        <div className="fixed inset-0 top-0 h-[60vh] z-0 opacity-20 pointer-events-none">
          <img
            src={getValidImageUrl(movie.thumbnail)}
            alt=""
            className="w-full h-full object-cover blur-3xl saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

          {/* Player Section */}
          <div className="w-full max-w-6xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {renderPlayer()}
          </div>

          {/* Episode & Server Selector */}
          {hasEpisodes && (
            <div className="w-full max-w-6xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Server Tabs */}
              {servers.length > 1 && (
                <div className="flex items-center gap-0 border-b border-white/10 overflow-x-auto">
                  <div className="flex items-center gap-2 px-4 py-3 text-zinc-500 text-sm font-medium shrink-0 border-r border-white/10">
                    <Server className="w-4 h-4" />
                    <span>Server</span>
                  </div>
                  {servers.map((server, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectServer(idx)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                        selectedServerIdx === idx
                          ? "text-primary border-primary bg-primary/10"
                          : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Episode Grid */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm font-medium">
                  <ListVideo className="w-4 h-4" />
                  <span>Danh sách tập — {currentServer?.name}</span>
                  <span className="ml-auto text-zinc-600 text-xs">{currentServer?.episodes?.length ?? 0} tập</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {currentServer?.episodes?.map((ep) => (
                    <button
                      key={ep.num}
                      onClick={() => handleSelectEpisode(ep.num, ep.url)}
                      className={`min-w-[52px] px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        selectedEpNum === ep.num
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                          : "bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/20"
                      }`}
                    >
                      {ep.num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left: Poster (Desktop) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-32 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                <img
                  src={getValidImageUrl(movie.thumbnail)}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex gap-2 justify-center">
                    {movie.quality && <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded">{movie.quality}</span>}
                    {movie.episode && <span className="px-2 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded">{movie.episode}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="col-span-1 lg:col-span-9 flex flex-col gap-8">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-4 text-shadow">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-zinc-300">
                  {movie.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{movie.year}</span>
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{movie.duration}</span>
                    </div>
                  )}
                  {movie.country && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{movie.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {movie.labels && movie.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.labels.map(label => (
                    <Link
                      key={label}
                      href={`/the-loai?label=${encodeURIComponent(label)}`}
                      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-display font-semibold text-white flex items-center gap-2 mb-2">
                  <InfoIcon className="w-5 h-5 text-primary" /> Nội dung phim
                </h3>
                <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
                  {movie.description || "Chưa có thông tin nội dung cho phim này."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-zinc-500 text-sm mb-1">Đạo diễn</h4>
                    <p className="text-white font-medium">{movie.director || "Đang cập nhật"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-zinc-500 text-sm mb-1">Diễn viên</h4>
                    <p className="text-white font-medium line-clamp-2">{movie.actors || "Đang cập nhật"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Movies */}
          {movie.relatedMovies && movie.relatedMovies.length > 0 && (
            <div className="mt-20 pt-10 border-t border-white/5">
              <MovieGrid title="Có Thể Bạn Sẽ Thích">
                {movie.relatedMovies.slice(0, 6).map((relatedMovie, index) => (
                  <MovieCard key={`related-${relatedMovie.url}-${index}`} movie={relatedMovie} index={index} />
                ))}
              </MovieGrid>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
