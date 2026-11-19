import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  BrainCircuit,
  Bug,
  Calendar,
  CheckCircle,
  Clock,
  Code2,
  Compass,
  Copy,
  ExternalLink,
  Flame,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { allSubjects } from '../data/curriculumData.js';
import './AIAssistant.css';

export default function AIAssistant() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user) || {};
  const [activeTab, setActiveTab] = useState('mentor'); // 'mentor', 'weakness', 'roadmap', 'career'

  /* ------------------------------------------------------------------
     TAB 1: AI LEARNING MENTOR STATE
     ------------------------------------------------------------------ */
  const [mentorMode, setMentorMode] = useState('explain'); // 'explain', 'eli5', 'debug', 'example', 'study_plan'
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCodeInputs, setShowCodeInputs] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorResponse, setMentorResponse] = useState(null);
  const [mentorError, setMentorError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  /* ------------------------------------------------------------------
     TAB 2: WEAKNESS ANALYZER STATE
     ------------------------------------------------------------------ */
  const [weaknessLoading, setWeaknessLoading] = useState(false);
  const [weaknessData, setWeaknessData] = useState(null);
  const [weaknessError, setWeaknessError] = useState('');

  /* ------------------------------------------------------------------
     TAB 3: PERSONALIZED ROADMAP STATE
     ------------------------------------------------------------------ */
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [targetCareer, setTargetCareer] = useState('Full-Stack Software Engineer');
  const [targetWeeks, setTargetWeeks] = useState(4);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapSavedNotice, setRoadmapSavedNotice] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');

  /* ------------------------------------------------------------------
     TAB 4: AI CAREER GUIDE STATE
     ------------------------------------------------------------------ */
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerGuideData, setCareerGuideData] = useState(null);
  const [careerError, setCareerError] = useState('');

  // Initial tab loading
  useEffect(() => {
    if (activeTab === 'weakness' && !weaknessData) {
      loadWeaknessAnalysis();
    } else if (activeTab === 'roadmap' && !roadmapData) {
      generateRoadmap(false);
    } else if (activeTab === 'career' && !careerGuideData) {
      loadCareerGuide('full_stack');
    }
  }, [activeTab]);

  /* ------------------------------------------------------------------
     MENTOR ACTIONS
     ------------------------------------------------------------------ */
  const handleAskMentor = async (e) => {
    if (e) e.preventDefault();
    if (!questionText.trim() && !codeSnippet.trim() && !errorMessage.trim()) return;

    setMentorLoading(true);
    setMentorError('');
    try {
      const res = await api.post('/ai/learning-mentor/ask', {
        question: questionText,
        codeSnippet,
        errorMessage,
        mode: mentorMode,
        semester: currentUser.semester || 1,
        subjectCode: selectedSubjectCode
      });
      const data = unwrap(res);
      setMentorResponse(data);
    } catch (err) {
      setMentorError(getErrorMessage(err) || 'Failed to receive explanation from AI Learning Mentor.');
    } finally {
      setMentorLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const setQuickPrompt = (prompt, mode = 'explain') => {
    setQuestionText(prompt);
    setMentorMode(mode);
    if (mode === 'debug') setShowCodeInputs(true);
  };

  /* ------------------------------------------------------------------
     WEAKNESS ANALYZER ACTIONS
     ------------------------------------------------------------------ */
  const loadWeaknessAnalysis = async () => {
    setWeaknessLoading(true);
    setWeaknessError('');
    try {
      const res = await api.get('/ai/weakness-analysis');
      const data = unwrap(res);
      setWeaknessData(data);
    } catch (err) {
      setWeaknessError(getErrorMessage(err) || 'Failed to analyze academic weaknesses.');
    } finally {
      setWeaknessLoading(false);
    }
  };

  const handlePracticeWeakTopic = (item) => {
    navigate('/quizzes', {
      state: {
        autoGenerate: true,
        subjectCode: item.subjectCode,
        topic: item.topic,
        difficulty: 'easy'
      }
    });
  };

  /* ------------------------------------------------------------------
     ROADMAP ACTIONS
     ------------------------------------------------------------------ */
  const generateRoadmap = async (saveToStudyPlan = false) => {
    setRoadmapLoading(true);
    setRoadmapError('');
    setRoadmapSavedNotice(false);
    try {
      const res = await api.post('/ai/personalized-roadmap', {
        weeklyHours,
        targetCareer,
        targetWeeks,
        saveToStudyPlan
      });
      const data = unwrap(res);
      setRoadmapData(data);
      if (saveToStudyPlan) {
        setRoadmapSavedNotice(true);
      }
    } catch (err) {
      setRoadmapError(getErrorMessage(err) || 'Failed to generate personalized AI roadmap.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  /* ------------------------------------------------------------------
     CAREER GUIDE ACTIONS
     ------------------------------------------------------------------ */
  const loadCareerGuide = async (careerId = '') => {
    setCareerLoading(true);
    setCareerError('');
    try {
      const res = await api.post('/ai/career-guide', {
        targetCareerId: careerId
      });
      const data = unwrap(res);
      setCareerGuideData(data);
    } catch (err) {
      setCareerError(getErrorMessage(err) || 'Failed to generate career guide roadmap.');
    } finally {
      setCareerLoading(false);
    }
  };

  return (
    <div className="ai-hub-page">
      {/* Page Header */}
      <div className="ai-hub-header">
        <h1 className="ai-hub-title">
          <Bot size={30} className="ai-sparkle-icon" />
          <span>AI Learning Mentor & Analytics</span>
        </h1>
        <p className="ai-hub-subtitle">
          Ask academic questions, debug coding errors, analyze performance weak spots, and generate tailored weekly learning roadmaps.
        </p>

        {/* Navigation Tabs */}
        <div className="ai-tabs-nav">
          <button
            className={`ai-tab-btn ${activeTab === 'mentor' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentor')}
          >
            <BrainCircuit size={16} />
            <span>AI Learning Mentor</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'weakness' ? 'active' : ''}`}
            onClick={() => setActiveTab('weakness')}
          >
            <AlertTriangle size={16} />
            <span>AI Weakness Analyzer</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <Calendar size={16} />
            <span>Personalized AI Roadmap</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => setActiveTab('career')}
          >
            <Compass size={16} />
            <span>AI Career Guide</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: AI LEARNING MENTOR
          ========================================================= */}
      {activeTab === 'mentor' && (
        <div className="mentor-chat-layout">
          {/* Query Card */}
          <div className="mentor-input-card">
            {/* Mode Selector */}
            <div className="mentor-modes-row">
              <button
                type="button"
                className={`mode-chip ${mentorMode === 'explain' ? 'active' : ''}`}
                onClick={() => { setMentorMode('explain'); setShowCodeInputs(false); }}
              >
                <BookOpen size={14} />
                <span>Concept Explanation</span>
              </button>
              <button
                type="button"
                className={`mode-chip ${mentorMode === 'eli5' ? 'active' : ''}`}
                onClick={() => { setMentorMode('eli5'); setShowCodeInputs(false); }}
              >
                <Lightbulb size={14} />
                <span>Explain Simply (ELI5)</span>
              </button>
              <button
                type="button"
                className={`mode-chip ${mentorMode === 'debug' ? 'active' : ''}`}
                onClick={() => { setMentorMode('debug'); setShowCodeInputs(true); }}
              >
                <Bug size={14} />
                <span>Debug Code Error</span>
              </button>
              <button
                type="button"
                className={`mode-chip ${mentorMode === 'example' ? 'active' : ''}`}
                onClick={() => { setMentorMode('example'); setShowCodeInputs(false); }}
              >
                <Code2 size={14} />
                <span>Code Demonstration</span>
              </button>
              <button
                type="button"
                className={`mode-chip ${mentorMode === 'study_plan' ? 'active' : ''}`}
                onClick={() => { setMentorMode('study_plan'); setShowCodeInputs(false); }}
              >
                <Calendar size={14} />
                <span>Subject Study Schedule</span>
              </button>
            </div>

            {/* Subject Context selector */}
            <div className="mentor-context-row">
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.4rem', color: 'var(--text-secondary)' }}>
                  Course Context:
                </span>
                <select
                  className="context-select"
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                >
                  <option value="">Auto-Detect from Question</option>
                  {allSubjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      Sem {s.semester} • {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="mode-chip"
                onClick={() => setShowCodeInputs(!showCodeInputs)}
                style={{ marginLeft: 'auto' }}
              >
                <Code2 size={14} />
                <span>{showCodeInputs ? 'Hide Code Box' : 'Attach Code / Error'}</span>
              </button>
            </div>

            {/* Main Prompt */}
            <textarea
              className="mentor-prompt-textarea"
              placeholder={
                mentorMode === 'debug'
                  ? 'Describe what you are trying to achieve and what goes wrong...'
                  : mentorMode === 'eli5'
                  ? 'Ask any computer science concept you want explained simply (e.g. recursion, pointers, async)...'
                  : 'Ask your academic question (e.g., How do B-Trees optimize database queries?)...'
              }
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {/* Optional Code & Error Inputs */}
            {showCodeInputs && (
              <div className="mentor-extra-inputs">
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                    Your Code Snippet
                  </label>
                  <textarea
                    className="extra-textarea"
                    placeholder="// Paste your code here..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                    Compiler / Runtime Error Message
                  </label>
                  <textarea
                    className="extra-textarea"
                    placeholder="e.g. TypeError: Cannot read properties of undefined..."
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Quick Prompts */}
            <div className="quick-prompts-row">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Suggested:</span>
              <button
                type="button"
                className="quick-chip"
                onClick={() => setQuickPrompt('How does B-Tree indexing work in database systems?', 'explain')}
              >
                DBMS: B-Tree Indexing
              </button>
              <button
                type="button"
                className="quick-chip"
                onClick={() => setQuickPrompt('Explain recursion and call stack simply', 'eli5')}
              >
                ELI5: Recursion & Call Stack
              </button>
              <button
                type="button"
                className="quick-chip"
                onClick={() => setQuickPrompt('Demonstrate Binary Search Tree in Python', 'example')}
              >
                Example: Binary Search Tree
              </button>
              <button
                type="button"
                className="quick-chip"
                onClick={() => {
                  setQuickPrompt('Why do I get Cannot read properties of undefined?', 'debug');
                  setCodeSnippet('const user = null;\nconsole.log(user.profile.name);');
                  setErrorMessage('TypeError: Cannot read properties of null (reading profile)');
                }}
              >
                Debug: Null Property Access
              </button>
            </div>

            <button
              type="button"
              className="btn-ask-mentor"
              disabled={mentorLoading || (!questionText.trim() && !codeSnippet.trim())}
              onClick={handleAskMentor}
            >
              <Send size={15} />
              <span>{mentorLoading ? 'Consulting Academic Engine…' : 'Ask AI Learning Mentor'}</span>
            </button>
          </div>

          {mentorError && (
            <div className="ai-error-box">
              <p>{mentorError}</p>
            </div>
          )}

          {/* Response View */}
          {mentorResponse && (
            <div className="mentor-response-card">
              <div className="response-header">
                <span className="response-context-tag">{mentorResponse.subjectContext}</span>
                <h3 className="response-title">{mentorResponse.title}</h3>
              </div>

              {/* Debugging card if present */}
              {mentorResponse.debuggingAnalysis && (
                <div className="debug-alert-card">
                  <div className="debug-alert-title">
                    Root Cause: {mentorResponse.debuggingAnalysis.rootCause}
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#7f1d1d' }}>
                    {mentorResponse.debuggingAnalysis.explanation}
                  </p>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b' }}>
                    Pro Tip: {mentorResponse.debuggingAnalysis.preventiveTip}
                  </div>
                </div>
              )}

              {/* Prose Answer */}
              <div className="response-body-prose">
                {mentorResponse.answer}
              </div>

              {/* Key Takeaways */}
              {mentorResponse.keyTakeaways?.length > 0 && (
                <div className="response-takeaways-box">
                  <div className="takeaways-title">Key Academic Takeaways</div>
                  <ul className="takeaways-list">
                    {mentorResponse.keyTakeaways.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Example */}
              {mentorResponse.codeExample && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Implementation Pattern
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(mentorResponse.codeExample)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedCode ? '#15803d' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <Copy size={13} />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="response-code-wrap">
                    <code>{mentorResponse.codeExample}</code>
                  </pre>
                </div>
              )}

              {/* Related Curriculum Topics */}
              {mentorResponse.relatedTopics?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Official Curriculum Modules to Review:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {mentorResponse.relatedTopics.map((top, i) => (
                      <span key={i} className="quick-chip" style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed' }}>
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: AI WEAKNESS ANALYZER
          ========================================================= */}
      {activeTab === 'weakness' && (
        <div className="weakness-container">
          {weaknessLoading ? (
            <div className="ai-loading-box">
              <div className="ai-spinner"></div>
              <p>Analyzing quiz attempts and syllabus progress to diagnose weak spots…</p>
            </div>
          ) : weaknessError ? (
            <div className="ai-error-box">
              <p>{weaknessError}</p>
              <button className="ai-tab-btn active" onClick={loadWeaknessAnalysis} style={{ marginTop: '0.75rem' }}>
                Retry Analysis
              </button>
            </div>
          ) : weaknessData ? (
            <>
              {/* Diagnostic Overview Banner */}
              <div className="diagnostic-hero-banner">
                <div>
                  <span className={`diagnostic-badge badge-${weaknessData.overallHealth}`}>
                    <Sparkles size={14} />
                    {weaknessData.overallHealth === 'needs_attention'
                      ? 'Academic Review Recommended'
                      : weaknessData.overallHealth === 'moderate'
                      ? 'Solid Standing with Specific Gaps'
                      : 'Optimal Academic Progress'}
                  </span>
                  <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.25rem', fontWeight: 800 }}>
                    Diagnostic Summary
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
                    {weaknessData.diagnosticSummary}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
                    {weaknessData.weakTopicsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Diagnosed Weak Topics
                  </div>
                </div>
              </div>

              {/* Weak Topics Grid */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.5rem 0 0' }}>
                Priority Topics Requiring Revision
              </h3>

              {weaknessData.weakTopics && weaknessData.weakTopics.length > 0 ? (
                <div className="weak-topics-grid">
                  {weaknessData.weakTopics.map((item, idx) => (
                    <div key={idx} className="weak-topic-card">
                      <div className="weak-top-row">
                        <span className={`diagnostic-badge badge-${item.severity === 'critical' ? 'needs-attention' : 'moderate'}`}>
                          {item.severity} priority
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
                          Avg: {item.averageScore}%
                        </span>
                      </div>

                      <h4 className="weak-topic-name">{item.topic}</h4>
                      <div className="weak-subject-sub">
                        {item.subjectName} ({item.subjectCode})
                      </div>

                      <div className="weak-metrics-bar">
                        <div>
                          <strong style={{ color: '#dc2626' }}>{item.failedAttempts}</strong> failed quiz(zes)
                        </div>
                        <div>
                          <strong>{item.attemptsCount}</strong> total attempt(s)
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-practice-weak"
                        onClick={() => handlePracticeWeakTopic(item)}
                      >
                        <Play size={14} />
                        <span>Practice Remedial Quiz</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-loading-box" style={{ padding: '2rem' }}>
                  <CheckCircle size={36} color="#15803d" style={{ margin: '0 auto 0.75rem' }} />
                  <h4>No Critical Weaknesses Detected</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    You are performing above the 70% benchmark across all attempted assessments! Keep taking quizzes to maintain mastery.
                  </p>
                </div>
              )}

              {/* Strong Topics Showcase */}
              {weaknessData.strongTopics?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Strong Competencies ({weaknessData.strongTopics.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {weaknessData.strongTopics.map((s, i) => (
                      <span key={i} className="diagnostic-badge badge-good">
                        ✓ {s.topic} ({s.averageScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* =========================================================
          TAB 3: PERSONALIZED AI ROADMAP
          ========================================================= */}
      {activeTab === 'roadmap' && (
        <div className="roadmap-container">
          {/* Configuration Toolbar */}
          <div className="roadmap-config-bar">
            <div className="config-field">
              <label>Weekly Commitment:</label>
              <select
                className="context-select"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              >
                <option value={5}>5 Hours / Week (Light)</option>
                <option value={10}>10 Hours / Week (Standard)</option>
                <option value={15}>15 Hours / Week (Accelerated)</option>
                <option value={20}>20 Hours / Week (Intensive Placement)</option>
              </select>
            </div>

            <div className="config-field">
              <label>Target Career Pathway:</label>
              <select
                className="context-select"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
              >
                <option value="Full-Stack Software Engineer">Full-Stack Software Engineer</option>
                <option value="Backend & Cloud Systems Engineer">Backend & Cloud Systems Engineer</option>
                <option value="Data Analyst & BI">Data Analyst & BI</option>
                <option value="Applied AI & Machine Learning">Applied AI & Machine Learning</option>
                <option value="Frontend & UI Engineer">Frontend & UI Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              </select>
            </div>

            <div className="config-field">
              <label>Duration:</label>
              <select
                className="context-select"
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(Number(e.target.value))}
              >
                <option value={4}>4-Week Sprint</option>
                <option value={8}>8-Week Comprehensive Plan</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-ask-mentor"
              style={{ margin: 0, padding: '0.65rem 1.25rem' }}
              disabled={roadmapLoading}
              onClick={() => generateRoadmap(false)}
            >
              <Sparkles size={15} />
              <span>{roadmapLoading ? 'Regenerating…' : 'Regenerate Plan'}</span>
            </button>

            <button
              type="button"
              className="mode-chip"
              style={{ borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700 }}
              disabled={roadmapLoading}
              onClick={() => generateRoadmap(true)}
            >
              <Calendar size={14} />
              <span>Save to My Study Planner</span>
            </button>
          </div>

          {roadmapSavedNotice && (
            <div className="diagnostic-badge badge-good" style={{ alignSelf: 'flex-start' }}>
              <CheckCircle size={15} />
              <span>Personalized roadmap successfully synced with your Study Planner tasks!</span>
            </div>
          )}

          {roadmapError && (
            <div className="ai-error-box">
              <p>{roadmapError}</p>
            </div>
          )}

          {/* Roadmap Weeks Timeline */}
          {roadmapData && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem', fontWeight: 800 }}>
                  {roadmapData.roadmapTitle}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {roadmapData.summary}
                </p>
              </div>

              {roadmapData.weeks?.map((week) => (
                <div key={week.weekNumber} className="timeline-week-card">
                  <div className="timeline-week-header">
                    <span className="week-badge">Week {week.weekNumber}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Estimated {week.estimatedHours} Hours
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700 }}>
                    {week.theme}
                  </h4>

                  <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {week.goals?.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>

                  <div className="daily-tasks-grid">
                    {week.dailyTasks?.map((dt, idx) => (
                      <div key={idx} className="daily-task-box">
                        <div className="task-day">{dt.day}</div>
                        <div className="task-text">{dt.task}</div>
                        <div className="task-time">{dt.minutes} mins</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 4: AI CAREER GUIDE
          ========================================================= */}
      {activeTab === 'career' && (
        <div className="career-guide-container">
          {careerLoading ? (
            <div className="ai-loading-box">
              <div className="ai-spinner"></div>
              <p>Analyzing technical skills, curriculum mastery, and building 4-phase career roadmap…</p>
            </div>
          ) : careerError ? (
            <div className="ai-error-box">
              <p>{careerError}</p>
              <button className="ai-tab-btn active" onClick={() => loadCareerGuide('full_stack')} style={{ marginTop: '0.75rem' }}>
                Retry
              </button>
            </div>
          ) : careerGuideData ? (
            <>
              {/* Top Match Card */}
              <div className="diagnostic-hero-banner" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)' }}>
                <div>
                  <span className="diagnostic-badge badge-good">
                    <Sparkles size={14} />
                    {careerGuideData.matchPercent}% Profile Match
                  </span>
                  <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.5rem', fontWeight: 800 }}>
                    {careerGuideData.targetCareer}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 700 }}>
                    Target Placement Salary: {careerGuideData.salaryBand || '₹7.0 – ₹15 LPA'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="mode-chip"
                    onClick={() => loadCareerGuide('backend')}
                  >
                    Backend
                  </button>
                  <button
                    type="button"
                    className="mode-chip"
                    onClick={() => loadCareerGuide('data_analyst')}
                  >
                    Data Analyst
                  </button>
                  <button
                    type="button"
                    className="mode-chip"
                    onClick={() => loadCareerGuide('ai_ml')}
                  >
                    AI / ML
                  </button>
                </div>
              </div>

              {/* Skills Gap Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', margin: '1.5rem 0' }}>
                <div className="mentor-input-card">
                  <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '0.95rem', fontWeight: 700 }}>
                    Verified Competencies
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {careerGuideData.matchedSkills?.map((skill, i) => (
                      <span key={i} className="diagnostic-badge badge-good">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mentor-input-card">
                  <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '0.95rem', fontWeight: 700 }}>
                    Skills to Bridge for Recruitment
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {careerGuideData.missingSkills?.map((skill, i) => (
                      <span key={i} className="diagnostic-badge badge-needs-attention">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4-Phase Step-by-Step Roadmap */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1.5rem 0 1rem' }}>
                4-Phase Step-by-Step Career Roadmap
              </h3>

              <div className="career-phases-list">
                {careerGuideData.developmentPhases?.map((phase) => (
                  <div key={phase.phaseNumber} className="career-phase-card">
                    <div className="phase-top">
                      <h4 className="phase-title">
                        Phase {phase.phaseNumber}: {phase.phaseTitle}
                      </h4>
                      <span className="week-badge">{phase.duration}</span>
                    </div>

                    <div className="phase-focus">Focus: {phase.focus}</div>

                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {phase.keyMilestones?.map((m, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
