import React, { useState, useEffect } from 'react';
import { MasterAnswerKey, AnswerOption } from '../types';
import { parsePastedAnswers, formatAnswerKeyLettersOnly } from '../utils/answerParser';
import { Save, Clipboard, Edit3, CheckCircle, Plus, BookOpen, Layers } from 'lucide-react';

interface AnswerKeyFormProps {
  onSave: (key: MasterAnswerKey) => void;
  initialKey?: MasterAnswerKey | null;
  savedKeys: MasterAnswerKey[];
  onSelectKey: (key: MasterAnswerKey) => void;
}

export const AnswerKeyForm: React.FC<AnswerKeyFormProps> = ({
  onSave,
  initialKey,
  savedKeys,
  onSelectKey,
}) => {
  const [title, setTitle] = useState(initialKey?.title || 'Đề Thi Thử Giữa Kỳ Môn Toán 9');
  const [subject, setSubject] = useState(initialKey?.subject || 'Môn Toán');
  const [totalQuestions, setTotalQuestions] = useState<number>(initialKey?.totalQuestions || 10);
  const [customTotalInput, setCustomTotalInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'direct' | 'paste'>('paste');

  const [pasteText, setPasteText] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, AnswerOption>>(() => {
    if (initialKey?.answers) return { ...initialKey.answers };
    return { 1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'C', 9: 'D', 10: 'A' };
  });

  const [scoringMethod, setScoringMethod] = useState<'equal' | 'custom'>(
    initialKey?.scoringMethod || 'equal'
  );
  const [customPoints, setCustomPoints] = useState<Record<number, number>>(() => {
    return initialKey?.customPoints || {};
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Update when initialKey changes
  useEffect(() => {
    if (initialKey) {
      setTitle(initialKey.title);
      setSubject(initialKey.subject || '');
      setTotalQuestions(initialKey.totalQuestions);
      setAnswers({ ...initialKey.answers });
      setScoringMethod(initialKey.scoringMethod);
      if (initialKey.customPoints) setCustomPoints({ ...initialKey.customPoints });
      setPasteText(formatAnswerKeyLettersOnly(initialKey.answers, initialKey.totalQuestions));
    }
  }, [initialKey]);

  // Fast paste parser auto trigger
  const handleParsePaste = (text: string) => {
    setPasteText(text);
    const parsed = parsePastedAnswers(text, totalQuestions);
    if (Object.keys(parsed).length > 0) {
      setAnswers((prev) => ({
        ...prev,
        ...parsed,
      }));
    }
  };

  const handleOptionSelect = (qNum: number, opt: AnswerOption) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: prev[qNum] === opt ? null : opt,
    }));
  };

  const handleTotalChange = (newTotal: number) => {
    setTotalQuestions(newTotal);
    // Adjust paste text if any
    const formatted = formatAnswerKeyLettersOnly(answers, newTotal);
    setPasteText(formatted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tên/tiêu đề cho đáp án mẫu!');
      return;
    }

    const keyToSave: MasterAnswerKey = {
      id: initialKey?.id || `key-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      createdAt: initialKey?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalQuestions,
      answers,
      scoringMethod,
      pointsPerQuestion: scoringMethod === 'equal' ? 10 / totalQuestions : undefined,
      customPoints: scoringMethod === 'custom' ? customPoints : undefined,
    };

    onSave(keyToSave);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const questionPresets = [10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Existing Answer Keys Selector */}
      {savedKeys.length > 0 && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Đáp Án Mẫu Đã Lưu ({savedKeys.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                const newKey: MasterAnswerKey = {
                  id: `key-${Date.now()}`,
                  title: `Đề Thi Mới ${savedKeys.length + 1}`,
                  totalQuestions: 10,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  scoringMethod: 'equal',
                  answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B' },
                };
                onSelectKey(newKey);
              }}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo đề mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {savedKeys.map((k) => {
              const isSelected = initialKey?.id === k.id;
              return (
                <div
                  key={k.id}
                  onClick={() => onSelectKey(k)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500/50'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-100 truncate">{k.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {k.totalQuestions} câu • {k.subject || 'Môn học'}
                    </p>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Answer Key Form */}
      <form onSubmit={handleSave} className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Bước 1 – Nhập Đáp Án Mẫu</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình số câu hỏi, đáp án đúng và thang điểm tương ứng
            </p>
          </div>

          {isSavedSuccess && (
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-emerald-500/40">
              <CheckCircle className="w-3.5 h-3.5" />
              Đã lưu đáp án!
            </span>
          )}
        </div>

        {/* Form Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên đề thi / Bài kiểm tra <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử giữa kỳ 1 Môn Toán"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Môn học / Lớp học (Tùy chọn)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Toán 9 - Lớp 9A1"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Question Count Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Số lượng câu hỏi
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {questionPresets.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleTotalChange(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  totalQuestions === num
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/50'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {num} câu
              </button>
            ))}

            <div className="flex items-center gap-1 ml-1">
              <input
                type="number"
                min={1}
                max={100}
                placeholder="Tùy ý"
                value={customTotalInput}
                onChange={(e) => {
                  setCustomTotalInput(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (val > 0 && val <= 100) handleTotalChange(val);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 text-center placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-400">câu</span>
            </div>
          </div>
        </div>

        {/* Input Method Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <label className="text-xs font-semibold text-slate-300">Phương thức nhập đáp án</label>
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                  inputMode === 'paste'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Cách 2: Dán nhanh</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('direct')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                  inputMode === 'direct'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Cách 1: Nhập trực tiếp</span>
              </button>
            </div>
          </div>

          {/* Mode 2: Fast Paste Area */}
          {inputMode === 'paste' ? (
            <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ví dụ: <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">A C B D A B C C D A</code> hoặc <code className="text-sky-300 bg-slate-800 px-1 py-0.5 rounded">1.A 2.C 3.B 4.D</code></span>
              </div>
              <textarea
                rows={3}
                value={pasteText}
                onChange={(e) => handleParsePaste(e.target.value)}
                placeholder="Dán hoặc gõ danh sách đáp án tại đây... (Ví dụ: A C B D A B C C D A)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-sky-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  Đã nhận diện: <strong className="text-emerald-400 font-bold">{Object.keys(answers).length}/{totalQuestions}</strong> câu
                </span>
                <button
                  type="button"
                  onClick={() => handleParsePaste(pasteText)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 px-2.5 py-1 rounded border border-slate-700 font-medium"
                >
                  Phân tích lại
                </button>
              </div>
            </div>
          ) : null}

          {/* Direct Selection Grid (always visible or for fine-tuning) */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Bảng đáp án ({totalQuestions} câu):</span>
              <span className="text-[11px] text-slate-400">Bấm vào ô để chọn phương án</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto p-2 bg-slate-900/90 rounded-xl border border-slate-700/80">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                const selected = answers[qNum] || null;
                const optionsList: AnswerOption[] = ['A', 'B', 'C', 'D', 'E'];

                return (
                  <div
                    key={qNum}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-300 w-12">
                      Câu {qNum}:
                    </span>

                    <div className="flex items-center gap-1">
                      {optionsList.map((opt) => {
                        const isChosen = selected === opt;
                        return (
                          <button
                            key={opt || 'none'}
                            type="button"
                            onClick={() => handleOptionSelect(qNum, opt)}
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition ${
                              isChosen
                                ? 'bg-sky-500 text-white ring-2 ring-sky-300 shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scoring Settings Section */}
        <div className="border-t border-slate-700/80 pt-4 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">Cấu hình thang điểm</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setScoringMethod('equal')}
              className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                scoringMethod === 'equal'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="scoring"
                checked={scoringMethod === 'equal'}
                onChange={() => setScoringMethod('equal')}
                className="mt-0.5 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-100">Cách 1: Mỗi câu bằng điểm nhau</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Điểm = (Số câu đúng / {totalQuestions}) × 10. Mỗi câu ={' '}
                  <strong className="text-sky-300">{(10 / totalQuestions).toFixed(2)}</strong> điểm.
                </p>
              </div>
            </label>

            <label
              onClick={() => setScoringMethod('custom')}
              className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition ${
                scoringMethod === 'custom'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="scoring"
                checked={scoringMethod === 'custom'}
                onChange={() => setScoringMethod('custom')}
                className="mt-0.5 text-sky-500 focus:ring-sky-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-100">Cách 2: Nhập điểm tùy chỉnh từng câu</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gán điểm số riêng cho từng câu (VD: Câu 1 - 20: 0.25d).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            <span>LƯU ĐÁP ÁN MẪU</span>
          </button>
        </div>
      </form>
    </div>
  );
};
