/**
 * Image processing utilities using HTML5 Canvas API
 */

export interface ImageAdjustOptions {
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  grayscale?: boolean;
  rotation?: number;   // 0, 90, 180, 270
}

/**
 * Process base64 or image element with canvas adjustments (brightness, contrast, sharpening)
 */
export async function processImageCanvas(
  imageSource: string,
  options: ImageAdjustOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { brightness = 0, contrast = 0, grayscale = false, rotation = 0 } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(imageSource);
      }

      // Max dimensions for speed and high AI vision clarity
      const maxDim = 1600;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      // Handle orientation rotation
      if (rotation === 90 || rotation === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();

      // Apply rotation transformation
      if (rotation === 90) {
        ctx.translate(height, 0);
        ctx.rotate((90 * Math.PI) / 180);
      } else if (rotation === 180) {
        ctx.translate(width, height);
        ctx.rotate((180 * Math.PI) / 180);
      } else if (rotation === 270) {
        ctx.translate(0, width);
        ctx.rotate((270 * Math.PI) / 180);
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      // Extract pixel data for brightness, contrast & grayscale adjustment
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Contrast factor calculation
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. Grayscale
        if (grayscale) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray;
          g = gray;
          b = gray;
        }

        // 2. Brightness
        r += brightness;
        g += brightness;
        b += brightness;

        // 3. Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Clamp 0..255
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imageData, 0, 0);

      const processedBase64 = canvas.toDataURL('image/jpeg', 0.92);
      resolve(processedBase64);
    };

    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

/**
 * Generate a visual synthetic answer sheet image for DEMO mode directly on canvas!
 */
export function generateDemoAnswerSheetCanvas(
  studentName: string = "Nguyễn Văn A",
  className: string = "9A1",
  totalQuestions: number = 10,
  answers: Record<number, string> = { 1: "A", 2: "C", 3: "B", 4: "A", 5: "A", 6: "B", 7: "D", 8: "C", 9: "D", 10: "A" }
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background sheet
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 600, 800);

  // Border frame
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, 570, 770);

  // Header Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PHIẾU TRẢ LỜI TRẮC NGHIỆM AI', 300, 50);

  // Alignment corner markers
  ctx.fillStyle = '#000000';
  ctx.fillRect(25, 25, 25, 25);
  ctx.fillRect(550, 25, 25, 25);
  ctx.fillRect(25, 750, 25, 25);
  ctx.fillRect(550, 750, 25, 25);

  // Student Info Box
  ctx.textAlign = 'left';
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.strokeRect(40, 80, 520, 70);
  ctx.fillText(`HỌ VÀ TÊN: ${studentName.toUpperCase()}`, 55, 110);
  ctx.fillText(`LỚP: ${className}`, 55, 135);
  ctx.fillText(`MÃ ĐỀ: 101`, 380, 135);

  // Questions grid header
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('CÂU HỎI', 60, 185);
  ctx.fillText('A    B    C    D', 180, 185);

  if (totalQuestions > 15) {
    ctx.fillText('CÂU HỎI', 320, 185);
    ctx.fillText('A    B    C    D', 440, 185);
  }

  // Draw question rows
  const options = ['A', 'B', 'C', 'D'];
  const startY = 210;
  const rowHeight = 35;

  for (let q = 1; q <= totalQuestions; q++) {
    const isCol2 = q > 15;
    const colOffsetX = isCol2 ? 260 : 0;
    const rowIdx = isCol2 ? q - 16 : q - 1;
    const y = startY + rowIdx * rowHeight;

    if (y > 720) break;

    // Question number
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Câu ${q < 10 ? '0' + q : q}:`, 55 + colOffsetX, y);

    const selectedAns = answers[q] || null;

    options.forEach((opt, optIdx) => {
      const circleX = 185 + optIdx * 35 + colOffsetX;
      const circleY = y - 5;
      const radius = 11;

      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);

      if (selectedAns === opt) {
        // Filled circle
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, circleX, circleY + 4);
        ctx.textAlign = 'left';
      } else {
        // Empty circle
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(opt, circleX, circleY + 4);
        ctx.textAlign = 'left';
      }
    });
  }

  // Footer instructions
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('* Hướng dẫn: Dùng bút tô kín ô tròn chứa phương án lựa chọn.', 300, 755);

  return canvas.toDataURL('image/jpeg', 0.95);
}
