import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Code2,
  Cpu,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trophy,
  XCircle
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import './CodingPlatform.css';

export default function CodingPlatform() {
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  // Problem Catalog State
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [codingProgress, setCodingProgress] = useState(null);

  // Active Problem Solver State
  const [problemDetail, setProblemDetail] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [solverError, setSolverError] = useState('');
  const [celebrationToast, setCelebrationToast] = useState('');

  // Initial catalog load
  useEffect(() => {
    loadProblems();
    loadProgress();
  }, [filterCategory, filterDifficulty]);

  // Load problem details when selected
  useEffect(() => {
    if (selectedProblemId) {
      loadProblemDetail(selectedProblemId);
    } else {
      setProblemDetail(null);
      setExecutionResult(null);
    }
  }, [selectedProblemId]);

  const loadProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/coding/problems?category=${filterCategory}&difficulty=${filterDifficulty}&search=${encodeURIComponent(searchQuery)}`);
      const data = unwrap(res);
      setProblems(data?.problems || []);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to load coding problem library.');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await api.get('/coding/progress');
      const data = unwrap(res);
      setCodingProgress(data);
    } catch (err) {
      console.warn('Could not load coding progress:', err.message);
    }
  };

  const loadProblemDetail = async (id) => {
    setSolverError('');
    try {
      const res = await api.get(`/coding/problems/${id}`);
      const data = unwrap(res);
      const prob = data?.problem;
      setProblemDetail(prob);

      // Initialize starter code
      const starter = data?.previousCode || prob?.starterCode?.[language] || '// Write your code here...';
      setCode(starter);
    } catch (err) {
      setSolverError(getErrorMessage(err) || 'Failed to load problem details.');
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problemDetail?.starterCode?.[newLang]) {
      setCode(problemDetail.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problemDetail?.starterCode?.[language]) {
      setCode(problemDetail.starterCode[language]);
    }
  };

  const handleRunCode = async () => {
    if (!problemDetail || !code.trim()) return;
    setRunning(true);
    setExecutionResult(null);
    setSolverError('');
    try {
      const res = await api.post(`/coding/problems/${problemDetail._id}/run`, {
        code,
        language
      });
      const data = unwrap(res);
      setExecutionResult(data?.evaluation);
    } catch (err) {
      setSolverError(getErrorMessage(err) || 'Test run failed.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problemDetail || !code.trim()) return;
    setSubmitting(true);
    setExecutionResult(null);
    setSolverError('');
    try {
      const res = await api.post(`/coding/problems/${problemDetail._id}/submit`, {
        code,
        language
      });
      const data = unwrap(res);
      setExecutionResult(data);

      if (data?.status === 'accepted') {
        const xpMsg = data.earnedXP > 0 ? ` +${data.earnedXP} XP Awarded!` : '';
        setCelebrationToast(`🎉 Solution Accepted!${xpMsg}`);
        setTimeout(() => setCelebrationToast(''), 5000);
        loadProgress();
      }
    } catch (err) {
      setSolverError(getErrorMessage(err) || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
     VIEW 2: SPLIT SCREEN PROBLEM SOLVER WORKSPACE
     ------------------------------------------------------------------ */
  if (selectedProblemId && problemDetail) {
    return (
      <div className="coding-page">
        <div className="solver-top-bar">
          <button
            type="button"
            className="btn-back-problems"
            onClick={() => { setSelectedProblemId(null); loadProblems(); }}
          >
            <ArrowLeft size={16} />
            <span>Problem Library</span>
          </button>

          {celebrationToast && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
              {celebrationToast}
            </div>
          )}
        </div>

        <div className="solver-grid">
          {/* Left Panel: Problem Specs */}
          <div className="solver-left-panel">
            <div className="problem-header-row">
              <h2 className="problem-main-title">{problemDetail.title}</h2>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span className={`diff-tag ${problemDetail.difficulty}`}>
                  {problemDetail.difficulty}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '0.35rem' }}>
                  {problemDetail.points} XP
                </span>
              </div>
            </div>

            <div className="problem-desc-prose">
              {problemDetail.description}
            </div>

            {/* Constraints */}
            {problemDetail.constraints?.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Constraints:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  {problemDetail.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Test Cases */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Sample Test Cases:
              </h4>
              {problemDetail.sampleTestCases?.map((tc, idx) => (
                <div key={idx} className="sample-test-card">
                  <div style={{ marginBottom: '0.3rem' }}>
                    <strong>Input: </strong>
                    <code className="sample-code-val">{tc.input}</code>
                  </div>
                  <div>
                    <strong>Expected Output: </strong>
                    <code className="sample-code-val">{tc.expectedOutput}</code>
                  </div>
                  {tc.explanation && (
                    <div style={{ marginTop: '0.3rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Explanation: {tc.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Code Editor & Console */}
          <div className="solver-right-panel">
            {/* Editor Top Bar */}
            <div className="editor-toolbar">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  className="coding-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="javascript">JavaScript (Node 18 VM)</option>
                  <option value="python">Python 3 (Isolated)</option>
                </select>

                <button
                  type="button"
                  className="btn-back-problems"
                  onClick={handleResetCode}
                  title="Reset to starter template"
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              <div className="editor-actions-row">
                <button
                  type="button"
                  className="btn-run-code"
                  disabled={running || submitting}
                  onClick={handleRunCode}
                >
                  <Play size={14} />
                  <span>{running ? 'Running…' : 'Run Code'}</span>
                </button>

                <button
                  type="button"
                  className="btn-submit-code"
                  disabled={running || submitting}
                  onClick={handleSubmitCode}
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting…' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
            />

            {/* Results Console */}
            {solverError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                {solverError}
              </div>
            )}

            {executionResult && (
              <div className="results-console">
                <div className="console-header-row">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className={`eval-status-badge ${executionResult.status}`}>
                      {executionResult.status?.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {executionResult.passedTestCasesCount} / {executionResult.totalTestCasesCount} Test Cases Passed
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Runtime: {executionResult.runtimeMs || 0} ms</span>
                  </div>
                </div>

                {executionResult.errorMessage && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '0.35rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {executionResult.errorMessage}
                  </div>
                )}

                {/* Test case breakdown */}
                <div className="test-cases-pills-row">
                  {executionResult.testCaseResults?.map((tc) => (
                    <div
                      key={tc.testCaseIndex}
                      className={`test-pill ${tc.passed ? 'passed' : 'failed'}`}
                    >
                      Case {tc.testCaseIndex}: {tc.passed ? 'Passed ✓' : 'Failed ✗'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------
     VIEW 1: PROBLEM CATALOG & PROGRESS
     ------------------------------------------------------------------ */
  return (
    <div className="coding-page">
      <div className="coding-header">
        <h1 className="coding-title">
          <Code2 size={28} className="text-primary" />
          <span>Coding Practice Platform</span>
        </h1>
        <p className="coding-sub">
          Master algorithms, relational schema queries, and data structures. Solutions are verified in an isolated sandboxed environment.
        </p>

        {/* Quick Stats Banner */}
        {codingProgress && (
          <div className="coding-stats-row">
            <div className="coding-stat-card">
              <div className="stat-icon-wrap">
                <CheckCircle size={22} />
              </div>
              <div>
                <div className="stat-val">{codingProgress.solvedCount} / {codingProgress.totalProblems}</div>
                <div className="stat-label">Problems Solved</div>
              </div>
            </div>

            <div className="coding-stat-card">
              <div className="stat-icon-wrap" style={{ color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)' }}>
                <Trophy size={22} />
              </div>
              <div>
                <div className="stat-val">+{codingProgress.totalXPFromCoding} XP</div>
                <div className="stat-label">Earned from Code</div>
              </div>
            </div>

            <div className="coding-stat-card">
              <div className="stat-icon-wrap" style={{ color: '#059669', background: 'rgba(5, 150, 105, 0.1)' }}>
                <Layers size={22} />
              </div>
              <div>
                <div className="stat-val">{codingProgress.completionPercent}%</div>
                <div className="stat-label">Curriculum Track</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="coding-filter-bar">
          <div className="filter-group">
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginRight: '0.4rem', color: 'var(--text-secondary)' }}>
                Category:
              </span>
              <select
                className="coding-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="arrays">Arrays & Hash Maps</option>
                <option value="stacks_queues">Stacks & Queues</option>
                <option value="algorithms">Search & Sort Algorithms</option>
                <option value="dynamic_programming">Dynamic Programming</option>
                <option value="trees">Binary Trees</option>
                <option value="databases">Relational Queries</option>
              </select>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginRight: '0.4rem', color: 'var(--text-secondary)' }}>
                Difficulty:
              </span>
              <select
                className="coding-select"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="coding-search-input"
              placeholder="Search problem title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadProblems(); }}
            />
            <button
              type="button"
              className="btn-run-code"
              onClick={loadProblems}
            >
              <Search size={15} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Problems List Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <p>Loading curated problems...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className="problems-table-wrap">
            <table className="problems-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Problem Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Points</th>
                  <th>Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p._id} onClick={() => setSelectedProblemId(p._id)}>
                    <td style={{ width: '90px' }}>
                      {p.isSolved ? (
                        <span className="status-solved-badge">
                          <CheckCircle size={15} color="#16a34a" />
                          <span>Solved</span>
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Unsolved</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.title}</strong>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {p.category?.replace(/_/g, ' ')}
                    </td>
                    <td>
                      <span className={`diff-tag ${p.difficulty}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      +{p.points} XP
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {p.acceptanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
