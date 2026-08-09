export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E' | null;

export interface QuestionAnswer {
  question: number;
  answer: AnswerOption;
  confidence?: number; // 0.0 to 1.0
  isUncertain?: boolean; // confidence < 0.80 or missing/multi
}

export interface MasterAnswerKey {
  id: string;
  title: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
  answers: Record<number, AnswerOption>;
  scoringMethod: 'equal' | 'custom';
  pointsPerQuestion?: number; // e.g., 10 / totalQuestions or 0.25
  customPoints?: Record<number, number>; // question number -> points
}

export interface ComparisonDetail {
  question: number;
  masterAnswer: AnswerOption;
  studentAnswer: AnswerOption;
  isCorrect: boolean;
  confidence: number;
  isUncertain: boolean;
  pointsAwarded: number;
  maxPoints: number;
}

export interface StudentResult {
  id: string;
  studentCode?: string;
  studentName: string;
  className: string;
  answerKeyId: string;
  answerKeyTitle: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  uncertainCount: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  timestamp: string;
  imageUri?: string;
  answers: QuestionAnswer[];
  comparisonDetails: ComparisonDetail[];
  hasBeenVerified: boolean; // Teacher confirmed results
}

export interface AppSettings {
  geminiApiKey: string;
  recognitionMode: 'ai' | 'omr' | 'auto';
  uncertainThreshold: number; // default 0.80
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface ScoreDistribution {
  range: string; // "0-4.9", "5-6.4", "6.5-7.9", "8-10"
  count: number;
  percentage: number;
  color: string;
}

export interface StatisticsData {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  passRate: number;
  distribution: ScoreDistribution[];
  questionStats: {
    question: number;
    correctCount: number;
    correctRate: number;
    mostCommonAnswer: AnswerOption;
  }[];
}
