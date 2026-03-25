import { Play, Info } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] flex items-center">
      {/* Background Image - Using the generated cinematic image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays for readability and blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary w-fit backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">Nền Tảng Trực Tuyến</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] text-shadow-lg">
            Khám phá thế giới <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
              Điện Ảnh Đỉnh Cao
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-xl text-shadow-sm">
            Hàng ngàn bộ phim chất lượng HD, cập nhật liên tục mỗi ngày. Trải nghiệm xem phim mượt mà không giới hạn trên BLVietSub.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(229,9,20,0.4)]"
            >
              <Play className="w-5 h-5 fill-current" />
              Khám Phá Ngay
            </button>
            <Link 
              href="/the-loai?label=Hành Động"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all duration-300 backdrop-blur-md border border-white/10"
            >
              <Info className="w-5 h-5" />
              Thể Loại Hot
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
