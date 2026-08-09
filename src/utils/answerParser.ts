import { AnswerOption } from '../types';

/**
 * Parses raw text input into a map of question numbers to answer options.
 * Examples supported:
 * - "A C B D A B C C D A"
 * - "1.A 2.C 3.B 4.D 5.A 6.B 7.C 8.C 9.D 10.A"
 * - "1A 2C 3B 4D 5A"
 * - "1:A, 2:B, 3:C"
 * - "1-A 2-B 3-C"
 */
export function parsePastedAnswers(rawText: string, expectedCount: number = 10): Record<number, AnswerOption> {
  const result: Record<number, AnswerOption> = {};
  if (!rawText || !rawText.trim()) return result;

  const text = rawText.trim().toUpperCase();

  // Pattern 1: Explicit numbered format like "1.A 2.C" or "1:A" or "1A" or "1-A"
  const numberedRegex = /(\d+)\s*[\.\:\-\s]*([A-E])/g;
  let match;
  let matchCount = 0;

  while ((match = numberedRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const ans = match[2] as AnswerOption;
    if (qNum >= 1 && qNum <= 100 && ['A', 'B', 'C', 'D', 'E'].includes(ans!)) {
      result[qNum] = ans;
      matchCount++;
    }
  }

  // Pattern 2: Simple sequence of characters separated by space, comma, tab, or newline: "A C B D A B C C D A"
  if (matchCount === 0) {
    const tokens = text.split(/[\s,\t\n\.\-\;]+/);
    let qNum = 1;
    for (const token of tokens) {
      const cleanToken = token.trim();
      if (cleanToken && ['A', 'B', 'C', 'D', 'E'].includes(cleanToken)) {
        result[qNum] = cleanToken as AnswerOption;
        qNum++;
        if (qNum > expectedCount) break;
      }
    }
  }

  return result;
}

/**
 * Formats answer key map into clean readable display text
 */
export function formatAnswerKeyString(answers: Record<number, AnswerOption>, total: number): string {
  const parts: string[] = [];
  for (let i = 1; i <= total; i++) {
    const ans = answers[i] || '?';
    parts.push(`${i}.${ans}`);
  }
  return parts.join(' ');
}

/**
 * Formats simple answer string e.g. "A C B D A"
 */
export function formatAnswerKeyLettersOnly(answers: Record<number, AnswerOption>, total: number): string {
  const parts: string[] = [];
  for (let i = 1; i <= total; i++) {
    parts.push(answers[i] || '-');
  }
  return parts.join(' ');
}
