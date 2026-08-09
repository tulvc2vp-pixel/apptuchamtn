import * as XLSX from 'xlsx';
import { StudentResult } from '../types';

export function exportResultsToExcel(
  results: StudentResult[],
  answerKeyTitle: string = 'Dap_An_Mau'
): void {
  if (!results || results.length === 0) {
    alert('Chưa có dữ liệu kết quả để xuất Excel!');
    return;
  }

  // Determine maximum question count in the batch
  const maxQuestions = Math.max(...results.map((r) => r.totalQuestions || 10));

  // Build Excel Headers
  const headers = [
    'STT',
    'Họ và tên',
    'Lớp',
    'Số câu đúng',
    'Số câu sai',
    'Tổng số câu',
    'Điểm số',
    'Tỷ lệ đúng (%)',
    'Xếp loại',
  ];

  // Add Question columns: Câu 1, Câu 2, ..., Câu N
  for (let q = 1; q <= maxQuestions; q++) {
    headers.push(`Câu ${q}`);
  }

  headers.push('Thời gian chấm');

  // Build Data Rows
  const rows = results.map((student, index) => {
    let rank = 'Trung bình';
    if (student.totalScore >= 8.0) rank = 'Giỏi';
    else if (student.totalScore >= 6.5) rank = 'Khá';
    else if (student.totalScore < 5.0) rank = 'Yếu';

    const rowData: (string | number)[] = [
      index + 1,
      student.studentName || 'Học sinh chưa đặt tên',
      student.className || 'Chưa rõ',
      student.correctCount,
      student.incorrectCount,
      student.totalQuestions,
      student.totalScore,
      `${student.percentage}%`,
      rank,
    ];

    // Append individual question choices
    for (let q = 1; q <= maxQuestions; q++) {
      const qDetail = student.comparisonDetails?.find((d) => d.question === q);
      const studentChoice = qDetail?.studentAnswer || '-';
      const isCorrect = qDetail?.isCorrect ? '✅' : '❌';
      rowData.push(studentChoice ? `${studentChoice} (${isCorrect})` : '-');
    }

    rowData.push(new Date(student.timestamp).toLocaleString('vi-VN'));
    return rowData;
  });

  // Combine into sheet data
  const sheetData = [
    [`BẢNG KẾT QUẢ CHẤM TRẮC NGHIỆM AI - ${answerKeyTitle.toUpperCase()}`],
    [`Ngày xuất file: ${new Date().toLocaleDateString('vi-VN')} | Tổng số học sinh: ${results.length}`],
    [], // empty spacer row
    headers,
    ...rows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for beautiful spreadsheet display
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 22 }, // Họ tên
    { wch: 10 }, // Lớp
    { wch: 12 }, // Đúng
    { wch: 12 }, // Sai
    { wch: 12 }, // Tổng
    { wch: 10 }, // Điểm
    { wch: 14 }, // Tỷ lệ
    { wch: 12 }, // Xếp loại
  ];

  for (let q = 1; q <= maxQuestions; q++) {
    colWidths.push({ wch: 10 });
  }
  colWidths.push({ wch: 20 }); // Timestamp

  worksheet['!cols'] = colWidths;

  // Create workbook and write file
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kết Quả Chấm Bài');

  const cleanTitle = answerKeyTitle.replace(/[^a-zA-Z0-9_ -]/g, '').trim() || 'Cham_Trac_Nghiem';
  const fileName = `${cleanTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
