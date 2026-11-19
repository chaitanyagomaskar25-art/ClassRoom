/**
 * At-Risk Student Detection Utility
 * Evaluates curriculum progress, quiz averages, repeated failures,
 * inactivity, and overdue assignments to compute attention level and flag reasons.
 */

export function evaluateStudentRisk({
  completionPercent = 0,
  averageQuizScore = null,
  quizAttemptsCount = 0,
  failedQuizzesCount = 0,
  daysInactive = 0,
  overdueAssignmentsCount = 0
}) {
  const flags = [];
  const reasons = [];

  // 1. Academic Progress Check
  if (completionPercent < 20) {
    flags.push('CRITICAL_LOW_PROGRESS');
    reasons.push(`Low syllabus progress (${completionPercent}% completed)`);
  } else if (completionPercent < 40) {
    flags.push('MODERATE_LOW_PROGRESS');
    reasons.push(`Lagging syllabus progress (${completionPercent}% completed)`);
  }

  // 2. Quiz Performance Check
  if (averageQuizScore != null) {
    if (averageQuizScore < 45) {
      flags.push('CRITICAL_LOW_QUIZ_SCORE');
      reasons.push(`Critical quiz performance average (${averageQuizScore}% — passing threshold is 70%)`);
    } else if (averageQuizScore < 60) {
      flags.push('LOW_QUIZ_SCORE');
      reasons.push(`Below benchmark quiz average (${averageQuizScore}%)`);
    }
  }

  // 3. Repeated Quiz Failures
  if (failedQuizzesCount >= 3) {
    flags.push('REPEATED_QUIZ_FAILURES');
    reasons.push(`${failedQuizzesCount} failed quiz attempts (scored < 70%)`);
  } else if (failedQuizzesCount === 2) {
    flags.push('MULTIPLE_QUIZ_FAILURES');
    reasons.push(`2 quiz attempts below passing score`);
  }

  // 4. Inactivity
  if (daysInactive >= 14) {
    flags.push('EXTENDED_INACTIVITY');
    reasons.push(`Inactive for ${daysInactive} days`);
  } else if (daysInactive >= 7) {
    flags.push('INACTIVITY_WARNING');
    reasons.push(`No activity in the last ${daysInactive} days`);
  }

  // 5. Overdue Deliverables
  if (overdueAssignmentsCount > 0) {
    flags.push('OVERDUE_ASSIGNMENTS');
    reasons.push(`${overdueAssignmentsCount} overdue assignment${overdueAssignmentsCount > 1 ? 's' : ''}`);
  }

  // Attention Level Categorization
  let level = 'on_track';
  if (
    flags.includes('CRITICAL_LOW_QUIZ_SCORE') ||
    flags.includes('EXTENDED_INACTIVITY') ||
    flags.length >= 3 ||
    (flags.includes('CRITICAL_LOW_PROGRESS') && daysInactive >= 7)
  ) {
    level = 'critical';
  } else if (flags.length > 0) {
    level = 'moderate';
  }

  return {
    level, // 'critical' | 'moderate' | 'on_track'
    flags,
    reasons,
    flagCount: flags.length,
    needsAttention: level !== 'on_track',
    score: Math.max(0, 100 - flags.length * 25)
  };
}
