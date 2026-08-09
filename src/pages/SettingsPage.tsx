import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Key, PlayCircle, ShieldCheck, Cpu, Trash2, Save, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onRunDemo: () => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onRunDemo,
  onClearAllData,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [mode, setMode] = useState<'ai' | 'omr' | 'auto'>(settings.recognitionMode || 'ai');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      recognitionMode: mode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>Cài Đặt Cấu Hình AI & Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý API Key Gemini, chế độ nhận diện và dữ liệu ứng dụng
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã lưu!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2.5">
            <Key className="w-4 h-4 text-sky-400" />
            <span>⚙️ CÀI ĐẶT AI - GEMINI API KEY</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Nhập Gemini API Key của bạn để sử dụng công nghệ AI Vision phân tích ảnh phiếu trả lời.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Gemini API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Dán Gemini API Key của bạn tại đây (AIStudio...)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>🔒 API Key được lưu cục bộ an toàn trên thiết bị bằng LocalStorage.</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>LƯU API KEY</span>
          </button>
        </div>

        {/* Demo Mode Trigger Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>🧪 CHẠY DEMO THỬ NGHIỆM</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Nếu chưa có API Key, bạn vẫn có thể trải nghiệm toàn bộ quy trình chấm điểm bài làm bằng dữ liệu & mẫu phiếu có sẵn.
          </p>

          <button
            type="button"
            onClick={onRunDemo}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>🧪 CHẠY DEMO NGAY BẰNG MẪU CÓ SẴN</span>
          </button>
        </div>

        {/* Section 26: Recognition Mode Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>CHẾ ĐỘ NHẬN DIỆN BẢNG PHƯƠNG ÁN</span>
          </div>

          <div className="space-y-2">
            <label
              onClick={() => setMode('ai')}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                mode === 'ai'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="recMode"
                checked={mode === 'ai'}
                onChange={() => setMode('ai')}
                className="text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-100 block">[●] Nhận diện AI (Gemini Vision)</span>
                <span className="text-[11px] text-slate-400">Độ chính xác cao, tự động đọc chữ viết tay tên & lớp</span>
              </div>
            </label>

            <label
              onClick={() => setMode('omr')}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                mode === 'omr'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="recMode"
                checked={mode === 'omr'}
                onChange={() => setMode('omr')}
                className="text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-100 block">[ ] Nhận diện OMR (Phiếu tô chuẩn)</span>
                <span className="text-[11px] text-slate-400">Nhận diện điểm tô màu ô tròn chuẩn hóa OMR</span>
              </div>
            </label>

            <label
              onClick={() => setMode('auto')}
              className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                mode === 'auto'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="recMode"
                checked={mode === 'auto'}
                onChange={() => setMode('auto')}
                className="text-sky-500 focus:ring-sky-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-100 block">[ ] Tự động (Auto Detect)</span>
                <span className="text-[11px] text-slate-400">Tự kết hợp AI Vision và OMR linh hoạt</span>
              </div>
            </label>
          </div>
        </div>

        {/* Clear Local Data Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-slate-800 pb-2.5">
            <Trash2 className="w-4 h-4" />
            <span>QUẢN LÝ DỮ LIỆU CỤC BỘ</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Xóa toàn bộ dữ liệu đáp án mẫu, danh sách kết quả bài chấm và cài đặt đã lưu khỏi thiết bị.
          </p>

          <button
            type="button"
            onClick={() => {
              if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ dữ liệu ứng dụng? Thao tác này không thể hoàn tác!')) {
                onClearAllData();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>XÓA TOÀN BỘ DỮ LIỆU CỤC BỘ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
