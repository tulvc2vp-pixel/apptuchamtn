import React, { useState } from 'react';
import { StudentResult, AnswerOption, QuestionAnswer } from '../types';
import { MasterAnswerKey } from '../types';
import { compareStudentWithKey } from '../utils/scoring';
import { CheckCircle2, XCircle, AlertTriangle, User, GraduationCap, Save, RotateCcw, Award } from 'lucide-react';

interface ScanResultProps {
  result: StudentResult;
  masterKey: MasterAnswerKey;
  onSaveResult: (finalResult: StudentResult) => void;
  onRescan: () => void;
}

export const ScanResult: React.FC<ScanResultProps> = ({
  result,
  masterKey,
  onSaveResult,
  onRescan,
}) => {
  const [studentName, setStudentName] = useState(result.studentName || '');
  const [className, setClassName] = useState(result.className || '');
  const [studentAnswers, setStudentAnswers] = useState<QuestionAnswer[]>(result.answers || []);

  // Recalculate score live when teacher edits student answers or student info
  const evaluation = compareStudentWithKey(studentAnswers, masterKey);

  const handleOverrideAnswer = (qNum: number, newAns: AnswerOption) => {
    setStudentAnswers((prev) =>
      prev.map((a) => {
        if (a.question === qNum) {
          return {
            ...a,
            answer: newAns,
            confidence: 1.0, // High confidence since teacher confirmed
            isUncertain: false,
          };
        }
        return a;
      })
    );
  };

  const handleConfirmAndSave = () => {
    const updatedResult: StudentResult = {
      ...result,
      studentName: studentName.trim() || 'Học sinh chưa đặt tên',
      className: className.trim() || '9A1',
      answers: studentAnswers,
      comparisonDetails: evaluation.comparisonDetails,
      correctCount: evaluation.correctCount,
      incorrectCount: evaluation.incorrectCount,
      uncertainCount: evaluation.uncertainCount,
      totalScore: evaluation.totalScore,
      percentage: evaluation.percentage,
      hasBeenVerified: true,
    };

    onSaveResult(updatedResult);
  };

  const uncertainQuestions = evaluation.comparisonDetails.filter((d) => d.isUncertain);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md font-bold text-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-sky-400 uppercase">
                KẾT QUẢ CHẤM BÀI
              </span>
              <h2 className="text-base font-bold text-slate-100">
                {masterKey.title}
              </h2>
            </div>
          </div>

          {/* Big Score Badge */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-inner">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-400 leading-none">
                {evaluation.totalScore}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Thang điểm 10</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-xs space-y-0.5">
              <div className="text-emerald-400 font-semibold">Đúng: {evaluation.correctCount} câu</div>
              <div className="text-rose-400 font-semibold">Sai: {evaluation.incorrectCount} câu</div>
            </div>
          </div>
        </div>

        {/* Editable Student Info Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <User className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 font-semibold">
                👨‍🎓 HỌ VÀ TÊN HỌC SINH
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nhập họ tên học sinh..."
                className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] text-slate-400 font-semibold">
                🏫 LỚP HỌC
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Nhập tên lớp (VD: 9A1)..."
                className="w-full bg-transparent text-xs font-bold text-slate-100 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Uncertainty Alert Box */}
      {uncertainQuestions.length > 0 && (
        <div className="bg-amber-950/70 border border-amber-600/60 rounded-xl p-4 shadow-md text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>⚠️ CÓ {uncertainQuestions.length} CÂU CẦN GIÁO VIÊN XÁC NHẬN!</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            AI nhận diện một số câu bị mờ, không chắc chắn hoặc khoanh trống. Vui lòng bấm chọn lại phương án bên dưới để xác nhận trước khi lưu.
          </p>
        </div>
      )}

      {/* Main Image + Answer Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column: Cropped Sheet Image */}
        {result.imageUri && (
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
            <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Ảnh bài làm gốc</span>
              <span className="text-[11px] text-slate-500">Đối chiếu trực tiếp</span>
            </h3>
            <div className="rounded-xl overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
              <img
                src={result.imageUri}
                alt="Student Answer Sheet"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Right Column: Detailed Questions Grid */}
        <div className={result.imageUri ? 'md:col-span-7' : 'md:col-span-12'}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-200">
                Chi tiết đối chiếu ({evaluation.comparisonDetails.length} câu)
              </h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đúng
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Sai
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Chưa rõ
                </span>
              </div>
            </div>

            {/* List of Questions */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {evaluation.comparisonDetails.map((item) => {
                const options: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

                return (
                  <div
                    key={item.question}
                    className={`p-2.5 rounded-xl border transition ${
                      item.isUncertain
                        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                        : item.isCorrect
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-rose-950/20 border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200">
                          Câu {item.question}:
                        </span>

                        <span className="text-xs text-slate-400">
                          Đ/A mẫu: <strong className="text-sky-400 font-bold">{item.masterAnswer}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isCorrect ? (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded-md font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Đúng</span>
                          </span>
                        ) : (
                          <span className="bg-rose-500/20 text-rose-300 text-[11px] px-2 py-0.5 rounded-md font-bold border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Sai</span>
                          </span>
                        )}

                        {item.isUncertain && (
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-amber-500/40">
                            ⚠️ Cần kiểm tra
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Manual Override Choice Selector */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">Học sinh chọn:</span>
                      <div className="flex items-center gap-1">
                        {options.map((opt) => {
                          const isSelected = item.studentAnswer === opt;
                          return (
                            <button
                              key={opt || 'none'}
                              type="button"
                              onClick={() => handleOverrideAnswer(item.question, opt)}
                              className={`w-6 h-6 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                isSelected
                                  ? item.isCorrect
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                    : 'bg-rose-600 text-white ring-2 ring-rose-400'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => handleOverrideAnswer(item.question, null)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                            item.studentAnswer === null
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Bỏ trống
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="fixed bottom-14 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onRescan}
            className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Chụp lại</span>
          </button>

          <button
            onClick={handleConfirmAndSave}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>XÁC NHẬN & LƯU KẾT QUẢ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
