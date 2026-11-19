import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileQuestion,
  FileText,
  Flag,
  GraduationCap,
  HelpCircle,
  Layers,
  ListChecks,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { gradeAssessmentSubmission } from '../utils/assessmentUtils.js';
import './InteractiveQuizPlayer.css';

export default function InteractiveQuizPlayer({
  assessment,
  onExit,
  onComplete,
  onRetryMissing
}) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user) || {};
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;
  const isLockedForSemester = Boolean(studentSem && assessment?.semester && Number(assessment.semester) !== studentSem);

  const [isGeneratingRetry, setIsGeneratingRetry] = useState(false);
  const questions = useMemo(() => assessment?.questions || [], [assessment]);
  const totalQuestions = questions.length;

  // 1. Single Question at a Time Navigation State
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex] || null;

  // 2. Answer Selection State
  const [answers, setAnswers] = useState({});
  const [flaggedIds, setFlaggedIds] = useState(new Set());
  const [selfScores, setSelfScores] = useState({});

  // 3. Configurable Countdown Timer State
  // Default: 1.5 minutes per question, minimum 5 minutes
  const defaultDurationMins = useMemo(() => {
    return assessment.estimatedMinutes || Math.max(5, Math.ceil(totalQuestions * 1.5));
  }, [assessment, totalQuestions]);

  const [configuredMinutes, setConfiguredMinutes] = useState(defaultDurationMins);
  const [timeRemaining, setTimeRemaining] = useState(defaultDurationMins * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);

  // 4. Modal and View States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);

  // 5. Post-Submission Review Filter
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'incorrect' | 'flagged'

  const timerRef = useRef(null);

  // Timer Tick Interval
  useEffect(() => {
    if (assessmentResult || isTimerPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assessmentResult, isTimerPaused]);

  // Handle countdown timeout
  const handleAutoSubmitOnTimeout = useCallback(() => {
    if (!assessmentResult) {
      handleFinalSubmit();
    }
  }, [assessmentResult]);

  // Handle answers selection
  const handleSelectMCQ = (qId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSelectTF = (qId, boolValue) => {
    setAnswers((prev) => ({ ...prev, [qId]: boolValue }));
  };

  const handleShortAnswerChange = (qId, text) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  // Toggle mark for review
  const handleToggleFlag = (qId) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Check if a question is answered
  const isQuestionAnswered = (q) => {
    if (!q) return false;
    const a = answers[q.id];
    if (q.type === 'mcq' || q.type === 'true_false') return a !== undefined && a !== null;
    if (q.type === 'short_answer') return (a || '').trim().length > 0;
    return false;
  };

  // Metrics
  const answeredCount = useMemo(() => {
    return questions.filter(isQuestionAnswered).length;
  }, [questions, answers]);

  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedIds.size;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Single Question Navigation
  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentIndex(idx);
    setShowPaletteDrawer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSubmitModal || assessmentResult) return;
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevQuestion();
      } else if (e.key === 'm' || e.key === 'M') {
        if (currentQuestion) {
          e.preventDefault();
          handleToggleFlag(currentQuestion.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, showSubmitModal, assessmentResult, currentQuestion]);

  // Adjust configured timer duration
  const handleApplyCustomDuration = (minutes) => {
    const mins = Math.max(1, Math.min(180, Number(minutes)));
    setConfiguredMinutes(mins);
    setTimeRemaining(mins * 60);
    setShowTimerConfig(false);
  };

  // Submit assessment and evaluate results
  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    setSubmitError('');

    const timeSpentSeconds = (configuredMinutes * 60) - timeRemaining;

    try {
      // 1. Grade locally using comprehensive grading engine as client baseline
      const localGrading = gradeAssessmentSubmission(assessment, answers, selfScores);

      // 2. Prepare payload for backend authoritative grading & storage
      const payload = {
        assessmentId: assessment.id || assessment.assessmentId,
        assessmentType: assessment.assessmentType || 'ai_generated',
        subjectCode: assessment.subjectCode,
        subjectName: assessment.subjectName,
        semester: assessment.semester,
        unitNumber: assessment.unitNumber,
        unitTitle: assessment.unitTitle,
        lessonTitle: assessment.title,
        topic: assessment.topic || assessment.unitTitle || '',
        quizConfig: assessment.quizConfig || {
          difficulty: assessment.difficulty || 'mixed',
          questionCount: assessment.totalQuestions || assessment.questions?.length || 10,
          questionTypes: assessment.questionTypes || ['mcq', 'true_false', 'short_answer'],
          topic: assessment.topic || '',
          source: assessment.source || 'ai-synthesis',
          title: assessment.title || ''
        },
        questions: assessment.questions || [],
        answers,
        selfScores,
        questionResults: localGrading.questionResults,
        score: localGrading.score,
        correctCount: localGrading.correctCount,
        totalQuestions: localGrading.totalQuestions,
        timeSpentSeconds,
        isRetry: Boolean(assessment.isRetrySession)
      };

      let responseData = null;
      try {
        const response = await api.post('/quizzes/submit-assessment', payload);
        responseData = unwrap(response);
      } catch (backendErr) {
        console.warn('Backend submission fallback to authoritative local grading:', backendErr.message);
      }

      const finalQuestionResults = responseData?.results || localGrading.questionResults;
      const finalScore = responseData?.score !== undefined ? responseData.score : localGrading.score;
      const finalCorrectCount = responseData?.correctCount !== undefined ? responseData.correctCount : localGrading.correctCount;
      const finalTotal = responseData?.totalQuestions !== undefined ? responseData.totalQuestions : localGrading.totalQuestions;

      const incorrectQuestionIds = responseData?.incorrectQuestionIds ||
        finalQuestionResults.filter((q) => !q.isCorrect).map((q) => q.questionId);

      let finalAIFeedback = responseData?.aiFeedback;
      let finalStudyRec = responseData?.studyRecommendation;

      if (!finalAIFeedback) {
        const missedResults = finalQuestionResults.filter((q) => !q.isCorrect);
        const weakTopics = Array.from(new Set(missedResults.map((q) => (q.topic || q.topicReference || assessment.topic || 'General Topic')).filter(Boolean)));
        finalAIFeedback = {
          overallAssessment: finalScore >= 70
            ? `Good academic mastery (${finalScore}%). You demonstrated solid understanding of ${assessment.subjectName || 'the course curriculum'}.`
            : `Needs revision (${finalScore}%). Critical conceptual gaps were detected in: ${weakTopics.join(', ') || 'this assessment'}. Review recommended lessons to consolidate principles.`,
          weakAreas: weakTopics.map((t) => ({
            topic: t,
            missedCount: missedResults.filter((q) => (q.topic || q.topicReference || assessment.topic) === t).length
          })),
          recommendedLessons: weakTopics.slice(0, 2).map((t, i) => ({
            lessonId: `${assessment.subjectCode || 'sub'}-u${assessment.unitNumber || 1}-l${i + 1}`,
            title: `${assessment.subjectName || 'Course'} Unit ${assessment.unitNumber || 1}: ${t}`,
            reason: `Strengthen core principles in ${t}`,
            url: `/learning/${assessment.subjectCode || ''}`
          }))
        };
        finalStudyRec = {
          action: finalScore >= 70 ? 'advance' : 'revise',
          title: finalScore >= 70 ? 'Advance to Next Unit' : `Review ${weakTopics[0] || 'Foundations'}`,
          description: finalScore >= 70
            ? 'You have passed this assessment. Proceed to the next syllabus module.'
            : 'Review key foundational lessons before retrying.',
          suggestedAction: finalScore >= 70 ? 'Next Lesson' : 'Review Module',
          url: `/learning/${assessment.subjectCode || ''}`
        };
      }

      const resultObject = {
        ...localGrading,
        score: finalScore,
        correctCount: finalCorrectCount,
        totalQuestions: finalTotal,
        questionResults: finalQuestionResults,
        incorrectQuestionIds,
        timeSpentSeconds,
        passed: finalScore >= (assessment.passingPercentage || 70),
        attemptNumber: responseData?.attemptNumber || 1,
        attemptId: responseData?.attempt?._id || responseData?.attempt?.id,
        aiFeedback: finalAIFeedback,
        studyRecommendation: finalStudyRec
      };

      setAssessmentResult(resultObject);
      if (onComplete) {
        onComplete(resultObject);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(getErrorMessage(err) || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format MM:SS
  const formatTime = (totalSec) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.floor(Math.max(0, totalSec) % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filtered post-submission review items
  const filteredReviewResults = useMemo(() => {
    if (!assessmentResult?.questionResults) return [];
    if (reviewFilter === 'incorrect') {
      return assessmentResult.questionResults.filter((q) => !q.isCorrect);
    }
    if (reviewFilter === 'flagged') {
      return assessmentResult.questionResults.filter((q) => flaggedIds.has(q.questionId));
    }
    return assessmentResult.questionResults;
  }, [assessmentResult, reviewFilter, flaggedIds]);

  // Restart retry session for missed questions
  const handleLaunchRetry = () => {
    if (!assessmentResult?.incorrectQuestionIds?.length) return;
    const incorrectIds = new Set(assessmentResult.incorrectQuestionIds);
    const retryQuestions = questions.filter((q) => incorrectIds.has(q.id));

    if (onRetryMissing) {
      onRetryMissing(retryQuestions);
    } else {
      // Internal retry state reset
      setAnswers({});
      setAssessmentResult(null);
      setCurrentIndex(0);
      setTimeRemaining(Math.max(3, Math.ceil(retryQuestions.length * 1.5)) * 60);
    }
  };

  // Launch concept retry focusing specifically on previously incorrect concepts
  const handleLaunchConceptRetry = async () => {
    setIsGeneratingRetry(true);
    try {
      let retryQuiz = null;
      try {
        const res = await api.post('/quizzes/generate-retry', { attemptId: assessmentResult?.attemptId });
        const data = unwrap(res);
        if (data?.quiz) retryQuiz = data.quiz;
      } catch (err) {
        console.warn('Backend retry generation fallback:', err.message);
      }

      if (retryQuiz && onRetryMissing) {
        onRetryMissing(retryQuiz.questions, retryQuiz);
      } else {
        handleLaunchRetry();
      }
    } finally {
      setIsGeneratingRetry(false);
    }
  };

  if (isLockedForSemester) {
    return (
      <div className="interactive-quiz-runner" style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: 480, background: 'var(--surface, #1e293b)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color, #334155)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
            Assessment Locked
          </h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            This quiz is for <strong>Semester {assessment?.semester}</strong>. As an enrolled student in <strong>Semester {studentSem}</strong>, access to other semesters is restricted.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onExit || (() => navigate('/quizzes'))}
            style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Quizzes</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ACTIVE QUIZ TAKING (ONE QUESTION AT A TIME)
  // =========================================================================
  if (!assessmentResult) {
    const q = currentQuestion;
    const qId = q?.id;
    const isFlagged = flaggedIds.has(qId);
    const currentAnswer = answers[qId];
    const isAnswered = isQuestionAnswered(q);

    return (
      <div className="interactive-quiz-runner">
        {/* Top Control Bar */}
        <header className="quiz-runner-header">
          <div className="runner-header-left">
            <button type="button" className="runner-exit-btn" onClick={onExit} title="Exit quiz">
              <ArrowLeft size={16} />
              <span>Exit Quiz</span>
            </button>
            <div className="runner-meta-strip">
              <span className="runner-pill sem">Sem {assessment.semester}</span>
              <span className="runner-pill sub">{assessment.subjectCode}</span>
              <span className="runner-pill unit">{assessment.unitTitle || `Unit ${assessment.unitNumber}`}</span>
              {assessment.difficulty && (
                <span className={`runner-pill diff ${String(assessment.difficulty).toLowerCase()}`}>
                  {String(assessment.difficulty).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="runner-header-right">
            {/* Configurable Countdown Timer */}
            <div className={`countdown-timer-box ${timeRemaining < 120 ? 'warning' : ''}`}>
              <Clock size={16} />
              <span className="timer-digits">{formatTime(timeRemaining)}</span>
              <button
                type="button"
                className="timer-control-btn"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isTimerPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
              </button>
              <button
                type="button"
                className="timer-config-btn"
                onClick={() => setShowTimerConfig(!showTimerConfig)}
                title="Configure Duration"
              >
                <span>⚙</span>
              </button>
            </div>

            {/* Question Palette Toggle */}
            <button
              type="button"
              className="palette-toggle-btn"
              onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
            >
              <Layers size={15} />
              <span>Question {currentIndex + 1}/{totalQuestions}</span>
            </button>
          </div>
        </header>

        {/* Timer Config Dropdown Modal */}
        {showTimerConfig && (
          <div className="timer-config-popup">
            <div className="timer-config-header">
              <Clock size={14} />
              <span>Adjust Quiz Duration</span>
              <button type="button" onClick={() => setShowTimerConfig(false)} className="close-mini">
                <X size={14} />
              </button>
            </div>
            <div className="timer-presets-row">
              {[5, 10, 15, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`preset-btn ${configuredMinutes === mins ? 'active' : ''}`}
                  onClick={() => handleApplyCustomDuration(mins)}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar & Status Line */}
        <div className="quiz-progress-section">
          <div className="progress-info-row">
            <div className="progress-counter">
              <strong>Question {currentIndex + 1}</strong> of {totalQuestions}
              <span className="progress-badge-answered">
                {answeredCount} Answered • {unansweredCount} Left
              </span>
            </div>
            <div className="progress-percentage">
              <span>{progressPercent}% Complete</span>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {submitError && (
          <div className="quiz-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {/* Main Card: One Question at a Time */}
        <main className="question-focused-container">
          {q ? (
            <article className="question-focused-card" key={qId}>
              {/* Question Header */}
              <div className="q-card-topbar">
                <div className="q-type-label">
                  <span className="q-step-num">Q{currentIndex + 1}</span>
                  <span className="q-type-name">
                    {q.type === 'mcq'
                      ? 'MULTIPLE CHOICE'
                      : q.type === 'true_false'
                      ? 'TRUE / FALSE'
                      : 'SHORT ANSWER'}
                  </span>
                  {q.difficulty && (
                    <span className={`q-card-diff-tag ${String(q.difficulty).toLowerCase()}`}>
                      {String(q.difficulty).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="q-topbar-actions">
                  {q.topicReference && (
                    <span className="q-topic-tag" title={`Syllabus Topic: ${q.topicReference}`}>
                      <Target size={12} />
                      <span>{q.topicReference}</span>
                    </span>
                  )}

                  {/* Mark for Review Button */}
                  <button
                    type="button"
                    className={`flag-question-btn ${isFlagged ? 'flagged' : ''}`}
                    onClick={() => handleToggleFlag(qId)}
                    title="Mark this question for review before submitting"
                  >
                    <Flag size={14} fill={isFlagged ? 'currentColor' : 'none'} />
                    <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <h2 className="q-prompt-heading">{q.prompt}</h2>

              {/* Interaction Form: MCQ, True/False, or Short Answer */}
              <div className="q-interaction-body">
                {/* 1. Multiple Choice (MCQ) */}
                {q.type === 'mcq' && (
                  <div className="mcq-options-stack">
                    {(q.options || []).map((optText, optIdx) => {
                      const isSelected = currentAnswer === optIdx;
                      return (
                        <label
                          key={optIdx}
                          className={`interactive-option-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectMCQ(qId, optIdx)}
                        >
                          <input
                            type="radio"
                            name={qId}
                            value={optIdx}
                            checked={isSelected}
                            onChange={() => handleSelectMCQ(qId, optIdx)}
                          />
                          <span className="option-letter-badge">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="option-text-span">{optText}</span>
                          {isSelected && <Check size={18} className="option-check-icon" />}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. True / False */}
                {q.type === 'true_false' && (
                  <div className="tf-options-stack">
                    <button
                      type="button"
                      className={`tf-big-btn true-btn ${currentAnswer === true ? 'selected' : ''}`}
                      onClick={() => handleSelectTF(qId, true)}
                    >
                      <CheckCircle2 size={22} />
                      <div className="tf-btn-content">
                        <strong>TRUE</strong>
                        <span>Statement is accurate based on computing principles</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`tf-big-btn false-btn ${currentAnswer === false ? 'selected' : ''}`}
                      onClick={() => handleSelectTF(qId, false)}
                    >
                      <XCircle size={22} />
                      <div className="tf-btn-content">
                        <strong>FALSE</strong>
                        <span>Statement contains inaccuracies or false premises</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* 3. Short Answer */}
                {q.type === 'short_answer' && (
                  <div className="short-answer-stack">
                    <textarea
                      className="short-answer-input"
                      rows={5}
                      placeholder="Type your explanation here. Address key syllabus principles, mechanisms, and real-world significance..."
                      value={currentAnswer || ''}
                      onChange={(e) => handleShortAnswerChange(qId, e.target.value)}
                    />
                    <div className="sa-meta-row">
                      <span className="word-count-badge">
                        {(currentAnswer || '').trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                      <span className="sa-rubric-hint">
                        💡 Answer will be evaluated against academic model answer criteria upon submission.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Navigation Strip */}
              <div className="q-card-footer-nav">
                <button
                  type="button"
                  className="nav-btn prev-btn"
                  disabled={currentIndex === 0}
                  onClick={handlePrevQuestion}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="footer-status-center">
                  <span className={`status-indicator ${isAnswered ? 'saved' : 'pending'}`}>
                    {isAnswered ? '● Answer recorded' : '○ Not answered yet'}
                  </span>
                </div>

                {currentIndex < totalQuestions - 1 ? (
                  <button type="button" className="nav-btn next-btn" onClick={handleNextQuestion}>
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="nav-btn finish-btn"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    <span>Review & Submit</span>
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </article>
          ) : null}

          {/* Question Palette Sidebar (Visible on desktop or toggled on mobile) */}
          <aside className={`question-palette-drawer ${showPaletteDrawer ? 'open' : ''}`}>
            <div className="palette-drawer-header">
              <div className="palette-title">
                <Layers size={16} />
                <span>Question Navigator</span>
              </div>
              <button
                type="button"
                className="palette-close-btn"
                onClick={() => setShowPaletteDrawer(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="palette-grid">
              {questions.map((item, idx) => {
                const isCurrent = idx === currentIndex;
                const answered = isQuestionAnswered(item);
                const flagged = flaggedIds.has(item.id);

                let btnClass = 'palette-num-btn';
                if (isCurrent) btnClass += ' active';
                if (flagged) btnClass += ' flagged';
                else if (answered) btnClass += ' answered';

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={btnClass}
                    onClick={() => handleJumpToQuestion(idx)}
                    title={`Question ${idx + 1}: ${flagged ? 'Flagged for review' : answered ? 'Answered' : 'Unanswered'}`}
                  >
                    <span className="p-num">{idx + 1}</span>
                    {flagged && <Flag size={9} className="p-flag-icon" fill="currentColor" />}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div className="legend-item">
                <span className="legend-dot answered" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot unanswered" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot flagged" />
                <span>Marked for Review ({flaggedCount})</span>
              </div>
            </div>

            <button
              type="button"
              className="palette-submit-btn"
              onClick={() => setShowSubmitModal(true)}
            >
              <span>Submit Assessment</span>
              <CheckCircle2 size={16} />
            </button>
          </aside>
        </main>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="submit-modal-backdrop" onClick={() => setShowSubmitModal(false)}>
            <div className="submit-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="submit-modal-icon">
                <CheckCircle2 size={36} />
              </div>
              <h3>Ready to Submit Assessment?</h3>
              <p>Please confirm your submission. Your answers will be graded authoritatively on the backend.</p>

              <div className="submit-summary-grid">
                <div className="summary-stat-box">
                  <span className="stat-big">{totalQuestions}</span>
                  <span className="stat-sub">Total Questions</span>
                </div>
                <div className="summary-stat-box green">
                  <span className="stat-big">{answeredCount}</span>
                  <span className="stat-sub">Answered</span>
                </div>
                <div className="summary-stat-box red">
                  <span className="stat-big">{unansweredCount}</span>
                  <span className="stat-sub">Unanswered</span>
                </div>
                <div className="summary-stat-box amber">
                  <span className="stat-big">{flaggedCount}</span>
                  <span className="stat-sub">Flagged</span>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="submit-warning-pill">
                  <AlertTriangle size={15} />
                  <span>You have {unansweredCount} unanswered question{unansweredCount === 1 ? '' : 's'}.</span>
                </div>
              )}

              <div className="submit-modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel-btn"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Return to Review
                </button>
                <button
                  type="button"
                  className="modal-btn confirm-btn"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                >
                  {isSubmitting ? 'Evaluating Submission…' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: POST-SUBMISSION PERFORMANCE SUMMARY & FULL REVIEW
  // =========================================================================
  const { score, correctCount: resultCorrect, totalQuestions: resultTotal, passed, timeSpentSeconds } = assessmentResult;
  const incorrectCount = resultTotal - resultCorrect;

  return (
    <div className="interactive-quiz-results-container">
      {/* 1. Final Performance Summary Hero */}
      <section className="results-hero-card">
        <div className={`results-badge-orb ${passed ? 'passed' : 'failed'}`}>
          {passed ? <Trophy size={42} /> : <AlertCircle size={42} />}
        </div>

        <span className={`results-status-pill ${passed ? 'passed' : 'failed'}`}>
          {passed ? 'Assessment Passed (≥70%)' : 'Needs Review (<70%)'}
        </span>

        <h1 className="results-score-heading">
          {score}% <span className="score-ratio">({resultCorrect} of {resultTotal} Correct)</span>
        </h1>

        <p className="results-subtitle">
          {passed
            ? `Excellent mastery! You have demonstrated strong competency in ${assessment.subjectName} (${assessment.subjectCode}).`
            : `Keep practicing! Review the detailed explanations and retry the ${incorrectCount} question${incorrectCount === 1 ? '' : 's'} you missed.`}
        </p>

        {/* Performance Statistics Grid */}
        <div className="results-metrics-grid">
          <div className="metric-cell">
            <span className="m-val">{score}%</span>
            <span className="m-lbl">Final Score</span>
          </div>
          <div className="metric-cell">
            <span className="m-val green">{resultCorrect}</span>
            <span className="m-lbl">Correct Answers</span>
          </div>
          <div className="metric-cell">
            <span className="m-val red">{incorrectCount}</span>
            <span className="m-lbl">Wrong Answers</span>
          </div>
          <div className="metric-cell">
            <span className="m-val">{formatTime(timeSpentSeconds)}</span>
            <span className="m-lbl">Time Elapsed</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-action-row">
          {incorrectCount > 0 && (
            <button
              type="button"
              className="res-btn retry-btn"
              onClick={handleLaunchConceptRetry}
              disabled={isGeneratingRetry}
            >
              <Sparkles size={16} />
              <span>{isGeneratingRetry ? 'Synthesizing Retry Quiz...' : `Retry Incorrect Concepts (${incorrectCount} Missed)`}</span>
            </button>
          )}

          <button
            type="button"
            className="res-btn retake-btn"
            onClick={() => {
              setAnswers({});
              setAssessmentResult(null);
              setCurrentIndex(0);
              setTimeRemaining(configuredMinutes * 60);
            }}
          >
            <RotateCcw size={16} />
            <span>Retake Entire Quiz</span>
          </button>

          <button type="button" className="res-btn exit-btn" onClick={onExit}>
            <span>Back to Quizzes Hub</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 2. AI Performance Feedback & Lesson Recommendations */}
      {assessmentResult?.aiFeedback && (
        <section
          className="results-ai-feedback-section panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            margin: '24px 0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.2))',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Performance Feedback & Diagnostic Analysis
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Curriculum-grounded diagnostic assessment and study recommendations
              </span>
            </div>
          </div>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              background: 'var(--bg-surface-subtle, #f8fafc)',
              padding: '16px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid var(--color-primary, #6366f1)',
              margin: '0 0 20px 0'
            }}
          >
            {assessmentResult.aiFeedback.overallAssessment}
          </p>

          {/* Identified Weak Areas */}
          {assessmentResult.aiFeedback.weakAreas?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                <AlertCircle size={16} />
                <span>Identified Weak Concept Areas ({assessmentResult.aiFeedback.weakAreas.length})</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {assessmentResult.aiFeedback.weakAreas.map((w, wIdx) => (
                  <div
                    key={wIdx}
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#b91c1c',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{w.topic}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                      {w.missedCount} missed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Curriculum Lessons to Revisit */}
          {assessmentResult.aiFeedback.recommendedLessons?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                <BookOpen size={16} />
                <span>Recommended Curriculum Lessons to Revisit</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {assessmentResult.aiFeedback.recommendedLessons.map((rec, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-subtle, #f8fafc)',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {rec.reason}
                    </div>
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      style={{ marginTop: '4px', width: 'fit-content', fontSize: '12px' }}
                      onClick={() => navigate(rec.url || `/learning/${rec.subjectCode}`)}
                    >
                      <BookOpen size={13} />
                      <span>Revisit Lesson Module</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Recommendation: Next Step */}
          {assessmentResult.studyRecommendation && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: assessmentResult.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${assessmentResult.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: assessmentResult.passed ? '#059669' : '#d97706'
                  }}
                >
                  Suggested Study Direction
                </span>
                <h4 style={{ margin: '3px 0 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {assessmentResult.studyRecommendation.title}
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {assessmentResult.studyRecommendation.description}
                </p>
              </div>
              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => navigate(assessmentResult.studyRecommendation.url || `/learning/${assessment.subjectCode}`)}
              >
                <span>{assessmentResult.studyRecommendation.suggestedAction || 'Continue Learning'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. Detailed Question-by-Question Review with Explanations */}
      <section className="results-review-section">
        <div className="review-header-bar">
          <div>
            <h2>Detailed Question-by-Question Review</h2>
            <p>Every answer has been evaluated with clear academic explanations grounded in the syllabus.</p>
          </div>

          {/* Filter Pills */}
          <div className="review-filters-row">
            <button
              type="button"
              className={`rev-filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
              onClick={() => setReviewFilter('all')}
            >
              All Questions ({resultTotal})
            </button>
            <button
              type="button"
              className={`rev-filter-btn ${reviewFilter === 'incorrect' ? 'active' : ''}`}
              onClick={() => setReviewFilter('incorrect')}
            >
              Missed Questions ({incorrectCount})
            </button>
            {flaggedCount > 0 && (
              <button
                type="button"
                className={`rev-filter-btn ${reviewFilter === 'flagged' ? 'active' : ''}`}
                onClick={() => setReviewFilter('flagged')}
              >
                Flagged for Review ({flaggedCount})
              </button>
            )}
          </div>
        </div>

        {/* Review Questions List */}
        <div className="review-cards-stack">
          {filteredReviewResults.map((r, rIdx) => {
            const isCorrect = r.isCorrect;
            const originalQ = questions.find((item) => item.id === r.questionId);

            return (
              <article key={r.questionId || rIdx} className={`review-item-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                {/* Review Card Topbar */}
                <div className="review-card-topbar">
                  <div className="review-status-badge">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span className="status-label correct">CORRECT</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color="#ef4444" />
                        <span className="status-label incorrect">INCORRECT</span>
                      </>
                    )}
                    <span className="review-type-badge">{String(r.questionType).toUpperCase()}</span>
                    {r.difficulty && (
                      <span className={`review-diff-badge ${String(r.difficulty).toLowerCase()}`}>
                        {String(r.difficulty).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {r.topicReference && (
                    <span className="review-topic-badge">
                      <Target size={12} />
                      <span>{r.topicReference}</span>
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <h3 className="review-prompt">{r.prompt}</h3>

                {/* Answer Comparisons */}
                <div className="review-comparison-box">
                  {/* MCQ Comparison */}
                  {r.questionType === 'mcq' && (
                    <div className="mcq-review-stack">
                      {(originalQ?.options || []).map((opt, optIdx) => {
                        const isStudentChoice = r.studentAnswer === optIdx;
                        const isCorrectChoice = r.correctAnswer === optIdx;

                        let optClass = 'review-option-pill';
                        if (isCorrectChoice) optClass += ' correct-target';
                        if (isStudentChoice && !isCorrectChoice) optClass += ' student-wrong';

                        return (
                          <div key={optIdx} className={optClass}>
                            <span className="rev-letter">{String.fromCharCode(65 + optIdx)}</span>
                            <span className="rev-text">{opt}</span>
                            {isCorrectChoice && (
                              <span className="choice-tag correct">✓ Correct Answer</span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="choice-tag wrong">✗ Your Choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False Comparison */}
                  {r.questionType === 'true_false' && (
                    <div className="tf-review-row">
                      <div className={`tf-review-chip ${r.studentAnswer === r.correctAnswer ? 'correct' : 'incorrect'}`}>
                        <span className="lbl">Your Answer:</span>
                        <strong>{r.studentAnswer !== undefined && r.studentAnswer !== null ? String(r.studentAnswer).toUpperCase() : 'None'}</strong>
                      </div>
                      <div className="tf-review-chip correct-target">
                        <span className="lbl">Correct Answer:</span>
                        <strong>{String(r.correctAnswer).toUpperCase()}</strong>
                      </div>
                    </div>
                  )}

                  {/* Short Answer Comparison */}
                  {r.questionType === 'short_answer' && (
                    <div className="sa-review-stack">
                      <div className="sa-student-box">
                        <span className="sa-label">Your Submitted Response:</span>
                        <p>{r.studentAnswer || 'No response provided.'}</p>
                      </div>

                      <div className="sa-model-box">
                        <span className="sa-label model">Official Syllabus Model Answer:</span>
                        <p>{r.correctAnswer || r.modelAnswer}</p>
                      </div>

                      {Array.isArray(r.rubricCriteria) && r.rubricCriteria.length > 0 && (
                        <div className="sa-rubric-box">
                          <span className="sa-label rubric">Grading Rubric Criteria:</span>
                          <ul>
                            {r.rubricCriteria.map((crit, cIdx) => (
                              <li key={cIdx}>{crit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanation Box */}
                {r.explanation && (
                  <div className="review-explanation-card">
                    <div className="exp-icon">
                      <HelpCircle size={16} />
                    </div>
                    <div className="exp-content">
                      <strong>Syllabus Concept & Explanation:</strong>
                      <p>{r.explanation}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
