import React, { useState } from 'react';
import { ResultTable } from '../components/ResultTable';
import { Statistics } from '../components/Statistics';
import { StudentResult, MasterAnswerKey } from '../types';
import { Users, BarChart3, X, CheckCircle2, XCircle, Award } from 'lucide-react';

interface ResultsPageProps {
  results: StudentResult[];
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
  activeAnswerKeyTitle?: string;
  activeKey?: MasterAnswerKey | null;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  onDeleteResult,
  onClearAll,
  activeAnswerKeyTitle,
  activeKey,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'stats'>('list');
  const [selectedResultDetail, setSelectedResultDetail] = useState<StudentResult | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Sub Tab Switcher Header */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 max-w-xs mx-auto shadow-sm">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'list'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'stats'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Thống kê</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'list' ? (
        <ResultTable
          results={results}
          onViewDetail={(res) => setSelectedResultDetail(res)}
          onDeleteResult={onDeleteResult}
          onClearAll={onClearAll}
          activeAnswerKeyTitle={activeAnswerKeyTitle}
        />
      ) : (
        <Statistics
          results={results}
          totalQuestions={activeKey?.totalQuestions || 10}
        />
      )}

      {/* Review Student Detail Modal */}
      {selectedResultDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    {selectedResultDetail.studentName} — Lớp {selectedResultDetail.className}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedResultDetail.answerKeyTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedResultDetail(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">TỔNG ĐIỂM</div>
                  <div className="text-xl font-black text-sky-400">{selectedResultDetail.totalScore} / 10</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">CÂU ĐÚNG</div>
                  <div className="text-xl font-black text-emerald-400">{selectedResultDetail.correctCount} / {selectedResultDetail.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">TỶ LỆ ĐÚNG</div>
                  <div className="text-xl font-black text-indigo-400">{selectedResultDetail.percentage}%</div>
                </div>
              </div>

              {/* Cropped Image + Answer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedResultDetail.imageUri && (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black border border-slate-800">
                    <img
                      src={selectedResultDetail.imageUri}
                      alt="Student Sheet"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedResultDetail.comparisonDetails?.map((detail) => (
                    <div
                      key={detail.question}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        detail.isCorrect
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-rose-950/30 border-rose-900/60'
                      }`}
                    >
                      <div className="font-bold text-slate-300">Câu {detail.question}:</div>
                      <div className="text-slate-400">
                        Mẫu: <strong className="text-sky-400 font-bold">{detail.masterAnswer}</strong> | HS: <strong className={detail.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{detail.studentAnswer || '-'}</strong>
                      </div>
                      <div>
                        {detail.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-right">
              <button
                onClick={() => setSelectedResultDetail(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
