import React from 'react';
import { Home, FileCheck2, Camera, BarChart3, Settings, Sparkles } from 'lucide-react';

export type ActiveTab = 'home' | 'key' | 'scan' | 'results' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeKeyTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, activeKeyTitle }) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'key' as ActiveTab, label: 'Đáp án', icon: FileCheck2 },
    { id: 'scan' as ActiveTab, label: 'Chấm bài', icon: Camera, highlight: true },
    { id: 'results' as ActiveTab, label: 'Kết quả', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <>
      {/* Top Mobile/Desktop Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg leading-tight tracking-wide text-slate-100">
                CHẤM TRẮC NGHIỆM AI
              </h1>
              <p className="text-[11px] text-sky-400 font-medium tracking-tight hidden sm:block">
                Chụp ảnh – Nhận diện – Đối chiếu – Chấm điểm
              </p>
            </div>
          </div>

          {activeKeyTitle && (
            <div
              className="hidden md:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-full border border-slate-700/80 cursor-pointer transition"
              onClick={() => setActiveTab('key')}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200 truncate max-w-[200px]">
                {activeKeyTitle}
              </span>
            </div>
          )}

          {/* Quick scan button on header for tablet/desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-sm transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Chấm ngay</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 pb-safe shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative -top-3 flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition ${
                      isActive
                        ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 ring-4 ring-sky-500/30'
                        : 'bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-sky-400 mt-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
                  isActive
                    ? 'text-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sky-400' : ''}`} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
