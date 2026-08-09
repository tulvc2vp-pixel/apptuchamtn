import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, Check, RotateCw, Sun, Contrast, AlertCircle, Sparkles, Smartphone, Video } from 'lucide-react';
import { processImageCanvas } from '../utils/imageProcessor';

interface CameraCaptureProps {
  onImageCaptured: (processedBase64: string) => void;
  onCancel?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, onCancel }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);

  // Preprocessing adjustment states
  const [brightness, setBrightness] = useState(15);
  const [contrast, setContrast] = useState(25);
  const [rotation, setRotation] = useState(0);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera Access Error:', err);
      setCameraError('Chưa được cấp quyền Camera trực tiếp. Vui lòng bấm nút "MỞ CAMERA ĐIỆN THOẠI" bên dưới để chụp trực tiếp.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Capture frame from video stream
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    stopCamera();
    setRawCapturedImage(dataUrl);
    applyAdjustments(dataUrl, brightness, contrast, rotation);
  };

  // Handle File Upload from Gallery or Native Camera
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      stopCamera();
      setRawCapturedImage(dataUrl);
      applyAdjustments(dataUrl, brightness, contrast, rotation);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Process adjustments
  const applyAdjustments = async (
    imgSource: string,
    bVal: number,
    cVal: number,
    rotDeg: number
  ) => {
    setIsProcessing(true);
    try {
      const processed = await processImageCanvas(imgSource, {
        brightness: bVal,
        contrast: cVal,
        rotation: rotDeg,
      });
      setPreviewBase64(processed);
    } catch (e) {
      console.error(e);
      setPreviewBase64(imgSource);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-run adjustment when sliders change
  const handleSliderChange = (b: number, c: number, rot: number) => {
    setBrightness(b);
    setContrast(c);
    setRotation(rot);
    if (rawCapturedImage) {
      applyAdjustments(rawCapturedImage, b, c, rot);
    }
  };

  const handleRetake = () => {
    setRawCapturedImage(null);
    setPreviewBase64(null);
  };

  const handleUseImage = () => {
    if (previewBase64) {
      onImageCaptured(previewBase64);
    } else if (rawCapturedImage) {
      onImageCaptured(rawCapturedImage);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20">
      {/* Hidden File Inputs */}
      {/* 1. Native Mobile Camera Capture */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 2. Choose from Photo Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!rawCapturedImage ? (
        /* Camera View & Frame Guidelines */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative">
          <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
            {isCameraActive ? (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Chụp Bảng Phương Án Học Sinh</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Chụp trực tiếp bằng Camera điện thoại hoặc sử dụng Web Stream
                  </p>
                </div>

                {cameraError && (
                  <div className="bg-amber-950/80 border border-amber-600/60 text-amber-200 text-xs p-3 rounded-xl flex items-center gap-2 max-w-sm mx-auto text-left">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="leading-relaxed">{cameraError}</span>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="pt-2 space-y-2 max-w-sm mx-auto">
                  <button
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2.5 transition active:scale-95"
                  >
                    <Smartphone className="w-5 h-5 text-sky-200" />
                    <span>📷 MỞ CAMERA ĐIỆN THOẠI (CHỤP TRỰC TIẾP)</span>
                  </button>

                  <button
                    onClick={startCamera}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
                  >
                    <Video className="w-4 h-4 text-indigo-400" />
                    <span>🎥 Mở Live Stream Webcam</span>
                  </button>
                </div>
              </div>
            )}

            {/* Alignment Overlay Guideline Box */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                {/* Top guide banner */}
                <div className="bg-black/70 backdrop-blur-md text-white text-[11px] font-medium py-1.5 px-3 rounded-full text-center mx-auto border border-white/20 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Căn chỉnh bảng trả lời vuông góc trong khung</span>
                </div>

                {/* Target Frame corners */}
                <div className="relative w-full h-[78%] border-2 border-sky-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Four Corner brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400"></div>
                </div>

                {/* Bottom guide text */}
                <div className="text-center text-[10px] text-slate-300 bg-black/60 py-1 px-2 rounded-md">
                  Giữ máy chắc tay và đảm bảo đủ ánh sáng
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-around gap-2">
            {/* Direct Mobile Camera Button */}
            <button
              onClick={() => nativeCameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-2 transition"
            >
              <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-500/50 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-[10px] font-semibold text-sky-300">Camera máy</span>
            </button>

            {/* Gallery Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-2 transition"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px]">Thư viện</span>
            </button>

            {/* Big Shutter / Start Camera button */}
            {isCameraActive && (
              <button
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full bg-white ring-4 ring-sky-500/50 flex items-center justify-center shadow-2xl transition active:scale-90"
              >
                <div className="w-12 h-12 rounded-full bg-sky-500 border-2 border-white"></div>
              </button>
            )}

            {/* Switch Camera direction */}
            {isCameraActive ? (
              <button
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white p-2 transition"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[11px]">Đổi camera</span>
              </button>
            ) : (
              <div className="w-10"></div>
            )}
          </div>
        </div>
      ) : (
        /* Image Preview & Preprocessing Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>Xem trước & Chuẩn hóa ảnh</span>
            </h3>
            {isProcessing && <span className="text-xs text-sky-400 animate-pulse">Đang xử lý ảnh...</span>}
          </div>

          {/* Processed Preview Box */}
          <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {previewBase64 ? (
              <img
                src={previewBase64}
                alt="Captured Sheet"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-400">Đang tải ảnh...</div>
            )}
          </div>

          {/* Controls: Brightness, Contrast & Rotation */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Độ sáng</span>
                  <span>{brightness}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={brightness}
                  onChange={(e) => handleSliderChange(Number(e.target.value), contrast, rotation)}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Contrast className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Tương phản</span>
                  <span>{contrast}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={contrast}
                  onChange={(e) => handleSliderChange(brightness, Number(e.target.value), rotation)}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Xoay ảnh:</span>
              <button
                type="button"
                onClick={() => {
                  const nextRot = (rotation + 90) % 360;
                  handleSliderChange(brightness, contrast, nextRot);
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Xoay 90° ({rotation}°)</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: Chụp lại & Sử dụng ảnh này */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Chụp lại</span>
            </button>

            <button
              onClick={handleUseImage}
              disabled={isProcessing}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Sử dụng ảnh này</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
