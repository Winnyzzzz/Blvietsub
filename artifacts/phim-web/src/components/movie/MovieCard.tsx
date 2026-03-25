import { PlayCircle, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { getValidImageUrl } from "@/lib/utils";
import type { Movie } from "@workspace/api-client-react/src/generated/api.schemas";

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const detailUrl = `/xem-phim?url=${encodeURIComponent(movie.url)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={detailUrl} className="group flex flex-col gap-3">
        {/* Image Container */}
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
          <img
            src={getValidImageUrl(movie.thumbnail)}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {movie.quality && (
              <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded shadow-lg backdrop-blur-md">
                {movie.quality}
              </span>
            )}
            {movie.episode && (
              <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded border border-white/10 backdrop-blur-md">
                {movie.episode}
              </span>
            )}
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)] backdrop-blur-sm">
              <PlayCircle className="w-8 h-8 text-white fill-white/20 ml-1" />
            </div>
          </div>

          {/* Bottom Info overlay */}
          {movie.year && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 bg-black/60 text-zinc-300 text-[10px] font-medium rounded backdrop-blur-md border border-white/10">
                {movie.year}
              </span>
            </div>
          )}
        </div>

        {/* Title Info */}
        <div className="flex flex-col gap-1 px-1">
          <h3 className="font-display font-medium text-zinc-100 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {movie.labels && movie.labels.length > 0 && (
            <p className="text-xs text-zinc-500 line-clamp-1">
              {movie.labels.join(" • ")}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
