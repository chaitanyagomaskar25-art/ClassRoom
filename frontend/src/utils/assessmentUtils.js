/**
 * Assessment Evaluation & Grading Utilities
 */

/**
 * Automatically grades an assessment submission
 * Handles MCQs, True/False, and evaluates Short Answer and Programming questions
 */
export function gradeAssessmentSubmission(assessment, answers = {}, selfScores = {}) {
  if (!assessment || !assessment.questions) {
    return { score: 0, correctCount: 0, totalQuestions: 0, questionResults: [], passed: false };
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;

  const questionResults = assessment.questions.map((q) => {
    const qId = q.id;
    const userAnswer = answers[qId];

    if (q.type === 'mcq') {
      const isCorrect = Number(userAnswer) === Number(q.correctOption);
      const points = isCorrect ? 1 : 0;
      totalScore += points;
      maxPossibleScore += 1;
      if (isCorrect) correctCount += 1;

      return {
        questionId: qId,
        questionType: 'mcq',
        prompt: q.prompt,
        studentAnswer: userAnswer !== undefined ? Number(userAnswer) : null,
        correctAnswer: q.correctOption,
        isCorrect,
        explanation: q.explanation || 'Verified syllabus answer.',
        score: points,
        maxScore: 1
      };
    }

    if (q.type === 'true_false') {
      const boolUser = userAnswer === true || userAnswer === 'true';
      const isCorrect = boolUser === Boolean(q.correctAnswer);
      const points = isCorrect ? 1 : 0;
      totalScore += points;
      maxPossibleScore += 1;
      if (isCorrect) correctCount += 1;

      return {
        questionId: qId,
        questionType: 'true_false',
        prompt: q.prompt,
        studentAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        score: points,
        maxScore: 1
      };
    }

    if (q.type === 'short_answer') {
      const maxPts = q.maxScore || 3;
      maxPossibleScore += maxPts;
      // If student evaluated themselves or typed an answer
      const selfPts = selfScores[qId] !== undefined ? Number(selfScores[qId]) : (userAnswer && String(userAnswer).trim().length > 20 ? maxPts : 0);
      const awarded = Math.min(maxPts, Math.max(0, selfPts));
      totalScore += awarded;
      const isCorrect = awarded >= Math.ceil(maxPts * 0.7);
      if (isCorrect) correctCount += 1;

      return {
        questionId: qId,
        questionType: 'short_answer',
        prompt: q.prompt,
        studentAnswer: userAnswer || '',
        correctAnswer: q.modelAnswer,
        isCorrect,
        explanation: 'Evaluate your answer against the official model answer and rubric criteria.',
        score: awarded,
        maxScore: maxPts,
        rubricCriteria: q.rubricCriteria
      };
    }

    if (q.type === 'code' || q.type === 'applied') {
      maxPossibleScore += 4;
      const selfPts = selfScores[qId] !== undefined ? Number(selfScores[qId]) : 4;
      const awarded = Math.min(4, Math.max(0, selfPts));
      totalScore += awarded;
      const isCorrect = awarded >= 3;
      if (isCorrect) correctCount += 1;

      return {
        questionId: qId,
        questionType: q.type,
        prompt: q.prompt,
        studentAnswer: userAnswer || '',
        correctAnswer: q.solution,
        isCorrect,
        explanation: q.explanation,
        score: awarded,
        maxScore: 4
      };
    }

    // Default fallback
    maxPossibleScore += 1;
    return {
      questionId: qId,
      questionType: 'general',
      prompt: q.prompt || 'General question',
      isCorrect: true,
      score: 1,
      maxScore: 1
    };
  });

  const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  const passed = percentageScore >= (assessment.passingScore || 70);

  return {
    score: percentageScore,
    correctCount,
    totalQuestions: assessment.questions.length,
    passed,
    questionResults,
    maxPossibleScore,
    totalScore
  };
}

/**
 * Creates a focused retry assessment containing only questions that were answered incorrectly
 */
export function buildRetryAssessment(originalAssessment, incorrectQuestionIds = []) {
  if (!originalAssessment || !originalAssessment.questions) return null;
  const incorrectSet = new Set(incorrectQuestionIds);
  const filteredQuestions = originalAssessment.questions.filter((q) => incorrectSet.has(q.id));

  return {
    ...originalAssessment,
    id: `${originalAssessment.id}-retry`,
    title: `${originalAssessment.title} (Retry Missed Questions)`,
    totalQuestions: filteredQuestions.length,
    questions: filteredQuestions,
    isRetrySession: true,
    originalAssessmentId: originalAssessment.id
  };
}
