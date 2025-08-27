/**
 * Hook: useExamIELTSBand
 *
 * Returns encouraging messaging based on IELTS band, exam mode, and IELTS type.
 * - mode: "reading" | "listening"
 * - ieltsType: 0 = Academic, 1 = General Training
 * - Listening uses a single conversion scale (ieltsType is ignored for messaging)
 */

import { IeltsTypeEnumIndex } from '@/types/reading/reading.types';

export type ExamMode = 'reading' | 'listening';

export type ExamIELTSBandResult = {
  headline: string;
  label: string;
  tip: string;
};

const labelFor = (mode: ExamMode, ieltsType: IeltsTypeEnumIndex): string => {
  if (mode === 'listening') return 'Listening'; // single scale for Listening
  return ieltsType === 0 ? 'Reading (Academic)' : 'Reading (General Training)';
};

const tipFor = (mode: ExamMode, ieltsType: IeltsTypeEnumIndex): string => {
  if (mode === 'listening') {
    return 'Use predict→confirm, track signpost words (however, meanwhile, finally), and double‑check word forms. 🎧';
  }
  // Reading tips vary slightly by type
  return ieltsType === 0
    ? 'Skim first, scan for keywords, watch for paraphrase in Academic passages. 📚'
    : 'Scan everyday texts fast—dates, names, numbers—and match synonyms in questions. 📰';
};

const sloganForBand = (band: number): string => {
  // Normalize to 0.5 steps and clamp strictly to IELTS reported range 2.5–9.0
  const normalized = Math.min(9, Math.max(2.5, Math.round(band * 2) / 2));
  const key = normalized.toFixed(1);

  const map: Record<string, string> = {
    '2.5': 'First milestone—celebrate progress and keep training!',
    '3.0': 'Beginner stride—master key question types one by one. 🧭🧰',
    '3.5': 'Foundation stage—short daily drills will pay off. ⏱️',
    '4.0': 'Keep building—review core grammar and common traps. 🔁🧱',
    '4.5': 'Solid start—focus on basics and pacing. 🌱🧭',
    '5.0': 'Steady steps—practice question types daily. 🛠️🧠',
    '5.5': "You're on track! Build vocab and refine tactics. 🧩📖",
    '6.0': 'Good momentum—tighten timing and accuracy. 🔥',
    '6.5': 'Nice progress—consistency will lift you higher. 🎯🚴',
    '7.0': 'Great job! Your foundation is solid—push for that next 0.5. 🔥',
    '7.5': 'Very strong performance—almost there to elite mastery. 🏆✨',
    '8.0': 'Fantastic work! Precision and strategy are clicking. 🔥',
    '8.5': "Phenomenal! You're operating at an expert level—keep shining. 🌟",
    '9.0': 'Legendary precision—native-like mastery. 🌟',
  };

  return map[key] ?? 'Keep going—consistent practice moves the needle. 🔁🎯';
};

const useExamIELTSBand = (
  band: number,
  mode: ExamMode,
  ieltsType: IeltsTypeEnumIndex
): ExamIELTSBandResult => {
  const headline = sloganForBand(band);
  const label = labelFor(mode, ieltsType);
  const tip = tipFor(mode, ieltsType);

  return {
    headline,
    label,
    tip,
  };
};

export default useExamIELTSBand;
