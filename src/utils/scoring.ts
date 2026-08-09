import {
  MasterAnswerKey,
  QuestionAnswer,
  ComparisonDetail,
  StudentResult,
  StatisticsData,
  ScoreDistribution,
  AnswerOption
} from '../types';

export function compareStudentWithKey(
  studentAnswers: QuestionAnswer[],
  masterKey: MasterAnswerKey
): {
  comparisonDetails: ComparisonDetail[];
  correctCount: number;
  incorrectCount: number;
  uncertainCount: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
} {
  const comparisonDetails: ComparisonDetail[] = [];
  let correctCount = 0;
  let incorrectCount = 0;
  let uncertainCount = 0;
  let totalScore = 0;
  const maxScore = 10.0; // Standard 10-point scale

  const totalQ = masterKey.totalQuestions || 10;
  const isCustomScoring = masterKey.scoringMethod === 'custom';
  const defaultPointsPerQ = 10.0 / totalQ;

  for (let i = 1; i <= totalQ; i++) {
    const masterAns = masterKey.answers[i] || null;
    const studentQ = studentAnswers.find((a) => a.question === i);
    const studentAns = studentQ?.answer || null;
    const confidence = studentQ?.confidence ?? 1.0;
    const isUncertain = confidence < 0.80 || studentAns === null;

    const isCorrect = masterAns !== null && studentAns !== null && masterAns === studentAns;

    let qMaxPoints = defaultPointsPerQ;
    if (isCustomScoring && masterKey.customPoints && masterKey.customPoints[i] !== undefined) {
      qMaxPoints = masterKey.customPoints[i];
    }

    const pointsAwarded = isCorrect ? qMaxPoints : 0;

    if (isCorrect) {
      correctCount++;
      totalScore += pointsAwarded;
    } else {
      incorrectCount++;
    }

    if (isUncertain) {
      uncertainCount++;
    }

    comparisonDetails.push({
      question: i,
      masterAnswer: masterAns,
      studentAnswer: studentAns,
      isCorrect,
      confidence,
      isUncertain,
      pointsAwarded,
      maxPoints: qMaxPoints,
    });
  }

  // Calculate scaled total score out of 10
  let finalScore = totalScore;
  if (isCustomScoring) {
    // Custom points sum up
    finalScore = Math.min(10.0, Math.round(totalScore * 100) / 100);
  } else {
    // Equal points per question: score = (correct / total) * 10
    finalScore = Math.round((correctCount / totalQ) * 10 * 100) / 100;
  }

  const percentage = Math.round((correctCount / totalQ) * 100);

  return {
    comparisonDetails,
    correctCount,
    incorrectCount,
    uncertainCount,
    totalScore: finalScore,
    maxScore,
    percentage,
  };
}

export function calculateStatistics(results: StudentResult[], totalQuestionsInKey: number = 10): StatisticsData {
  if (!results || results.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      passRate: 0,
      distribution: [
        { range: '0 - 4.9', count: 0, percentage: 0, color: '#ef4444' },
        { range: '5.0 - 6.4', count: 0, percentage: 0, color: '#f59e0b' },
        { range: '6.5 - 7.9', count: 0, percentage: 0, color: '#3b82f6' },
        { range: '8.0 - 10', count: 0, percentage: 0, color: '#22c55e' },
      ],
      questionStats: [],
    };
  }

  const totalStudents = results.length;
  const scores = results.map((r) => r.totalScore);
  const sumScore = scores.reduce((acc, s) => acc + s, 0);
  const averageScore = Math.round((sumScore / totalStudents) * 10) / 10;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  const passCount = results.filter((r) => r.totalScore >= 5.0).length;
  const passRate = Math.round((passCount / totalStudents) * 100);

  // Distribution buckets
  let dist0_49 = 0;
  let dist5_64 = 0;
  let dist65_79 = 0;
  let dist8_10 = 0;

  scores.forEach((s) => {
    if (s < 5.0) dist0_49++;
    else if (s < 6.5) dist5_64++;
    else if (s < 8.0) dist65_79++;
    else dist8_10++;
  });

  const distribution: ScoreDistribution[] = [
    {
      range: '0 - 4.9 (Yếu)',
      count: dist0_49,
      percentage: Math.round((dist0_49 / totalStudents) * 100),
      color: '#ef4444',
    },
    {
      range: '5.0 - 6.4 (TB)',
      count: dist5_64,
      percentage: Math.round((dist5_64 / totalStudents) * 100),
      color: '#f59e0b',
    },
    {
      range: '6.5 - 7.9 (Khá)',
      count: dist65_79,
      percentage: Math.round((dist65_79 / totalStudents) * 100),
      color: '#3b82f6',
    },
    {
      range: '8.0 - 10 (Giỏi)',
      count: dist8_10,
      percentage: Math.round((dist8_10 / totalStudents) * 100),
      color: '#22c55e',
    },
  ];

  // Per question breakdown
  const questionStats = [];
  const maxQ = Math.max(totalQuestionsInKey, ...results.map((r) => r.totalQuestions || 10));

  for (let q = 1; q <= maxQ; q++) {
    let correct = 0;
    const answerCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    results.forEach((r) => {
      const detail = r.comparisonDetails?.find((d) => d.question === q);
      if (detail?.isCorrect) correct++;
      if (detail?.studentAnswer) {
        answerCounts[detail.studentAnswer] = (answerCounts[detail.studentAnswer] || 0) + 1;
      }
    });

    let mostCommon: AnswerOption = null;
    let maxCount = 0;
    Object.entries(answerCounts).forEach(([ans, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = ans as AnswerOption;
      }
    });

    questionStats.push({
      question: q,
      correctCount: correct,
      correctRate: Math.round((correct / totalStudents) * 100),
      mostCommonAnswer: mostCommon,
    });
  }

  return {
    totalStudents,
    averageScore,
    highestScore,
    lowestScore,
    passCount,
    passRate,
    distribution,
    questionStats,
  };
}
