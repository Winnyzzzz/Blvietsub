import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-zinc-200 mb-4">Không tìm thấy trang</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không truy cập được.
          </p>
          <Link 
            href="/"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            Về Trang Chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
