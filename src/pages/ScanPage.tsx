import React, { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { ScanResult } from '../components/ScanResult';
import { MasterAnswerKey, StudentResult } from '../types';
import { gradeAnswerSheetWithGemini } from '../services/geminiService';
import { compareStudentWithKey } from '../utils/scoring';
import { AlertCircle, Camera, Layers, Users, Sparkles, CheckCircle, RefreshCw, Printer } from 'lucide-react';

interface ScanPageProps {
  activeKey: MasterAnswerKey | null;
  geminiApiKey: string;
  onSaveResult: (result: StudentResult) => void;
  onGoToAnswerKey: () => void;
  onGoToSettings: () => void;
  batchResults: StudentResult[];
  onOpenPrintModal?: () => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({
  activeKey,
  geminiApiKey,
  onSaveResult,
  onGoToAnswerKey,
  onGoToSettings,
  batchResults,
  onOpenPrintModal,
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<StudentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  if (!activeKey) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-8 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-base">Chưa Chọn Đáp Án Mẫu</h3>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng tạo hoặc kích hoạt một Bảng Đáp Án Mẫu trước khi tiến hành chụp và chấm bài.
          </p>
        </div>
        <button
          onClick={onGoToAnswerKey}
          className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
        >
          ➕ TẠO ĐÁP ÁN MẪU NGAY
        </button>
      </div>
    );
  }

  const handleImageCaptured = async (processedBase64: string) => {
    setIsScanning(false);
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await gradeAnswerSheetWithGemini(
        processedBase64,
        activeKey.totalQuestions,
        geminiApiKey
      );

      if (!response.success && response.rawError) {
        setErrorMessage(response.rawError);
        setIsAnalyzing(false);
        return;
      }

      // Default generated student name if blank
      const finalName = response.studentName || `Học sinh ${batchCount + 1}`;
      const finalClass = response.className || '9A1';

      // Evaluate student answers against master key
      const evaluation = compareStudentWithKey(response.answers, activeKey);

      const newResult: StudentResult = {
        id: `res-${Date.now()}`,
        studentName: finalName,
        className: finalClass,
        answerKeyId: activeKey.id,
        answerKeyTitle: activeKey.title,
        totalQuestions: activeKey.totalQuestions,
        correctCount: evaluation.correctCount,
        incorrectCount: evaluation.incorrectCount,
        uncertainCount: evaluation.uncertainCount,
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        timestamp: new Date().toISOString(),
        imageUri: processedBase64,
        answers: response.answers,
        comparisonDetails: evaluation.comparisonDetails,
        hasBeenVerified: false,
      };

      setCurrentResult(newResult);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Có lỗi xảy ra trong quá trình xử lý ảnh.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = (finalResult: StudentResult) => {
    onSaveResult(finalResult);
    setBatchCount((prev) => prev + 1);

    if (isBatchMode) {
      // In batch mode, directly re-trigger camera scanning for next sheet
      setCurrentResult(null);
      setIsScanning(true);
    } else {
      // Single mode: reset to scan again
      setCurrentResult(null);
      setIsScanning(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Key Info & Mode Switcher */}
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Đang chấm theo:</span>
            <p className="text-xs font-bold text-slate-100 truncate">{activeKey.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrintModal && (
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 transition"
              title="Tải mẫu phiếu in cho học sinh"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>In phiếu bài làm</span>
            </button>
          )}

          {/* Batch Mode Toggle (Chấm nhiều bài) */}
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              isBatchMode
                ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-400/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isBatchMode ? 'Chấm nhiều bài' : 'Chấm nhiều bài'}</span>
          </button>
        </div>
      </div>

      {/* Analyzing Overlay Loading State */}
      {isAnalyzing && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 my-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border-2 border-sky-400 flex items-center justify-center text-sky-400 mx-auto animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-base">Đang kết nối Gemini Vision AI...</h3>
            <p className="text-xs text-slate-400">
              Hệ thống AI đang phát hiện vùng bảng phương án và nhận diện lựa chọn của học sinh.
            </p>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && !isAnalyzing && (
        <div className="max-w-md mx-auto bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>KHÔNG THỂ NHẬN DIỆN BẢNG PHƯƠNG ÁN</span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">{errorMessage}</p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                setErrorMessage(null);
                setIsScanning(true);
              }}
              className="flex-1 py-2 px-3 bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Chụp lại ảnh rõ hơn</span>
            </button>

            <button
              onClick={onGoToSettings}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              Cài đặt API
            </button>
          </div>
        </div>
      )}

      {/* View 1: Camera Capture */}
      {isScanning && !isAnalyzing && (
        <CameraCapture onImageCaptured={handleImageCaptured} />
      )}

      {/* View 2: Scan Result Comparison View */}
      {currentResult && !isAnalyzing && (
        <ScanResult
          result={currentResult}
          masterKey={activeKey}
          onSaveResult={handleSaveResult}
          onRescan={() => {
            setCurrentResult(null);
            setIsScanning(true);
          }}
        />
      )}
    </div>
  );
};
