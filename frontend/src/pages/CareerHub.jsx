import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Edit3,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Printer,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  User,
  XCircle
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import './CareerHub.css';

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState('guidance'); // guidance, resume, interviews, placement

  // Career Guidance state
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [careerPaths, setCareerPaths] = useState([]);
  const [guidanceError, setGuidanceError] = useState('');

  // Resume state
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [resumeTemplate, setResumeTemplate] = useState('modern'); // modern, classic, executive
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Interview state
  const [interviewCategories, setInterviewCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [interviewError, setInterviewError] = useState('');

  // Placement state
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementData, setPlacementData] = useState(null);
  const [placementError, setPlacementError] = useState('');

  // Initial tab loading effects
  useEffect(() => {
    if (activeTab === 'guidance' && !assessmentData) {
      loadCareerGuidance();
    } else if (activeTab === 'resume' && !resumeData) {
      loadResume();
    } else if (activeTab === 'interviews' && questions.length === 0) {
      loadInterviewCategories();
      loadQuestions('all', 'all');
    } else if (activeTab === 'placement' && !placementData) {
      loadPlacementDashboard();
    }
  }, [activeTab]);

  /* ----------------------------------------------------
     Tab 1: Career Guidance loaders
     ---------------------------------------------------- */
  const loadCareerGuidance = async () => {
    setAssessmentLoading(true);
    setGuidanceError('');
    try {
      const [assessRes, pathsRes] = await Promise.all([
        api.get('/career/assessment'),
        api.get('/career/paths')
      ]);
      const assessUnwrapped = unwrap(assessRes);
      const pathsUnwrapped = unwrap(pathsRes);
      setAssessmentData(assessUnwrapped);
      setCareerPaths(pathsUnwrapped?.careerPaths || []);
    } catch (err) {
      setGuidanceError(getErrorMessage(err) || 'Failed to load career assessment data.');
    } finally {
      setAssessmentLoading(false);
    }
  };

  /* ----------------------------------------------------
     Tab 2: Resume Loader
     ---------------------------------------------------- */
  const loadResume = async () => {
    setResumeLoading(true);
    setResumeError('');
    try {
      const res = await api.get('/career/resume');
      const data = unwrap(res);
      setResumeData(data?.resume || null);
    } catch (err) {
      setResumeError(getErrorMessage(err) || 'Failed to load resume payload.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handlePrintResume = () => {
    window.print();
  };

  /* ----------------------------------------------------
     Tab 3: Interview loaders & evaluation
     ---------------------------------------------------- */
  const loadInterviewCategories = async () => {
    try {
      const res = await api.get('/career/interviews/categories');
      const data = unwrap(res);
      setInterviewCategories(data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const loadQuestions = async (cat, diff) => {
    setInterviewError('');
    try {
      const res = await api.get(`/career/interviews/questions?category=${encodeURIComponent(cat)}&difficulty=${encodeURIComponent(diff)}`);
      const data = unwrap(res);
      const qList = data?.questions || [];
      setQuestions(qList);
      if (qList.length > 0 && (!selectedQuestion || !qList.some((q) => q.id === selectedQuestion.id))) {
        setSelectedQuestion(qList[0]);
        setStudentAnswer('');
        setEvaluationResult(null);
      }
    } catch (err) {
      setInterviewError(getErrorMessage(err) || 'Failed to load interview questions.');
    }
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    loadQuestions(cat, selectedDifficulty);
  };

  const handleDifficultyChange = (e) => {
    const diff = e.target.value;
    setSelectedDifficulty(diff);
    loadQuestions(selectedCategory, diff);
  };

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setStudentAnswer('');
    setEvaluationResult(null);
  };

  const handleSubmitInterviewAnswer = async () => {
    if (!selectedQuestion || !studentAnswer.trim()) return;
    setSubmittingAnswer(true);
    try {
      const res = await api.post('/career/interviews/mock/submit', {
        questionId: selectedQuestion.id,
        answer: studentAnswer
      });
      const data = unwrap(res);
      setEvaluationResult(data?.evaluation || null);
    } catch (err) {
      setInterviewError(getErrorMessage(err) || 'Failed to evaluate answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  /* ----------------------------------------------------
     Tab 4: Placement Dashboard loader
     ---------------------------------------------------- */
  const loadPlacementDashboard = async () => {
    setPlacementLoading(true);
    setPlacementError('');
    try {
      const res = await api.get('/career/placement/dashboard');
      const data = unwrap(res);
      setPlacementData(data || null);
    } catch (err) {
      setPlacementError(getErrorMessage(err) || 'Failed to load placement resources.');
    } finally {
      setPlacementLoading(false);
    }
  };

  return (
    <div className="career-hub-page">
      {/* Header */}
      <div className="career-hub-header">
        <h1 className="career-hub-title">
          <Compass size={28} className="text-primary" />
          <span>Career & Placement Hub</span>
        </h1>
        <p className="career-hub-subtitle">
          Discover optimal technical pathways, build ATS-ready resumes, practice technical interviews, and master campus placement drives.
        </p>

        {/* Navigation Tabs */}
        <div className="career-tabs-nav">
          <button
            className={`career-tab-btn ${activeTab === 'guidance' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidance')}
          >
            <Compass size={16} />
            <span>Career Guidance</span>
          </button>
          <button
            className={`career-tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            <FileText size={16} />
            <span>Resume Builder</span>
          </button>
          <button
            className={`career-tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <HelpCircle size={16} />
            <span>Interview Preparation</span>
          </button>
          <button
            className={`career-tab-btn ${activeTab === 'placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            <Building2 size={16} />
            <span>Placement Dashboard</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: CAREER GUIDANCE & ASSESSMENT
          ========================================================= */}
      {activeTab === 'guidance' && (
        <div className="guidance-container">
          {assessmentLoading ? (
            <div className="career-loading-box">
              <div className="career-spinner"></div>
              <p>Evaluating profile, quizzes, and project competencies…</p>
            </div>
          ) : guidanceError ? (
            <div className="career-error-box">
              <p>{guidanceError}</p>
              <button className="career-tab-btn active" onClick={loadCareerGuidance} style={{ marginTop: '0.75rem' }}>
                Retry Assessment
              </button>
            </div>
          ) : (
            <>
              {/* Dynamic Top Career Match Banner */}
              {assessmentData?.topCareerMatch && (
                <div className="assessment-hero-card">
                  <div className="assessment-hero-top">
                    <span className="assessment-match-badge">
                      <Sparkles size={15} />
                      Top Recommended Pathway ({assessmentData.topCareerMatch.matchScore}% Match)
                    </span>
                    <span className="path-salary-band">
                      {assessmentData.topCareerMatch.salaryBand || '₹6.5 – ₹14 LPA'}
                    </span>
                  </div>

                  <h2 className="top-career-name">{assessmentData.topCareerMatch.title}</h2>
                  <p className="top-career-desc">{assessmentData.topCareerMatch.description}</p>

                  <div className="career-strengths-row">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>Your Matching Strengths:</span>
                    {assessmentData.topCareerMatch.matchedSkills?.map((skill, i) => (
                      <span key={i} className="career-pill-tag">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  {assessmentData.topCareerMatch.missingSkills?.length > 0 && (
                    <div className="career-strengths-row">
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>Skills to Bridge:</span>
                      {assessmentData.topCareerMatch.missingSkills.map((skill, i) => (
                        <span key={i} className="career-missing-tag">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7 Core Career Pathways Grid */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Industry Career Pathways & Readiness
              </h3>

              <div className="career-grid-layout">
                {(assessmentData?.careerRecommendations || careerPaths).map((path) => (
                  <div key={path.id} className="career-path-card">
                    <div className="path-card-header">
                      <h4 className="path-card-title">{path.title}</h4>
                      <span className="path-salary-band">{path.salaryBand}</span>
                    </div>

                    {typeof path.matchScore === 'number' && (
                      <div className="path-match-bar-wrap">
                        <div className="path-match-label">
                          <span>Profile Match</span>
                          <span>{path.matchScore}%</span>
                        </div>
                        <div className="path-match-track">
                          <div
                            className="path-match-fill"
                            style={{ width: `${path.matchScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="path-card-desc">{path.description}</p>

                    <div className="path-section-mini">
                      <div className="path-mini-title">Key Industry Roles</div>
                      <div className="path-skills-chips">
                        {path.roles?.map((role, i) => (
                          <span key={i} className="path-skill-chip">{role}</span>
                        ))}
                      </div>
                    </div>

                    <div className="path-section-mini">
                      <div className="path-mini-title">Core Skills</div>
                      <div className="path-skills-chips">
                        {path.requiredSkills?.map((skill, i) => (
                          <span key={i} className="path-skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="path-section-mini">
                      <div className="path-mini-title">Recommended Curriculum</div>
                      <div className="path-skills-chips">
                        {path.recommendedCourses?.map((course, i) => (
                          <span key={i} className="path-skill-chip" style={{ background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)' }}>
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: RESUME BUILDER
          ========================================================= */}
      {activeTab === 'resume' && (
        <div className="resume-builder-container">
          {resumeLoading ? (
            <div className="career-loading-box">
              <div className="career-spinner"></div>
              <p>Assembling university achievements, projects, and coursework…</p>
            </div>
          ) : resumeError || !resumeData ? (
            <div className="career-error-box">
              <p>{resumeError || 'Could not load resume data.'}</p>
              <button className="career-tab-btn active" onClick={loadResume} style={{ marginTop: '0.75rem' }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="resume-toolbar">
                <div className="resume-template-selector">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Template:</span>
                  <button
                    className={`template-pill ${resumeTemplate === 'modern' ? 'active' : ''}`}
                    onClick={() => setResumeTemplate('modern')}
                  >
                    Modern Tech
                  </button>
                  <button
                    className={`template-pill ${resumeTemplate === 'classic' ? 'active' : ''}`}
                    onClick={() => setResumeTemplate('classic')}
                  >
                    Minimalist Classic (ATS)
                  </button>
                  <button
                    className={`template-pill ${resumeTemplate === 'executive' ? 'active' : ''}`}
                    onClick={() => setResumeTemplate('executive')}
                  >
                    Executive Grid
                  </button>
                </div>

                <div className="resume-actions-group">
                  <button
                    className="btn-toggle-edit"
                    onClick={() => setIsEditingResume(!isEditingResume)}
                  >
                    <Edit3 size={15} />
                    <span>{isEditingResume ? 'Preview Mode' : 'Edit Resume'}</span>
                  </button>

                  <button className="btn-print-resume" onClick={handlePrintResume}>
                    <Printer size={15} />
                    <span>Export / Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Resume Sheet Preview */}
              <div className="resume-paper-wrap">
                <div className={`resume-sheet resume-${resumeTemplate}`}>
                  {/* Header */}
                  <div className="res-header">
                    {isEditingResume ? (
                      <input
                        className="res-editable-input"
                        style={{ fontSize: '18pt', fontWeight: 800, marginBottom: '0.5rem' }}
                        value={resumeData.header.name}
                        onChange={(e) => setResumeData({
                          ...resumeData,
                          header: { ...resumeData.header, name: e.target.value }
                        })}
                      />
                    ) : (
                      <h1 className="res-name">{resumeData.header.name}</h1>
                    )}

                    <div className="res-contact-row">
                      <span>{resumeData.header.email}</span>
                      <span>•</span>
                      <span>{resumeData.header.phone}</span>
                      <span>•</span>
                      <span>{resumeData.header.location}</span>
                      <span>•</span>
                      <span>Roll: {resumeData.header.enrollmentNumber}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="res-section">
                    <div className="res-sec-title">Professional Summary</div>
                    {isEditingResume ? (
                      <textarea
                        className="res-editable-textarea"
                        value={resumeData.summary}
                        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      />
                    ) : (
                      <p style={{ margin: 0, fontSize: '9pt', color: '#334155' }}>{resumeData.summary}</p>
                    )}
                  </div>

                  {/* Education */}
                  <div className="res-section">
                    <div className="res-sec-title">Education</div>
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="res-item">
                        <div className="res-item-header">
                          <span className="res-item-title">{edu.degree}</span>
                          <span className="res-item-meta">{edu.batch}</span>
                        </div>
                        <div className="res-item-sub">{edu.institution}, {edu.campus} — {edu.gpa}</div>
                        <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{edu.highlights}</div>
                      </div>
                    ))}
                  </div>

                  {/* Technical Skills */}
                  <div className="res-section">
                    <div className="res-sec-title">Technical Skills</div>
                    <div className="res-item" style={{ marginBottom: 0 }}>
                      <p style={{ margin: '0 0 0.2rem', fontSize: '9pt' }}>
                        <strong>Languages: </strong>
                        {(resumeData.skills.programmingLanguages || []).join(', ') || 'C, C++, Java, JavaScript, Python'}
                      </p>
                      <p style={{ margin: '0 0 0.2rem', fontSize: '9pt' }}>
                        <strong>Frameworks & Web: </strong>
                        {(resumeData.skills.frameworksAndLibraries || []).join(', ')}
                      </p>
                      <p style={{ margin: 0, fontSize: '9pt' }}>
                        <strong>Databases & Tools: </strong>
                        {(resumeData.skills.databasesAndTools || []).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="res-section">
                    <div className="res-sec-title">Key Projects</div>
                    {resumeData.projects && resumeData.projects.length > 0 ? (
                      resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="res-item">
                          <div className="res-item-header">
                            <span className="res-item-title">{proj.title} | {proj.category}</span>
                            <span className="res-item-meta">{(proj.techStack || []).join(', ')}</span>
                          </div>
                          <ul className="res-bullets">
                            {proj.bullets?.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '8.5pt', color: '#64748b' }}>Complete projects in the Projects module to auto-list them here.</div>
                    )}
                  </div>

                  {/* Certifications & Achievements */}
                  <div className="res-section">
                    <div className="res-sec-title">Certifications & Achievements</div>
                    {resumeData.certifications?.length > 0 && (
                      <div className="res-item" style={{ marginBottom: '0.4rem' }}>
                        {resumeData.certifications.map((c, i) => (
                          <div key={i} style={{ fontSize: '8.75pt', marginBottom: '0.15rem' }}>
                            • <strong>{c.title}</strong> — {c.issuer} (Grade: {c.grade}, {c.date})
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeData.achievements?.map((ach, i) => (
                      <div key={i} style={{ fontSize: '8.75pt', marginBottom: '0.15rem' }}>
                        • {ach}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: INTERVIEW PREPARATION & SIMULATOR
          ========================================================= */}
      {activeTab === 'interviews' && (
        <div className="interview-container">
          {/* Filters */}
          <div className="interview-filter-bar">
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>Category:</span>
              <select
                className="interview-filter-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="all">All Categories</option>
                {interviewCategories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>Difficulty:</span>
              <select
                className="interview-filter-select"
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {interviewError && (
            <div className="career-error-box" style={{ padding: '1rem' }}>
              <p>{interviewError}</p>
            </div>
          )}

          {/* Split View */}
          <div className="interview-split-view">
            {/* Left: Questions list */}
            <div className="interview-questions-list">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`interview-q-card ${selectedQuestion?.id === q.id ? 'selected' : ''}`}
                  onClick={() => handleSelectQuestion(q)}
                >
                  <div className="q-card-top">
                    <span className="q-category-tag">{q.category}</span>
                    <span className={`q-diff-badge diff-${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="q-card-title">{q.question}</h4>
                </div>
              ))}
            </div>

            {/* Right: Interactive Mock Simulator */}
            {selectedQuestion ? (
              <div className="interview-simulator-panel">
                <div className="sim-q-header">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="q-category-tag">{selectedQuestion.category}</span>
                    <span>•</span>
                    <span className={`q-diff-badge diff-${selectedQuestion.difficulty.toLowerCase()}`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <h3 className="sim-q-title">{selectedQuestion.question}</h3>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Your Technical / Behavioral Response:
                  </label>
                  <textarea
                    className="sim-textarea"
                    placeholder="Structure your answer clearly. For technical questions, mention core mechanisms, time/space trade-offs, or concrete examples..."
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                  />
                </div>

                <button
                  className="sim-btn-submit"
                  disabled={submittingAnswer || !studentAnswer.trim()}
                  onClick={handleSubmitInterviewAnswer}
                >
                  <Send size={15} />
                  <span>{submittingAnswer ? 'Evaluating Answer…' : 'Submit for Rubric Evaluation'}</span>
                </button>

                {/* Rubric Evaluation Result */}
                {evaluationResult && (
                  <div className="eval-result-card">
                    <div className="eval-score-row">
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Evaluation Feedback</h4>
                      <div className="eval-score-badge">
                        Score: {evaluationResult.score} / {evaluationResult.maxScore}
                      </div>
                    </div>

                    <p className="eval-feedback-text">{evaluationResult.feedback}</p>

                    <div className="rubric-points-grid">
                      <div className="rubric-col">
                        <h5 style={{ color: '#166534' }}>Key Points Covered ({evaluationResult.coveredRubricPoints?.length || 0})</h5>
                        {evaluationResult.coveredRubricPoints?.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '0.825rem', color: '#14532d', marginBottom: '0.2rem' }}>
                            ✓ {p}
                          </div>
                        ))}
                      </div>

                      <div className="rubric-col">
                        <h5 style={{ color: '#991b1b' }}>Missed Points ({evaluationResult.missingRubricPoints?.length || 0})</h5>
                        {evaluationResult.missingRubricPoints?.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '0.825rem', color: '#7f1d1d', marginBottom: '0.2rem' }}>
                            ✗ {p}
                          </div>
                        ))}
                      </div>
                    </div>

                    {evaluationResult.sampleModelAnswer && (
                      <div className="model-answer-box">
                        <div className="model-answer-title">
                          <CheckCircle2 size={16} />
                          <span>Expert Model Answer</span>
                        </div>
                        <p className="model-answer-content">{evaluationResult.sampleModelAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="career-error-box">
                <p>Select a question from the left list to begin interactive mock practice.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: PLACEMENT DASHBOARD & COMPANY PACKS
          ========================================================= */}
      {activeTab === 'placement' && (
        <div className="placement-container">
          {placementLoading ? (
            <div className="career-loading-box">
              <div className="career-spinner"></div>
              <p>Loading placement drives and recruitment roadmaps…</p>
            </div>
          ) : placementError || !placementData ? (
            <div className="career-error-box">
              <p>{placementError || 'Failed to load placement data.'}</p>
              <button className="career-tab-btn active" onClick={loadPlacementDashboard} style={{ marginTop: '0.75rem' }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Aptitude Practice Modules */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Aptitude & Technical Foundations
                </h3>
                <div className="placement-aptitude-grid">
                  {placementData.aptitudeSections?.map((section) => (
                    <div key={section.id} className="aptitude-card">
                      <div className="aptitude-top">
                        <span className="aptitude-name">{section.name}</span>
                        <span className="aptitude-count">{section.questionCount} Questions</span>
                      </div>
                      <p className="aptitude-desc">{section.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {section.topics?.map((topic, i) => (
                          <span key={i} className="path-skill-chip">{topic}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Recruitment Packs */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Recruitment Packs for Top Tech Employers
                </h3>
                <div className="company-packs-grid">
                  {placementData.companyPacks?.map((pack) => (
                    <div key={pack.company} className="company-pack-card">
                      <div className="company-pack-header">
                        <h4 className="company-name">{pack.company}</h4>
                        <span className="company-pkg">{pack.salaryRange}</span>
                      </div>
                      <div className="company-role">{pack.role}</div>

                      <div className="rounds-timeline">
                        {pack.rounds?.map((round) => (
                          <div key={round.roundNumber} className="round-item">
                            <div className="round-num">{round.roundNumber}</div>
                            <div className="round-info">
                              <span className="round-name">{round.name}</span>
                              <span className="round-detail">{round.pattern}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          Eligibility Criteria:
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                          {pack.eligibility}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-Day & 60-Day Placement Roadmaps */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Structured Campus Placement Roadmaps
                </h3>
                <div className="roadmaps-wrap">
                  {placementData.roadmaps?.map((roadmap) => (
                    <div key={roadmap.id} className="roadmap-card">
                      <h4 className="roadmap-title">{roadmap.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {roadmap.description}
                      </p>

                      <div className="roadmap-weeks-list">
                        {roadmap.weeks?.map((week, idx) => (
                          <div key={idx} className="roadmap-week-box">
                            <div className="week-label">{week.week}</div>
                            <div className="week-focus">{week.focus}</div>
                            <div className="week-tasks">{week.tasks}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
