import React, { useState, useRef } from 'react';
import { Printer, X, FileText, CheckCircle2, Sliders, Edit3, Circle } from 'lucide-react';
import { MasterAnswerKey } from '../types';

interface PrintableAnswerSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAnswerKey?: MasterAnswerKey | null;
}

export const PrintableAnswerSheetModal: React.FC<PrintableAnswerSheetModalProps> = ({
  isOpen,
  onClose,
  activeAnswerKey,
}) => {
  // Default to 'grid' template (Bảng ô kẻ chữ viết tay A, B, C, D như hình người dùng cung cấp)
  const [templateType, setTemplateType] = useState<'grid' | 'bubble'>('grid');
  
  const [questionCount, setQuestionCount] = useState<number>(
    activeAnswerKey ? activeAnswerKey.totalQuestions : 12
  );
  const [title, setTitle] = useState<string>(
    activeAnswerKey ? activeAnswerKey.title : 'PHIẾU BÀI LÀM TRẮC NGHIỆM'
  );
  const [duration, setDuration] = useState<string>('Thời gian: 45 phút');

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Helper to chunk questions into groups (e.g. 10 or 12 per row block)
  const chunkSize = questionCount <= 10 ? 10 : 12;
  const questionBlocks: number[][] = [];
  for (let i = 1; i <= questionCount; i += chunkSize) {
    const block: number[] = [];
    for (let j = i; j < i + chunkSize && j <= questionCount; j++) {
      block.push(j);
    }
    questionBlocks.push(block);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* CSS print style specifically scoped for print output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-sheet-container, #printable-sheet-container * {
            visibility: visible !important;
          }
          #printable-sheet-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 my-auto">
        {/* Modal Top Control Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>Tải Mẫu Bảng Đáp Án Học Sinh Làm Bài</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Mẫu A4 Chuẩn Chữ Viết Tay / AI Scan
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                In phiếu ra giấy A4 cho học sinh điền chữ cái A, B, C, D hoặc tô phương án
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Settings Configurator + Printable Sheet Preview */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Quick Customization Controls Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Sliders className="w-4 h-4" />
                <span>CẤU HÌNH KIỂU PHIẾU BÀI LÀM IN GIẤY A4</span>
              </div>

              {/* Template Style Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTemplateType('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    templateType === 'grid'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Bảng ô kẻ chữ viết tay (Đúng ảnh mẫu)</span>
                </button>

                <button
                  onClick={() => setTemplateType('bubble')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    templateType === 'bubble'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>Bảng ô tròn tô mầu (OMR)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Số lượng câu hỏi:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value={10}>10 Câu (Dạng ngắn / Kiểm tra 15p)</option>
                  <option value={12}>12 Câu (Chuẩn mẫu 12 câu)</option>
                  <option value={20}>20 Câu (Tiêu chuẩn 45p)</option>
                  <option value={24}>24 Câu (2 khung 12 câu)</option>
                  <option value={30}>30 Câu (Kiểm tra giữa kỳ)</option>
                  <option value={40}>40 Câu (Đề kiểm tra 40 câu)</option>
                  <option value={50}>50 Câu (Thi THPT / Cuối kỳ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tên bài kiểm tra:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: PHIẾU BÀI LÀM HỌC SINH"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Thời gian / Môn học:
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="VD: Thời gian 45 phút"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Printable A4 Paper Preview Component */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>📄 Xem trước mẫu phiếu in giấy A4 ({templateType === 'grid' ? 'Mẫu Bảng Ô Kẻ Viết Tay' : 'Mẫu Ô Tròn Tô Mầu'})</span>
              <span className="text-[11px] text-emerald-400 font-semibold">Tương thích Gemini Vision AI nhận diện chính xác</span>
            </div>

            <div
              id="printable-sheet-container"
              ref={printAreaRef}
              className="bg-white text-black p-6 rounded-xl shadow-2xl border border-gray-300 max-w-2xl mx-auto font-sans tracking-tight space-y-4 select-none"
            >
              {/* Header with Title */}
              <div className="relative border-b-2 border-black pb-3">
                <div className="text-center space-y-1 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    SỞ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG THPT / THCS: ...........................................
                  </div>
                  <h1 className="text-lg font-black uppercase text-black tracking-tight">
                    {title || 'PHIẾU BÀI LÀM TRẮC NGHIỆM'}
                  </h1>
                  <p className="text-xs font-semibold text-gray-600">
                    {duration} • SỐ CÂU HỎI: {questionCount} CÂU
                  </p>
                </div>
              </div>

              {/* Student Information Fill Box */}
              <div className="grid grid-cols-12 gap-2 border border-black p-3 text-xs font-bold text-black bg-white">
                <div className="col-span-7 space-y-2">
                  <div>Họ và tên học sinh: ................................................................</div>
                  <div>Lớp: ......................... Trường: ....................................................</div>
                </div>
                <div className="col-span-5 border-l border-black pl-3 space-y-2">
                  <div>Số báo danh: [ __ ][ __ ][ __ ][ __ ]</div>
                  <div>Mã đề thi: [ __ ][ __ ][ __ ]</div>
                </div>
              </div>

              {/* Filling Instruction Banner */}
              <div className="border border-black p-2 text-[11px] text-black bg-gray-50 space-y-1">
                <div className="font-bold">
                  📌 HƯỚNG DẪN ĐIỀN ĐÁP ÁN:
                </div>
                {templateType === 'grid' ? (
                  <div>
                    • Học sinh viết chữ cái in hoa phương án chọn <strong>(A, B, C, D)</strong> rõ ràng vào ô trống bên dưới số câu tương ứng.
                  </div>
                ) : (
                  <div>
                    • Học sinh tô kín hình tròn 🔴 đen của phương án được chọn <strong>[A] [B] [C] [D]</strong>.
                  </div>
                )}
              </div>

              {/* Template Content 1: GRID TABLE HANDWRITTEN (EXACT MATCH TO USER'S IMAGE) */}
              {templateType === 'grid' && (
                <div className="pt-2 space-y-4">
                  <div className="text-center font-bold text-xs uppercase tracking-widest text-black border-b border-black pb-1">
                    BẢNG ĐÁP ÁN BÀI LÀM CỦA HỌC SINH ({questionCount} CÂU)
                  </div>

                  {questionBlocks.map((block, blockIdx) => (
                    <div key={blockIdx} className="overflow-x-auto">
                      <table className="w-full border-collapse border-2 border-black text-center text-xs font-bold">
                        <tbody>
                          {/* Row 1: Câu (Question Numbers) */}
                          <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-2 w-20 font-black text-black bg-gray-200">
                              Câu
                            </td>
                            {block.map((qNum) => (
                              <td key={qNum} className="border border-black px-1 py-2 font-bold text-black text-sm">
                                {qNum}
                              </td>
                            ))}
                          </tr>

                          {/* Row 2: Đáp án (Blank Boxes for Handwritten Letters A, B, C, D) */}
                          <tr>
                            <td className="border border-black px-2 py-3 font-black text-black bg-gray-100">
                              Đáp án
                            </td>
                            {block.map((qNum) => (
                              <td
                                key={qNum}
                                className="border border-black px-1 py-4 text-center align-middle h-11 min-w-[36px]"
                              >
                                {/* Blank empty square box for student handwriting */}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Template Content 2: BUBBLE OMR SHEET */}
              {templateType === 'bubble' && (
                <div className="pt-2">
                  <div className="text-center font-bold text-xs uppercase tracking-widest text-black mb-2 border-b border-black pb-1">
                    BẢNG PHƯƠNG ÁN TRẢ LỜI TÔ TRÒN ({questionCount} CÂU)
                  </div>

                  <div
                    className={`grid gap-x-4 gap-y-2 text-xs ${
                      questionCount <= 20
                        ? 'grid-cols-2'
                        : questionCount <= 30
                        ? 'grid-cols-3'
                        : 'grid-cols-4'
                    }`}
                  >
                    {Array.from({ length: questionCount }, (_, i) => i + 1).map((qNum) => (
                      <div
                        key={qNum}
                        className="flex items-center justify-between border-b border-gray-300 pb-1 pr-1"
                      >
                        <span className="font-bold text-black text-xs w-12">
                          Câu {qNum < 10 ? `0${qNum}` : qNum}:
                        </span>

                        <div className="flex items-center gap-1.5">
                          {options.map((opt) => (
                            <div
                              key={opt}
                              className="w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold text-[10px] text-black bg-white"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer */}
              <div className="pt-4 border-t border-black text-center text-[10px] text-gray-600 font-medium">
                <span>Mẫu phiếu chuẩn hóa AI Vision Scanning — Hệ thống Chấm Trắc Nghiệm Tự Động</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bottom Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mẫu phiếu thiết kế kích thước chuẩn A4, phù hợp học sinh điền tay hoặc tô mầu</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Đóng
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>IN MẪU NÀY (A4 / TẢI FILE PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
