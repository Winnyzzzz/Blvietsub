import { Clapperboard } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Clapperboard className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                BL<span className="text-primary">VietSub</span>
              </span>
            </Link>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Trải nghiệm không gian điện ảnh tuyệt vời nhất với hàng ngàn bộ phim chất lượng cao. Cập nhật liên tục, hoàn toàn miễn phí.
            </p>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Danh Mục</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-zinc-400 hover:text-primary transition-colors">Phim Mới</Link></li>
              <li><Link href="/the-loai?label=Hành Động" className="text-zinc-400 hover:text-primary transition-colors">Phim Hành Động</Link></li>
              <li><Link href="/the-loai?label=Kinh Dị" className="text-zinc-400 hover:text-primary transition-colors">Phim Kinh Dị</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Thông Tin</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-400 hover:text-primary transition-colors">Giới Thiệu</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary transition-colors">Bản Quyền</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary transition-colors">Liên Hệ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} BLVietSub. Được tạo ra cho mục đích giải trí.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Điều khoản</span>
            <span>•</span>
            <span>Bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
