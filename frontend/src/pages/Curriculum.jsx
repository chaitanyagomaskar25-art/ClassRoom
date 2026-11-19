import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Hash,
  HelpCircle,
  Layers3,
  Library,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Target
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState } from '../components/ContentState.jsx';
import SubjectIcon from '../components/SubjectIcon.jsx';
import SubjectModal from '../components/SubjectModal.jsx';
import {
  allSubjects,
  programmeOutcomes,
  semesterColors,
  semesterCreditSummary,
  semestersList,
  universityInfo
} from '../data/curriculumData.js';
import { idOf, listFrom } from '../utils/format.js';

export default function Curriculum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user) || {};
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;
  const paramSem = searchParams.get('semester');

  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (studentSem) return studentSem;
    if (paramSem) return paramSem === 'all' ? 'all' : Number(paramSem);
    return 1;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSubject, setModalSubject] = useState(null);
  const [backendSubjects, setBackendSubjects] = useState([]);

  // Keep selected semester in sync with student's profile enrolled semester
  useEffect(() => {
    if (studentSem) {
      setSelectedSemester(studentSem);
    }
  }, [studentSem]);

  // Fetch backend subjects if user is logged in and backend has registered lesson data
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const semestersRes = listFrom(unwrap(await api.get('/semesters')), 'semesters');
        if (semestersRes.length && isMounted) {
          const subjectsPromises = semestersRes.map((sem) =>
            api.get(`/semesters/${idOf(sem)}/subjects`).then((res) => listFrom(unwrap(res), 'subjects')).catch(() => [])
          );
          const allSubs = (await Promise.all(subjectsPromises)).flat();
          if (isMounted) setBackendSubjects(allSubs);
        }
      } catch {
        // Backend seed may only have limited subjects; fallback gracefully to complete official syllabus
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter subjects based on active tab and search query
  const displayedSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Source subjects: show selected semester or all subjects
    let list = [];
    if (selectedSemester === 'all') {
      list = allSubjects;
    } else {
      const currentPlan = semestersList.find((s) => s.semester === selectedSemester);
      list = currentPlan?.subjects || [];
    }

    if (!query) return list;

    return list.filter((sub) => {
      const nameMatch = (sub.name || '').toLowerCase().includes(query);
      const codeMatch = (sub.code || '').toLowerCase().includes(query);
      const natureMatch = (sub.nature || '').toLowerCase().includes(query);
      const descMatch = (sub.description || '').toLowerCase().includes(query);
      const topicMatch = Array.isArray(sub.topics) && sub.topics.some((t) => t.toLowerCase().includes(query));
      return nameMatch || codeMatch || natureMatch || descMatch || topicMatch;
    });
  }, [selectedSemester, searchQuery]);

  const activeSemesterPlan = useMemo(() => {
    if (selectedSemester === 'all') return null;
    return semestersList.find((s) => s.semester === selectedSemester);
  }, [selectedSemester]);

  const activeColors = useMemo(() => {
    if (selectedSemester === 'all') return semesterColors[1];
    return semesterColors[selectedSemester] || semesterColors[1];
  }, [selectedSemester]);

  const totalCreditsAccumulated = useMemo(() => {
    return semesterCreditSummary.reduce((acc, curr) => acc + curr.credits, 0);
  }, []);

  const totalLHours = useMemo(() => {
    return semesterCreditSummary.reduce((acc, curr) => acc + curr.l, 0);
  }, []);

  const totalTHours = useMemo(() => {
    return semesterCreditSummary.reduce((acc, curr) => acc + curr.t, 0);
  }, []);

  const totalPHours = useMemo(() => {
    return semesterCreditSummary.reduce((acc, curr) => acc + curr.p, 0);
  }, []);

  // Helper to match backend subject if available
  const findBackendSubject = (code, name) => {
    return backendSubjects.find(
      (bs) =>
        (bs.code && bs.code.toLowerCase() === (code || '').toLowerCase()) ||
        (bs.title && bs.title.toLowerCase() === (name || '').toLowerCase())
    );
  };

  const handleOpenDetails = (subject, semesterNum) => {
    const sem = semesterNum || subject.semester || (typeof selectedSemester === 'number' ? selectedSemester : 1);
    setModalSubject({
      ...subject,
      semester: sem
    });
  };

  const handleLearnAction = (subject, semesterNum) => {
    const sem = semesterNum || subject.semester || (typeof selectedSemester === 'number' ? selectedSemester : 1);
    if (studentSem && Number(sem) !== studentSem) {
      alert(`🔒 Study access is locked for Semester ${sem}. You are enrolled in Semester ${studentSem}. Only Semester ${studentSem} study modules are unlocked.`);
      return;
    }
    const sId = subject.id || subject.code;
    navigate(`/lessons/${encodeURIComponent(sId)}?semester=${encodeURIComponent(sem)}&subject=${encodeURIComponent(sId)}&name=${encodeURIComponent(subject.name)}&code=${encodeURIComponent(subject.code)}`, {
      state: {
        semesterId: sem,
        subjectId: sId,
        subjectName: subject.name,
        courseCode: subject.code,
        subject
      }
    });
  };

  return (
    <div className="content-page curriculum-page">
      {/* 1. Official Programme Header */}
      <header className="page-heading curriculum-page-heading">
        <div className="page-heading-left">
          <div className="university-program-badges">
            <span className="curriculum-eyebrow">
              <GraduationCap size={14} />
              <span>BCA Academic Curriculum</span>
            </span>
            <span className="badge-sep">•</span>
            <span>{universityInfo.degreeType}</span>
          </div>

          <h1 className="curriculum-main-title">
            {universityInfo.program}
          </h1>

          <div className="curriculum-submeta">
            <strong>{universityInfo.department}</strong>
            <span className="badge-sep">•</span>
            <span>Official Syllabus Framework</span>
          </div>

          <p className="curriculum-lead">
            {universityInfo.summary}
          </p>

          {/* Quick Header Metric Pills */}
          <div className="curriculum-header-pills">
            <div className="header-pill">
              <span className="pill-num">{universityInfo.totalSemesters}</span>
              <span className="pill-text">Semesters</span>
            </div>
            <div className="header-pill">
              <span className="pill-num">{universityInfo.totalSubjects}</span>
              <span className="pill-text">Official Subjects</span>
            </div>
            <div className="header-pill highlight">
              <span className="pill-num">{universityInfo.totalCredits}</span>
              <span className="pill-text">Total Credits</span>
            </div>
            <div className="header-pill">
              <span className="pill-num">{totalLHours}L-{totalTHours}T-{totalPHours}P</span>
              <span className="pill-text">Hours Breakdown</span>
            </div>
          </div>
        </div>

        <div className="heading-illustration curriculum-badge-card">
          <div className="badge-card-icon">
            <Library size={32} />
          </div>
          <span className="badge-card-title">BCA (Hons.)</span>
          <span className="badge-card-sub">Research Track</span>
        </div>
      </header>

      {/* 2. Interactive Semester Navigation Bar */}
      <section className="semester-nav-container" aria-label="Select academic semester">
        <div className="semester-tabs-wrapper">
          <div className="semester-tabs-track">
            {semestersList.map((sem) => {
              const isSelected = selectedSemester === sem.semester;
              const isEnrolled = Boolean(studentSem && sem.semester === studentSem);
              const isStudyLocked = Boolean(studentSem && sem.semester !== studentSem);
              const colorInfo = semesterColors[sem.semester];
              return (
                <button
                  type="button"
                  key={sem.semester}
                  className={`semester-nav-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSemester(sem.semester);
                    setSearchQuery('');
                  }}
                  title={isEnrolled ? `Semester ${sem.semester} (Enrolled - Study Unlocked)` : isStudyLocked ? `Semester ${sem.semester} (Syllabus Viewable - Study Locked)` : `Semester ${sem.semester}`}
                  style={
                    isSelected
                      ? {
                          borderColor: colorInfo.primary,
                          color: colorInfo.primary,
                          backgroundColor: colorInfo.light
                        }
                      : {}
                  }
                >
                  <span
                    className="tab-sem-index"
                    style={
                      isSelected
                        ? { backgroundColor: colorInfo.primary, color: '#ffffff' }
                        : {}
                    }
                  >
                    {String(sem.semester).padStart(2, '0')}
                  </span>
                  <div className="tab-sem-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong>Semester {sem.semester}</strong>
                      {isEnrolled ? (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#10b981', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          Enrolled
                        </span>
                      ) : isStudyLocked ? (
                        <span style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={9} /> View Only
                        </span>
                      ) : null}
                    </div>
                    <small>{sem.subjects.length} Subjects · {sem.credits} Credits</small>
                  </div>
                  {isSelected && <span className="tab-active-dot" style={{ backgroundColor: colorInfo.primary }} />}
                </button>
              );
            })}

            {/* All Semesters Option */}
            <button
              type="button"
              className={`semester-nav-tab all-tab ${selectedSemester === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedSemester('all');
                setSearchQuery('');
              }}
            >
              <span className="tab-sem-index all-index">All</span>
              <div className="tab-sem-info">
                <strong>All Semesters</strong>
                <small>29 Subjects Complete</small>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Selected Semester Summary Banner & Search */}
      <div className="curriculum-active-banner">
        <div className="active-banner-left">
          {activeSemesterPlan ? (
            <>
              <div className="banner-badge-row">
                <span className="banner-category-badge" style={{ color: activeColors.primaryDark, backgroundColor: activeColors.light }}>
                  {activeSemesterPlan.categoryBadge}
                </span>
                <span className="banner-credits-badge">
                  <GraduationCap size={13} />
                  <span>{activeSemesterPlan.credits} Credits</span>
                </span>
                <span className="banner-ltp-badge">
                  <Clock size={13} />
                  <span>L: {activeSemesterPlan.l} | T: {activeSemesterPlan.t} | P: {activeSemesterPlan.p} hrs</span>
                </span>
              </div>
              <h2 className="banner-title">{activeSemesterPlan.title}</h2>
              <p className="banner-subtitle">{activeSemesterPlan.subtitle}</p>
            </>
          ) : (
            <>
              <div className="banner-badge-row">
                <span className="banner-category-badge">Complete 6-Semester Curriculum</span>
                <span className="banner-credits-badge">{totalCreditsAccumulated} Total Credits</span>
              </div>
              <h2 className="banner-title">All Programme Subjects (Semesters 1 to 6)</h2>
              <p className="banner-subtitle">
                Complete catalog of 29 foundational computing, modern engineering, systems architecture, and research capstone subjects.
              </p>
            </>
          )}
        </div>

        <div className="active-banner-search">
          <div className="curriculum-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search subjects, codes, topics (e.g. 0610311011, React, AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter subjects"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>
          <span className="search-result-count">
            Showing {displayedSubjects.length} of {selectedSemester === 'all' ? allSubjects.length : activeSemesterPlan?.subjects.length || 0} subjects
          </span>
        </div>
      </div>

      {/* 4. Subject Cards Grid */}
      <section className="curriculum-subjects-section" aria-label="Course subjects">
        {displayedSubjects.length > 0 ? (
          <div className="curriculum-subjects-grid">
            {displayedSubjects.map((subject, index) => {
              const semNumber = subject.semester || (typeof selectedSemester === 'number' ? selectedSemester : 1);
              const isEnrolledSem = !studentSem || Number(semNumber) === studentSem;
              const colorTheme = semesterColors[semNumber] || semesterColors[1];
              const nature = subject.nature || subject.category;
              const l = subject.l ?? subject.hours?.l ?? 0;
              const t = subject.t ?? subject.hours?.t ?? 0;
              const p = subject.p ?? subject.hours?.p ?? 0;
              const credits = subject.credits || 4;

              return (
                <article
                  key={subject.id || subject.code || index}
                  className="curriculum-subject-card"
                  style={{
                    '--card-theme-primary': colorTheme.primary,
                    '--card-theme-light': colorTheme.light
                  }}
                >
                  <div className="curriculum-card-header">
                    <div
                      className="curriculum-icon-box"
                      style={{
                        backgroundColor: colorTheme.light,
                        color: colorTheme.primary
                      }}
                    >
                      <SubjectIcon iconName={subject.iconName} name={subject.iconName} size={22} />
                    </div>

                    <div className="curriculum-card-tags">
                      {subject.code && (
                        <span className="card-tag-code" title="Official Course Code">
                          <Hash size={11} />
                          {subject.code}
                        </span>
                      )}
                      {nature && (
                        <span className="card-tag-nature" title="Nature of Course">
                          {nature}
                        </span>
                      )}
                      {(selectedSemester === 'all' || !isEnrolledSem) && (
                        <span className="card-tag-sem">
                          Sem {semNumber}
                        </span>
                      )}
                      {studentSem && (
                        isEnrolledSem ? (
                          <span
                            className="card-tag-enrolled"
                            title="Your enrolled semester. Study access is enabled."
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <CheckCircle2 size={10} /> Enrolled
                          </span>
                        ) : (
                          <span
                            className="card-tag-locked"
                            title={`Study is locked. You are enrolled in Semester ${studentSem}.`}
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 600,
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Lock size={10} /> Locked for Study
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="curriculum-card-body">
                    <h3 className="card-subject-name">{subject.name}</h3>
                    <p className="card-subject-desc">{subject.description}</p>
                  </div>

                  {/* Course Structure (L-T-P & Credits) */}
                  <div className="curriculum-card-meta-bar">
                    <div className="ltp-metric-item" title="Lecture (L), Tutorial (T), Practical (P) hours per week">
                      <span className="ltp-dim-label">L-T-P:</span>
                      <span className="ltp-dim-val">{l}-{t}-{p}</span>
                    </div>
                    <div className="credits-metric-item">
                      <GraduationCap size={13} />
                      <span>{credits} Credits</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="curriculum-card-actions">
                    <button
                      type="button"
                      className="button button-secondary button-small card-btn-details"
                      onClick={() => handleOpenDetails(subject, semNumber)}
                    >
                      <FileText size={14} />
                      <span>View Details</span>
                    </button>
                    {isEnrolledSem ? (
                      <button
                        type="button"
                        className="button button-primary button-small card-btn-learn"
                        onClick={() => handleLearnAction(subject, semNumber)}
                        title="Explore lessons and study modules"
                      >
                        <span>Study</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-secondary button-small card-btn-locked"
                        disabled
                        style={{
                          opacity: 0.65,
                          cursor: 'not-allowed',
                          backgroundColor: 'rgba(51, 65, 85, 0.45)',
                          borderColor: 'rgba(148, 163, 184, 0.25)',
                          color: '#94a3b8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title={`Study modules are unlocked for your enrolled semester (Semester ${studentSem}).`}
                      >
                        <Lock size={12} />
                        <span>Locked (Sem {studentSem} Only)</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={searchQuery ? 'No subjects matched your filter' : 'No subjects available'}
            detail={searchQuery ? `No subjects in this selection match "${searchQuery}". Try a different keyword or course code.` : 'Subjects will appear once loaded.'}
            action={
              searchQuery && (
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )
            }
          />
        )}
      </section>

      {/* 5. Semester Credit Summary Table & Visual Breakdown */}
      <section className="curriculum-credits-summary-section" aria-label="Semester Credit Summary">
        <div className="section-title-wrap">
          <div className="section-eyebrow">
            <Award size={14} />
            <span>Official Academic Scheme</span>
          </div>
          <h2>Semester Credit Distribution & Teaching Scheme</h2>
          <p>
            Official NEP 2020 aligned credit matrix for the 4-Year B.C.A. (Hons. with Research) programme.
          </p>
        </div>

        {/* Visual summary metrics */}
        <div className="credit-summary-metric-cards">
          <div className="summary-stat-box primary">
            <span className="stat-label">Total Credits</span>
            <strong className="stat-number">{totalCreditsAccumulated}</strong>
            <span className="stat-sub">Across 6 Semesters (22 Credits / Sem)</span>
          </div>
          <div className="summary-stat-box">
            <span className="stat-label">Lecture Hours (L)</span>
            <strong className="stat-number">{totalLHours}</strong>
            <span className="stat-sub">Theoretical Instruction</span>
          </div>
          <div className="summary-stat-box">
            <span className="stat-label">Tutorial Hours (T)</span>
            <strong className="stat-number">{totalTHours}</strong>
            <span className="stat-sub">Guided Problem Solving</span>
          </div>
          <div className="summary-stat-box accent">
            <span className="stat-label">Practical / Lab (P)</span>
            <strong className="stat-number">{totalPHours}</strong>
            <span className="stat-sub">Hands-On Labs & Internships</span>
          </div>
        </div>

        {/* Official Credit Table */}
        <div className="official-credit-table-card">
          <div className="table-responsive">
            <table className="credit-summary-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Core Focus & Course Allocations</th>
                  <th className="text-center">Subjects</th>
                  <th className="text-center">Lecture (L)</th>
                  <th className="text-center">Tutorial (T)</th>
                  <th className="text-center">Practical (P)</th>
                  <th className="text-center">Total Credits</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {semesterCreditSummary.map((semRow) => {
                  const plan = semestersList.find((s) => s.semester === semRow.semester);
                  const isCurrent = selectedSemester === semRow.semester;
                  return (
                    <tr key={semRow.semester} className={isCurrent ? 'row-active' : ''}>
                      <td>
                        <strong className="sem-row-title">Semester {semRow.semester}</strong>
                      </td>
                      <td>
                        <span className="sem-row-desc">{plan?.subtitle || plan?.title}</span>
                      </td>
                      <td className="text-center">
                        <span className="table-chip">{semRow.coursesCount}</span>
                      </td>
                      <td className="text-center font-mono">{semRow.l}</td>
                      <td className="text-center font-mono">{semRow.t}</td>
                      <td className="text-center font-mono">{semRow.p}</td>
                      <td className="text-center font-bold text-primary">
                        <span className="table-credit-badge">{semRow.credits}</span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => {
                            setSelectedSemester(semRow.semester);
                            window.scrollTo({ top: 320, behavior: 'smooth' });
                          }}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="table-total-row">
                  <td colSpan={2}>
                    <strong>Total Programme Credits (Semesters 1 – 6)</strong>
                  </td>
                  <td className="text-center">
                    <strong>29 Courses</strong>
                  </td>
                  <td className="text-center font-mono">
                    <strong>{totalLHours}</strong>
                  </td>
                  <td className="text-center font-mono">
                    <strong>{totalTHours}</strong>
                  </td>
                  <td className="text-center font-mono">
                    <strong>{totalPHours}</strong>
                  </td>
                  <td className="text-center font-bold text-primary">
                    <span className="table-credit-badge total">{totalCreditsAccumulated}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Programme Outcomes (PO1 to PO8) */}
      <section className="curriculum-po-section" aria-label="Programme Outcomes">
        <div className="section-title-wrap">
          <div className="section-eyebrow">
            <Compass size={14} />
            <span>Graduate Attributes</span>
          </div>
          <h2>Programme Outcomes (POs)</h2>
          <p>
            Upon successful completion of the B.C.A. (Hons. with Research) programme, graduates will possess the following core capabilities and professional attributes:
          </p>
        </div>

        <div className="programme-outcomes-grid">
          {programmeOutcomes.map((po) => (
            <article key={po.code} className="po-card">
              <header className="po-card-header">
                <span className="po-code-badge">{po.code}</span>
                <h3 className="po-title">{po.title}</h3>
              </header>
              <p className="po-description">{po.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Detailed Subject Modal (Sections A - F) */}
      {modalSubject && (
        <SubjectModal
          subject={modalSubject}
          semester={modalSubject.semester || selectedSemester}
          colors={semesterColors[modalSubject.semester || selectedSemester] || semesterColors[1]}
          onClose={() => setModalSubject(null)}
        />
      )}
    </div>
  );
}
