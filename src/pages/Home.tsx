import React from 'react';
import { ActiveTab } from '../components/Navbar';
import { MasterAnswerKey, StudentResult } from '../types';
import { Camera, FilePlus, BookOpen, BarChart3, Sparkles, CheckCircle2, PlayCircle, HelpCircle } from 'lucide-react';

interface HomeProps {
  setActiveTab: (tab: ActiveTab) => void;
  activeAnswerKey: MasterAnswerKey | null;
  resultsCount: number;
  onRunDemo: () => void;
}

export const Home: React.FC<HomeProps> = ({
  setActiveTab,
  activeAnswerKey,
  resultsCount,
  onRunDemo,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-300 text-xs px-3 py-1 rounded-full font-semibold border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Công nghệ AI Gemini Vision</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            CHẤM TRẮC NGHIỆM AI
          </h1>
          <p className="text-sm text-slate-300 max-w-lg leading-relaxed font-medium">
            "Chấm bài nhanh hơn – Chính xác hơn" — Tự động nhận diện phương án qua camera điện thoại, đối chiếu đáp án mẫu và xuất file Báo Cáo Excel tức thì.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scan')}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl flex items-center gap-2.5 transition active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>CHẤM BÀI NGAY</span>
            </button>

            <button
              onClick={onRunDemo}
              className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 flex items-center gap-2 transition"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>🧪 CHẠY DEMO THỬ NGHIỆM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Answer Key Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              ĐÁP ÁN MẪU ĐANG KÍCH HOẠT
            </span>
            <h3 className="text-xs font-bold text-slate-100 truncate max-w-[280px]">
              {activeAnswerKey ? activeAnswerKey.title : 'Chưa chọn đáp án mẫu'}
            </h3>
            {activeAnswerKey && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeAnswerKey.totalQuestions} câu hỏi • Thang điểm 10
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveTab('key')}
          className="text-xs font-semibold text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 px-3.5 py-1.5 rounded-xl transition self-start sm:self-center"
        >
          {activeAnswerKey ? 'Thay đổi đáp án' : '➕ Tạo đáp án mẫu'}
        </button>
      </div>

      {/* Main 4 Action Grid Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Card 1: Tạo đáp án mẫu */}
        <div
          onClick={() => setActiveTab('key')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-2xl cursor-pointer transition shadow-md group hover:border-sky-500/50 space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition">
            <FilePlus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-100">➕ Tạo Đáp Án Mẫu</h3>
          <p className="text-[11px] text-slate-400">
            Nhập trực tiếp hoặc dán chuỗi đáp án (10, 20, 50 câu)
          </p>
        </div>

        {/* Card 2: Chấm bài */}
        <div
          onClick={() => setActiveTab('scan')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-2xl cursor-pointer transition shadow-md group hover:border-indigo-500/50 space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-100">📷 Chấm Bài Học Sinh</h3>
          <p className="text-[11px] text-slate-400">
            Chụp bài bằng camera hoặc tải ảnh từ bộ nhớ máy
          </p>
        </div>

        {/* Card 3: Danh sách kết quả */}
        <div
          onClick={() => setActiveTab('results')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-2xl cursor-pointer transition shadow-md group hover:border-emerald-500/50 space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-100">📚 Danh Sách Kết Quả</h3>
          <p className="text-[11px] text-slate-400">
            Đã chấm <strong>{resultsCount}</strong> học sinh • Xuất Excel Báo Cáo
          </p>
        </div>

        {/* Card 4: Thống kê */}
        <div
          onClick={() => setActiveTab('results')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-2xl cursor-pointer transition shadow-md group hover:border-amber-500/50 space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-100">📊 Thống Kê & Phân Tích</h3>
          <p className="text-[11px] text-slate-400">
            Xem biểu đồ phân bố điểm số, tỷ lệ đạt & độ khó từng câu
          </p>
        </div>
      </div>

      {/* Workflow Steps Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Quy trình 4 bước đơn giản cho Giáo Viên</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-sky-400 block mb-1">Bước 1</span>
            Nhập hoặc dán đáp án mẫu
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400 block mb-1">Bước 2</span>
            Chụp bảng phương án học sinh
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">Bước 3</span>
            AI tự động đối chiếu & tính điểm
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Bước 4</span>
            Lưu kết quả & xuất Excel
          </div>
        </div>
      </div>
    </div>
  );
};
