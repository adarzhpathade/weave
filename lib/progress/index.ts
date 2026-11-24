export type UnitProgressInput = {
  coveredTopics: number;
  totalTopics: number;
};

export type UnitProgress = {
  coveredTopics: number;
  totalTopics: number;
  percent: number;
};

export type ProgressStatusBand = "not_started" | "low" | "in_progress" | "mastered";

/**
 * A topic is covered when the student has at least one own note linked to it
 * via `note_links` (quizzes are not enabled yet).
 */
export function isTopicCovered(noteCount: number): boolean {
  return noteCount >= 1;
}

function computeUnitRatio(coveredTopics: number, totalTopics: number): number {
  if (totalTopics <= 0) {
    return 0;
  }
  const clampedCovered = Math.min(Math.max(coveredTopics, 0), totalTopics);
  return clampedCovered / totalTopics;
}

/**
 * Unit % = covered / total (0 if the unit has no topics), rounded to an integer.
 */
export function computeUnitPercent(coveredTopics: number, totalTopics: number): number {
  return Math.round(computeUnitRatio(coveredTopics, totalTopics) * 100);
}

/**
 * Computes covered count, total count, and rounded unit percentage from each
 * topic's note count.
 */
export function computeUnitProgress(topicNoteCounts: readonly number[]): UnitProgress {
  const totalTopics = topicNoteCounts.length;
  let coveredTopics = 0;

  for (const noteCount of topicNoteCounts) {
    if (isTopicCovered(noteCount)) {
      coveredTopics += 1;
    }
  }

  return {
    coveredTopics,
    totalTopics,
    percent: computeUnitPercent(coveredTopics, totalTopics),
  };
}

/**
 * Subject % = average of its units' percentages (0 if no units), rounded to an integer.
 */
export function computeSubjectPercent(units: readonly UnitProgressInput[]): number {
  if (units.length === 0) {
    return 0;
  }

  let ratioSum = 0;
  for (const unit of units) {
    ratioSum += computeUnitRatio(unit.coveredTopics, unit.totalTopics);
  }

  return Math.round((ratioSum / units.length) * 100);
}

/**
 * Semester % = average of its subjects' percentages (0 if no subjects), rounded to an integer.
 */
export function computeSemesterPercent(subjectPercents: readonly number[]): number {
  if (subjectPercents.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const percent of subjectPercents) {
    sum += Math.min(Math.max(percent, 0), 100);
  }

  return Math.round(sum / subjectPercents.length);
}

/**
 * Maps a 0-100 progress percentage to its status band (AGENTS.md §4).
 */
export function getProgressStatusBand(percent: number): ProgressStatusBand {
  if (percent <= 0) {
    return "not_started";
  }
  if (percent <= 39) {
    return "low";
  }
  if (percent <= 75) {
    return "in_progress";
  }
  return "mastered";
}
