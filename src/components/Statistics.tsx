import React from 'react';
import { StudentResult } from '../types';
import { calculateStatistics } from '../utils/scoring';
import { Users, TrendingUp, Award, AlertCircle, BarChart2, CheckCircle2, Target } from 'lucide-react';

interface StatisticsProps {
  results: StudentResult[];
  totalQuestions?: number;
}

export const Statistics: React.FC<StatisticsProps> = ({ results, totalQuestions = 10 }) => {
  const stats = calculateStatistics(results, totalQuestions);

  if (results.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <BarChart2 className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-300">Chưa có dữ liệu thống kê</h3>
        <p className="text-xs text-slate-400">
          Hãy tiến hành chấm ít nhất 1 bài để xem biểu đồ phân bố điểm số và phân tích chi tiết.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Top Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Students */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">TỔNG HỌC SINH</div>
            <div className="text-lg font-black text-slate-100">{stats.totalStudents}</div>
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">ĐIỂM TRUNG BÌNH</div>
            <div className="text-lg font-black text-indigo-400">{stats.averageScore}</div>
          </div>
        </div>

        {/* Metric 3: Pass Rate */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">TỶ LỆ ĐẠT (≥5.0)</div>
            <div className="text-lg font-black text-emerald-400">{stats.passRate}%</div>
          </div>
        </div>

        {/* Metric 4: High / Low Score */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400">CAO / THẤP NHẤT</div>
            <div className="text-sm font-black text-slate-100">
              <span className="text-emerald-400">{stats.highestScore}</span> /{' '}
              <span className="text-rose-400">{stats.lowestScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <span>Phân Bố Điểm Số Học Sinh</span>
          </h3>
          <span className="text-[11px] text-slate-400">4 Thang phân loại</span>
        </div>

        <div className="space-y-3">
          {stats.distribution.map((dist) => (
            <div key={dist.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{dist.range}</span>
                <span className="text-slate-400">
                  <strong className="text-slate-200">{dist.count}</strong> học sinh ({dist.percentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(dist.percentage, dist.count > 0 ? 5 : 0)}%`,
                    backgroundColor: dist.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per Question Difficulty Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Tỷ Lệ Làm Đúng Theo Từng Câu Hỏi</span>
          </h3>
          <span className="text-[11px] text-slate-400">Phân tích độ khó</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {stats.questionStats.map((q) => {
            let color = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
            if (q.correctRate < 50) color = 'text-rose-400 border-rose-500/40 bg-rose-950/20';
            else if (q.correctRate < 75) color = 'text-amber-400 border-amber-500/40 bg-amber-950/20';

            return (
              <div
                key={q.question}
                className={`p-2.5 rounded-xl border text-center space-y-1 ${color}`}
              >
                <div className="text-xs font-bold">Câu {q.question}</div>
                <div className="text-base font-black">{q.correctRate}%</div>
                <div className="text-[10px] text-slate-400">
                  {q.correctCount}/{stats.totalStudents} làm đúng
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
