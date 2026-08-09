import React, { useState } from 'react';
import { StudentResult } from '../types';
import { exportResultsToExcel } from '../utils/excelExporter';
import { Search, Download, Trash2, Eye, FileSpreadsheet, ArrowUpDown, Filter, Sparkles, UserCheck } from 'lucide-react';

interface ResultTableProps {
  results: StudentResult[];
  onViewDetail: (result: StudentResult) => void;
  onDeleteResult: (id: string) => void;
  onClearAll: () => void;
  activeAnswerKeyTitle?: string;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  results,
  onViewDetail,
  onDeleteResult,
  onClearAll,
  activeAnswerKeyTitle = 'Danh Sách Bài Chấm',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique class list for filter dropdown
  const uniqueClasses = Array.from(new Set(results.map((r) => r.className || 'Khác'))).filter(Boolean);

  // Filter & Sort results
  const filteredResults = results
    .filter((r) => {
      const matchSearch =
        (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.className || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === 'all' || r.className === selectedClass;
      return matchSearch && matchClass;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') return b.totalScore - a.totalScore;
      return a.totalScore - b.totalScore;
    });

  const handleExportExcel = () => {
    exportResultsToExcel(filteredResults, activeAnswerKeyTitle);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-400" />
              <span>Danh Sách Kết Quả ({results.length} bài)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quản lý danh sách điểm học sinh, chỉnh sửa và xuất file Báo Cáo Excel
            </p>
          </div>

          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={results.length === 0}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📊 XUẤT EXCEL</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-800">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên hoặc lớp..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Class Filter */}
          <div className="sm:col-span-3 relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              <option value="all">Tất cả các lớp</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Lớp {cls}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Sort Order Toggle */}
          <div className="sm:col-span-3">
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 font-medium flex items-center justify-between hover:bg-slate-800 transition"
            >
              <span>{sortOrder === 'desc' ? 'Điểm: Cao → Thấp' : 'Điểm: Thấp → Cao'}</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Table / Card List */}
      {filteredResults.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-300">Chưa có dữ liệu kết quả bài chấm</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Chụp hoặc tải ảnh phiếu trả lời trắc nghiệm của học sinh để tiến hành chấm tự động.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="p-3 text-center">STT</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3 text-center">Đúng / Tổng</th>
                  <th className="p-3 text-center">Điểm số</th>
                  <th className="p-3 text-center font-semibold">Tỷ lệ</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredResults.map((item, idx) => {
                  let scoreBadge = 'bg-slate-800 text-slate-300';
                  if (item.totalScore >= 8.0) scoreBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                  else if (item.totalScore >= 6.5) scoreBadge = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  else if (item.totalScore < 5.0) scoreBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/60 transition group cursor-pointer"
                      onClick={() => onViewDetail(item)}
                    >
                      <td className="p-3 text-center font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{item.studentName}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {item.className || 'Chưa rõ'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className="text-emerald-400">{item.correctCount}</span> /{' '}
                        <span className="text-slate-400">{item.totalQuestions}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-lg border ${scoreBadge}`}
                        >
                          {item.totalScore}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium text-slate-300">
                        {item.percentage}%
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDetail(item)}
                            title="Xem chi tiết"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa kết quả của học sinh "${item.studentName}"?`)) {
                                onDeleteResult(item.id);
                              }
                            }}
                            title="Xóa kết quả"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Clear All Data */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Hiển thị <strong>{filteredResults.length}</strong> / <strong>{results.length}</strong> học sinh
            </span>

            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa tất cả danh sách kết quả học sinh?')) {
                  onClearAll();
                }
              }}
              className="text-rose-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ kết quả</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
