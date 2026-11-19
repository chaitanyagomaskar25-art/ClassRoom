import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  FileQuestion,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Target,
  TrendingDown,
  Wand2,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { semestersList, allSubjects, semesterColors } from '../data/curriculumData.js';
import { generateClientAIQuiz } from '../utils/aiQuizGeneratorClient.js';
import SubjectIcon from './SubjectIcon.jsx';
import './AIQuizGenerator.css';

export default function AIQuizGenerator({
  onStartQuiz,
  initialSemester = 1,
  initialSubjectCode = '',
  initialUnitNumber = 'all',
  initialTopic = 'all',
  initialMode = 'custom'
}) {
  const user = useSelector((state) => state.auth?.user);
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;

  // 1. Generation Mode: 'custom' | 'weak_topics' | 'revision' | 'exam_prep' | 'retry'
  const [generatorMode, setGeneratorMode] = useState(initialMode || 'custom');

  // Selector State (locked to student enrolled semester)
  const [selectedSemester, setSelectedSemester] = useState(studentSem || initialSemester || 1);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(initialSubjectCode || '');
  const [selectedUnitNumber, setSelectedUnitNumber] = useState(initialUnitNumber || 'all'); // 'all' | '1' | '2' | '3' | '4'
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || 'all');
  const [difficulty, setDifficulty] = useState('mixed'); // 'easy' | 'medium' | 'hard' | 'mixed' | 'adaptive'
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState(['mcq', 'true_false', 'short_answer']);

  // History & Learning Analytics Context
  const [analyticsData, setAnalyticsData] = useState({
    topicWeaknesses: [],
    subjectsRequiringRevision: [],
    previousAttempts: []
  });
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [adaptiveInfoNotification, setAdaptiveInfoNotification] = useState(null);

  // Sync props if parent changes them (e.g. from Strengths/Weaknesses quick practice)
  useEffect(() => {
    if (studentSem) {
      setSelectedSemester(studentSem);
    } else if (initialSemester) {
      setSelectedSemester(Number(initialSemester));
    }
    if (initialSubjectCode) setSelectedSubjectCode(initialSubjectCode);
    if (initialUnitNumber) setSelectedUnitNumber(String(initialUnitNumber));
    if (initialTopic) setSelectedTopic(initialTopic);
    if (initialMode) setGeneratorMode(initialMode);
  }, [studentSem, initialSemester, initialSubjectCode, initialUnitNumber, initialTopic, initialMode]);

  // Load actual user history, analytics, and completed lessons count
  useEffect(() => {
    const fetchLearningContext = async () => {
      try {
        const [analyticsRes, progressRes] = await Promise.all([
          api.get('/quizzes/analytics'),
          api.get('/progress/me')
        ]);
        const aData = unwrap(analyticsRes);
        if (aData) {
          setAnalyticsData({
            topicWeaknesses: aData.topicWeaknesses || [],
            subjectsRequiringRevision: aData.subjectsRequiringRevision || [],
            previousAttempts: aData.previousAttempts || []
          });
        }
        const pData = unwrap(progressRes);
        if (pData?.progress) {
          const completed = (pData.progress || []).filter((p) => p.status === 'completed');
          setCompletedLessonsCount(completed.length);
        }
      } catch (err) {
        console.warn('Learning context load failed (using client baseline):', err.message);
      }
    };

    fetchLearningContext();
  }, []);

  // Generation & Animation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState('');

  // 2. Dynamically load subjects based on selected semester
  const availableSubjects = useMemo(() => {
    const sem = semestersList.find((s) => s.semester === Number(selectedSemester));
    return sem?.subjects || semestersList[0].subjects;
  }, [selectedSemester]);

  // Synchronize subject when semester changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const match = availableSubjects.find((s) => s.code === selectedSubjectCode);
      if (!match) {
        setSelectedSubjectCode(availableSubjects[0].code);
      }
    }
  }, [availableSubjects, selectedSubjectCode]);

  // Current selected subject object
  const activeSubject = useMemo(() => {
    return (
      availableSubjects.find((s) => s.code === selectedSubjectCode) ||
      allSubjects.find((s) => s.code === selectedSubjectCode) ||
      availableSubjects[0]
    );
  }, [availableSubjects, selectedSubjectCode]);

  // 3. Dynamically load units based on selected subject
  const availableUnits = useMemo(() => {
    return activeSubject?.units || [];
  }, [activeSubject]);

  // Reset unit & topic if subject changes
  const handleSubjectChange = (newCode) => {
    setSelectedSubjectCode(newCode);
    setSelectedUnitNumber('all');
    setSelectedTopic('all');
  };

  // 4. Dynamically load topics based on selected unit
  const availableTopics = useMemo(() => {
    if (selectedUnitNumber === 'all') {
      return availableUnits.flatMap((u) => u.topics || []);
    }
    const uIdx = Number(selectedUnitNumber) - 1;
    return availableUnits[uIdx]?.topics || [];
  }, [availableUnits, selectedUnitNumber]);

  // Toggle question types
  const handleToggleType = (typeKey) => {
    if (questionTypes.includes(typeKey)) {
      if (questionTypes.length === 1) {
        setError('At least one question type must be selected.');
        return;
      }
      setQuestionTypes((prev) => prev.filter((t) => t !== typeKey));
    } else {
      setQuestionTypes((prev) => [...prev, typeKey]);
      setError('');
    }
  };

  // 5. Generate with AI handler
  const handleGenerateAI = async () => {
    if (studentSem && Number(selectedSemester) !== studentSem) {
      setError(`🔒 Quiz generation is locked for Semester ${selectedSemester}. You are enrolled in Semester ${studentSem}. Only Semester ${studentSem} quizzes are unlocked.`);
      return;
    }

    if (questionTypes.length === 0) {
      setError('Please select at least one question type (MCQ, True/False, or Short Answer).');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationStep(1);

    // Step animations for realistic AI synthesis feedback
    const t1 = setTimeout(() => setGenerationStep(2), 600);
    const t2 = setTimeout(() => setGenerationStep(3), 1300);
    const t3 = setTimeout(() => setGenerationStep(4), 1900);

    const basePayload = {
      semester: Number(selectedSemester),
      subjectCode: activeSubject?.code || selectedSubjectCode,
      subjectName: activeSubject?.name || '',
      unitNumber: selectedUnitNumber,
      topic: selectedTopic === 'all' ? '' : selectedTopic,
      difficulty,
      questionCount: Number(questionCount),
      questionTypes,
      mode: generatorMode
    };

    try {
      let generatedQuiz = null;

      // 1. Dispatch according to specialized generation mode
      try {
        let endpoint = '/quizzes/generate-ai';
        let requestBody = { ...basePayload };

        if (generatorMode === 'weak_topics') {
          endpoint = '/quizzes/generate-weak-topics';
          requestBody = {
            semester: Number(selectedSemester),
            subjectCode: activeSubject?.code || selectedSubjectCode,
            questionCount: Number(questionCount),
            questionTypes
          };
        } else if (generatorMode === 'revision') {
          endpoint = '/quizzes/generate-revision';
          requestBody = {
            semester: Number(selectedSemester),
            subjectCode: activeSubject?.code || selectedSubjectCode,
            questionCount: Number(questionCount),
            questionTypes
          };
        } else if (generatorMode === 'exam_prep') {
          endpoint = '/quizzes/generate-exam-prep';
          requestBody = {
            semester: Number(selectedSemester),
            subjectCode: activeSubject?.code || selectedSubjectCode,
            questionCount: Number(questionCount) || 15
          };
        } else if (generatorMode === 'retry') {
          endpoint = '/quizzes/generate-retry';
          const recentAttemptWithMissed = analyticsData.previousAttempts?.find((a) => (a.incorrectCount || 0) > 0);
          requestBody = {
            attemptId: recentAttemptWithMissed?.id || recentAttemptWithMissed?._id,
            questionCount: Number(questionCount)
          };
        }

        const response = await api.post(endpoint, requestBody);
        const data = unwrap(response);
        if (data?.quiz) {
          generatedQuiz = data.quiz;
          if (data.adaptiveInfo) {
            setAdaptiveInfoNotification(data.adaptiveInfo);
          }
        }
      } catch (backendErr) {
        console.warn('Backend specialized generation fell back to client synthesis engine:', backendErr.message);
      }

      // 2. Client-side verified fallback
      if (!generatedQuiz) {
        generatedQuiz = generateClientAIQuiz(basePayload);
      }

      // Allow final step to render briefly for smooth UX
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationStep(0);
        if (onStartQuiz && generatedQuiz) {
          onStartQuiz(generatedQuiz);
        }
      }, 2000);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsGenerating(false);
      setGenerationStep(0);
      setError(getErrorMessage(err) || 'Failed to generate quiz. Please try again.');
    }
  };

  // Unit title display
  const activeUnitTitle = useMemo(() => {
    if (selectedUnitNumber === 'all') return 'All 4 Units (Comprehensive)';
    const uIdx = Number(selectedUnitNumber) - 1;
    return availableUnits[uIdx] ? `${availableUnits[uIdx].unit}: ${availableUnits[uIdx].title}` : `Unit ${selectedUnitNumber}`;
  }, [availableUnits, selectedUnitNumber]);

  return (
    <div className="ai-quiz-generator-panel">
      {/* Header Banner */}
      <div className="ai-gen-header">
        <div className="ai-gen-title-row">
          <div className="ai-gen-icon-glow">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="ai-gen-pill">
              <Bot size={13} />
              <span>AI-Powered Syllabus Intelligence</span>
            </div>
            <h2>Custom Quiz & Exam Generator</h2>
            <p>
              Synthesize verified practice assessments directly from the official BCA syllabus.
              Choose a specialized feature mode or configure a custom quiz tailored to your learning goals.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Feature Modes Switcher Bar (6 Core Modes)
          ------------------------------------------------------------- */}
      <div className="ai-mode-switcher-bar">
        <button
          type="button"
          className={`ai-mode-pill-btn ${generatorMode === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setGeneratorMode('custom');
            setError('');
          }}
        >
          <Sliders size={15} />
          <span>Custom Quiz</span>
        </button>

        <button
          type="button"
          className={`ai-mode-pill-btn ${generatorMode === 'weak_topics' ? 'active' : ''}`}
          onClick={() => {
            setGeneratorMode('weak_topics');
            setError('');
          }}
        >
          <TrendingDown size={15} />
          <span>Weak Topic Quiz ({analyticsData.topicWeaknesses?.length || 0})</span>
        </button>

        <button
          type="button"
          className={`ai-mode-pill-btn ${generatorMode === 'revision' ? 'active' : ''}`}
          onClick={() => {
            setGeneratorMode('revision');
            setError('');
          }}
        >
          <RotateCcw size={15} />
          <span>Revision Quiz ({completedLessonsCount} Done)</span>
        </button>

        <button
          type="button"
          className={`ai-mode-pill-btn ${generatorMode === 'exam_prep' ? 'active' : ''}`}
          onClick={() => {
            setGeneratorMode('exam_prep');
            setSelectedUnitNumber('all');
            setQuestionCount(15);
            setError('');
          }}
        >
          <GraduationCap size={15} />
          <span>Exam Prep Mock Test</span>
        </button>

        <button
          type="button"
          className={`ai-mode-pill-btn ${generatorMode === 'retry' ? 'active' : ''}`}
          onClick={() => {
            setGeneratorMode('retry');
            setError('');
          }}
        >
          <RefreshCw size={15} />
          <span>Retry Missed Concepts</span>
        </button>
      </div>

      {/* Specialized Mode Context Banners */}
      {generatorMode === 'weak_topics' && (
        <div className="ai-specialized-banner">
          <div className="banner-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <h3>Weak Topic Reinforcement Quiz Mode</h3>
            <p>
              Automatically identifies syllabus topics where your past accuracy was below 60% or questions were missed.
              {analyticsData.topicWeaknesses?.length > 0 ? (
                <> Active weak topics detected: <strong>{analyticsData.topicWeaknesses.slice(0, 3).map((w) => w.topic).join(', ')}</strong>.</>
              ) : (
                <> No severe weaknesses recorded yet. Generating foundational reinforcement questions for {activeSubject?.name}.</>
              )}
            </p>
          </div>
        </div>
      )}

      {generatorMode === 'revision' && (
        <div className="ai-specialized-banner">
          <div className="banner-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <RotateCcw size={20} />
          </div>
          <div>
            <h3>Spaced Repetition Revision Quiz Mode</h3>
            <p>
              Synthesizes review questions directly from your <strong>{completedLessonsCount} completed course lessons</strong>.
              Reinforces long-term retention across previously mastered topics before semester evaluations.
            </p>
          </div>
        </div>
      )}

      {generatorMode === 'exam_prep' && (
        <div className="ai-specialized-banner">
          <div className="banner-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <h3>Comprehensive 4-Unit Final Exam Preparation Mock Test</h3>
            <p>
              Creates a balanced 15-question mixed-unit examination spanning <strong>Unit I, Unit II, Unit III, and Unit IV</strong> of {activeSubject?.name}.
              Simulates official examination conditions with a timed countdown.
            </p>
          </div>
        </div>
      )}

      {generatorMode === 'retry' && (
        <div className="ai-specialized-banner">
          <div className="banner-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <RefreshCw size={20} />
          </div>
          <div>
            <h3>Targeted Missed Concept Retry Mode</h3>
            <p>
              Extracts questions you previously got wrong in your quiz attempts and formulates fresh alternative questions
              targeting those exact conceptual principles to test true understanding.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="ai-gen-alert" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Control Grid */}
      <div className="ai-gen-grid">
        {/* 1. Semester Selection */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <Layers size={16} />
            <span>1. Select Semester</span>
          </div>
          <div className="ai-semester-grid">
            {[1, 2, 3, 4, 5, 6].map((sem) => {
              const isSelected = Number(selectedSemester) === sem;
              const isEnrolled = Boolean(studentSem && sem === studentSem);
              const color = semesterColors[sem]?.primary || '#6366f1';
              return (
                <button
                  key={sem}
                  type="button"
                  className={`ai-sem-choice-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(sem)}
                  style={{ '--sem-accent': color }}
                >
                  <span className="sem-num" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Sem {sem}</span>
                    {isEnrolled ? (
                      <span style={{ fontSize: '9px', fontWeight: 800, background: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        Enrolled
                      </span>
                    ) : studentSem ? (
                      <span style={{ fontSize: '9px', fontWeight: 600, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Lock size={8} /> Locked
                      </span>
                    ) : null}
                  </span>
                  <span className="sem-subtext">{isEnrolled ? 'Active Coursework' : `Year ${Math.ceil(sem / 2)}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Subject Selection (Dynamically Loaded) */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <BookOpen size={16} />
            <span>2. Select Subject ({availableSubjects.length} in Sem {selectedSemester})</span>
          </div>
          <div className="ai-subject-select-wrapper">
            <select
              className="ai-select-input"
              value={selectedSubjectCode}
              onChange={(e) => handleSubjectChange(e.target.value)}
              aria-label="Select Subject"
            >
              {availableSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.name} — ({sub.code}) • [{sub.nature || 'DSC'}]
                </option>
              ))}
            </select>
          </div>

          {activeSubject && (
            <div className="ai-subject-preview-pill">
              <div className="sub-icon">
                <SubjectIcon iconName={activeSubject.iconName} name={activeSubject.iconName} size={16} />
              </div>
              <div className="sub-info">
                <strong>{activeSubject.name}</strong>
                <span>{activeSubject.code} · {activeSubject.nature || 'Core'} · {activeSubject.credits || 4} Credits</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Unit Selection (Dynamically Loaded) */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <Compass size={16} />
            <span>3. Select Unit Scope</span>
          </div>
          <select
            className="ai-select-input"
            value={selectedUnitNumber}
            disabled={generatorMode === 'exam_prep'}
            onChange={(e) => {
              setSelectedUnitNumber(e.target.value);
              setSelectedTopic('all');
            }}
            aria-label="Select Unit"
          >
            <option value="all">🌟 All Units (Comprehensive Full Syllabus)</option>
            {availableUnits.map((u, idx) => (
              <option key={u.unit || idx} value={String(idx + 1)}>
                {u.unit}: {u.title} ({u.topics?.length || 0} topics)
              </option>
            ))}
          </select>
          <span className="ai-field-hint">
            {generatorMode === 'exam_prep'
              ? 'Exam Prep mode automatically covers all 4 syllabus units.'
              : <>Active: <strong>{activeUnitTitle}</strong></>}
          </span>
        </div>

        {/* 4. Topic Selection (Optional, Dynamically Loaded) */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <Target size={16} />
            <span>4. Topic Focus</span>
          </div>
          <select
            className="ai-select-input"
            value={selectedTopic}
            disabled={generatorMode === 'exam_prep' || generatorMode === 'revision'}
            onChange={(e) => setSelectedTopic(e.target.value)}
            aria-label="Select Specific Topic"
          >
            <option value="all">🎯 All Topics in Scope ({availableTopics.length} topics)</option>
            {availableTopics.map((top, idx) => (
              <option key={idx} value={top}>
                {top}
              </option>
            ))}
          </select>
          <span className="ai-field-hint">
            {generatorMode === 'weak_topics'
              ? 'AI will prioritize topics with low accuracy.'
              : 'Leave as "All Topics" for a broad quiz, or pinpoint a specific topic.'}
          </span>
        </div>

        {/* 5. Difficulty Selection (Including Adaptive Difficulty) */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <Sliders size={16} />
            <span>5. Target Difficulty</span>
          </div>
          <div className="ai-pill-selector-row">
            {[
              { id: 'adaptive', label: 'Adaptive', badge: 'Auto-Calibrated', color: '#ec4899' },
              { id: 'easy', label: 'Easy', badge: 'Concepts', color: '#10b981' },
              { id: 'medium', label: 'Medium', badge: 'Standard', color: '#3b82f6' },
              { id: 'hard', label: 'Hard', badge: 'Advanced', color: '#8b5cf6' },
              { id: 'mixed', label: 'Mixed', badge: 'Balanced', color: '#f59e0b' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                className={`ai-diff-pill ${difficulty === d.id ? 'active' : ''}`}
                onClick={() => setDifficulty(d.id)}
                style={{ '--diff-color': d.color }}
              >
                <span className="diff-name">{d.label}</span>
                <span className="diff-sub">{d.badge}</span>
              </button>
            ))}
          </div>
          <span className="ai-field-hint">
            {difficulty === 'adaptive'
              ? '✨ Adaptive: Dynamically adjusts question difficulty based on your historical attempts (Hard if score ≥80%, Easy if <60%).'
              : 'Fixed difficulty level for synthesized questions.'}
          </span>
        </div>

        {/* 6. Question Count */}
        <div className="ai-form-card">
          <div className="ai-card-title">
            <FileQuestion size={16} />
            <span>6. Number of Questions</span>
          </div>
          <div className="ai-count-selector-row">
            {[5, 10, 15, 20, 30].map((num) => (
              <button
                key={num}
                type="button"
                className={`ai-count-btn ${Number(questionCount) === num ? 'active' : ''}`}
                onClick={() => setQuestionCount(num)}
              >
                <span className="count-num">{num}</span>
                <span className="count-label">Qs</span>
              </button>
            ))}
          </div>
        </div>

        {/* 7. Question Types (Multi-Select) */}
        <div className="ai-form-card full-width">
          <div className="ai-card-title">
            <ListChecks size={16} />
            <span>7. Included Question Types (Select all that apply)</span>
          </div>
          <div className="ai-types-row">
            <label
              className={`ai-type-chip ${questionTypes.includes('mcq') ? 'active' : ''}`}
              onClick={() => handleToggleType('mcq')}
            >
              <input
                type="checkbox"
                checked={questionTypes.includes('mcq')}
                onChange={() => handleToggleType('mcq')}
                aria-label="Include Multiple Choice Questions"
              />
              <div className="type-meta">
                <strong>Multiple Choice (MCQ)</strong>
                <span>4 options, single correct answer, and detailed explanation</span>
              </div>
              {questionTypes.includes('mcq') && <Check size={16} className="type-check-icon" />}
            </label>

            <label
              className={`ai-type-chip ${questionTypes.includes('true_false') ? 'active' : ''}`}
              onClick={() => handleToggleType('true_false')}
            >
              <input
                type="checkbox"
                checked={questionTypes.includes('true_false')}
                onChange={() => handleToggleType('true_false')}
                aria-label="Include True or False Questions"
              />
              <div className="type-meta">
                <strong>True / False</strong>
                <span>Conceptual assertions with technical justification</span>
              </div>
              {questionTypes.includes('true_false') && <Check size={16} className="type-check-icon" />}
            </label>

            <label
              className={`ai-type-chip ${questionTypes.includes('short_answer') ? 'active' : ''}`}
              onClick={() => handleToggleType('short_answer')}
            >
              <input
                type="checkbox"
                checked={questionTypes.includes('short_answer')}
                onChange={() => handleToggleType('short_answer')}
                aria-label="Include Short Answer Questions"
              />
              <div className="type-meta">
                <strong>Short Answer (Analytical)</strong>
                <span>Explanatory prompts with model answer & rubric criteria</span>
              </div>
              {questionTypes.includes('short_answer') && <Check size={16} className="type-check-icon" />}
            </label>
          </div>
        </div>
      </div>

      {/* Live AI Configuration Summary & Generate Action */}
      <div className="ai-gen-bottom-bar">
        <div className="ai-summary-spec">
          <div className="ai-spec-title">
            <Zap size={15} style={{ color: '#f59e0b' }} />
            <span>Ready to Synthesize:</span>
          </div>
          <p className="ai-spec-desc">
            Generating <strong>{questionCount} questions</strong> (Mode: <strong>{generatorMode.toUpperCase()}</strong> • {difficulty.toUpperCase()} difficulty) across{' '}
            <strong>{questionTypes.map((t) => t.toUpperCase()).join(' + ')}</strong> for{' '}
            <strong>{activeSubject?.name} ({activeSubject?.code})</strong> —{' '}
            <em>{activeUnitTitle}</em>
            {selectedTopic !== 'all' && <span> • Topic: <strong>{selectedTopic}</strong></span>}.
          </p>
        </div>

        {studentSem && Number(selectedSemester) !== studentSem ? (
          <button
            type="button"
            className="ai-generate-main-btn"
            disabled
            style={{
              opacity: 0.65,
              cursor: 'not-allowed',
              background: 'rgba(51, 65, 85, 0.6)',
              borderColor: 'rgba(148, 163, 184, 0.3)',
              color: '#94a3b8'
            }}
            title={`Quiz synthesis is locked for Semester ${selectedSemester}. You are enrolled in Semester ${studentSem}.`}
          >
            <Lock size={18} />
            <span>Generate Locked (Enrolled in Sem {studentSem})</span>
          </button>
        ) : (
          <button
            type="button"
            className="ai-generate-main-btn"
            disabled={isGenerating}
            onClick={handleGenerateAI}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>Synthesizing Academic Quiz…</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>
                  {generatorMode === 'weak_topics' ? 'Generate Weak Topic Quiz' :
                   generatorMode === 'revision' ? 'Generate Revision Quiz' :
                   generatorMode === 'exam_prep' ? 'Launch Exam Mock Test' :
                   generatorMode === 'retry' ? 'Generate Retry Assessment' :
                   'Generate with AI'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* AI Synthesis Modal / Stepper Overlay when generating */}
      {isGenerating && (
        <div className="ai-generating-overlay">
          <div className="ai-generating-modal">
            <div className="ai-generating-orb">
              <Sparkles size={32} />
            </div>
            <h3>Synthesizing Academic Assessment</h3>
            <p>Grounding questions strictly in official BCA Syllabus standards...</p>

            <div className="ai-steps-list">
              <div className={`ai-step-item ${generationStep >= 1 ? 'active' : ''}`}>
                {generationStep > 1 ? <CheckCircle2 size={16} color="#10b981" /> : <div className="step-dot" />}
                <span>1. Loading {activeSubject?.name} syllabus & learning objectives</span>
              </div>
              <div className={`ai-step-item ${generationStep >= 2 ? 'active' : ''}`}>
                {generationStep > 2 ? <CheckCircle2 size={16} color="#10b981" /> : <div className="step-dot" />}
                <span>2. Formulating questions ({generatorMode.toUpperCase()} mode)</span>
              </div>
              <div className={`ai-step-item ${generationStep >= 3 ? 'active' : ''}`}>
                {generationStep > 3 ? <CheckCircle2 size={16} color="#10b981" /> : <div className="step-dot" />}
                <span>3. Generating plausible distractors, answers, and explanations</span>
              </div>
              <div className={`ai-step-item ${generationStep >= 4 ? 'active' : ''}`}>
                <div className="step-dot pulse" />
                <span>4. Calibrating {difficulty} difficulty and finalizing rubric</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
