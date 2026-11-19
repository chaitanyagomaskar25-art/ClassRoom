import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, GraduationCap, Layers, Search, Sparkles, X } from 'lucide-react';
import { semestersList, semesterColors, universityInfo } from '../data/curriculumData.js';
import SubjectCard from './SubjectCard.jsx';
import SubjectModal from './SubjectModal.jsx';
import './SemesterSubjectsSection.css';

export default function SemesterSubjectsSection() {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState(null);

  const handleStudyClick = (subject, semesterNum) => {
    const sId = subject.code || subject.id || subject._id;
    navigate(`/learning/${encodeURIComponent(sId)}?semester=${encodeURIComponent(semesterNum)}&subject=${encodeURIComponent(sId)}&name=${encodeURIComponent(subject.name)}&code=${encodeURIComponent(subject.code || '')}`, {
      state: {
        semesterId: semesterNum,
        subjectId: sId,
        subjectName: subject.name,
        courseCode: subject.code,
        subject
      }
    });
  };

  useEffect(() => {
    const handleSelectSem = (e) => {
      if (e.detail) {
        setSelectedSemester(String(e.detail));
        setTimeout(() => {
          const el = document.getElementById(`semester-section-${e.detail}`) || document.getElementById('curriculum');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };
    window.addEventListener('select-semester-tab', handleSelectSem);
    return () => window.removeEventListener('select-semester-tab', handleSelectSem);
  }, []);

  // Filter semesters and subjects based on active tab and search query
  const filteredSemesters = useMemo(() => {
    return semestersList
      .map((sem) => {
        // If specific semester tab is selected and doesn't match, return null
        if (selectedSemester !== 'all' && sem.semester !== Number(selectedSemester)) {
          return null;
        }

        // Filter subjects by search query
        const query = searchQuery.trim().toLowerCase();
        if (!query) return sem;

        const matchingSubjects = sem.subjects.filter(
          (sub) =>
            sub.name.toLowerCase().includes(query) ||
            (sub.code && sub.code.toLowerCase().includes(query)) ||
            (sub.category && sub.category.toLowerCase().includes(query)) ||
            sub.description.toLowerCase().includes(query)
        );

        if (matchingSubjects.length === 0) return null;

        return {
          ...sem,
          subjects: matchingSubjects,
        };
      })
      .filter(Boolean);
  }, [selectedSemester, searchQuery]);

  const totalMatchingSubjects = useMemo(() => {
    return filteredSemesters.reduce((acc, sem) => acc + sem.subjects.length, 0);
  }, [filteredSemesters]);

  const handleTabClick = (semNum, shouldScroll = false) => {
    setSelectedSemester(semNum);
    if (shouldScroll) {
      setTimeout(() => {
        const el = document.getElementById('curriculum');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 30);
    }
  };

  const handleCardClick = (subject, semesterNum) => {
    setModalData({
      subject,
      semester: semesterNum,
      colors: semesterColors[semesterNum],
    });
  };

  return (
    <section className="semester-section-root" id="curriculum">
      <div className="semester-section-container">
        {/* Section Header */}
        <div className="semester-section-header">
          <div className="university-badge">
            <GraduationCap size={15} />
            <span>{universityInfo.institution}</span>
            <span className="badge-divider">·</span>
            <span className="badge-highlight">{universityInfo.program}</span>
          </div>

          <h2 className="semester-main-title">
            Semester-wise Academic Curriculum
          </h2>

          <p className="semester-main-description">
            Explore the complete 6-semester degree syllabus for BCA Hons. with Research.
            Each subject is structured with clear core competencies, programming logic, and practical applications.
          </p>

          {/* Quick Metrics Counter */}
          <div className="semester-quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-num">6</span>
              <span className="quick-stat-text">Semesters</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat-item">
              <span className="quick-stat-num">29</span>
              <span className="quick-stat-text">Core Subjects</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat-item">
              <span className="quick-stat-num">100%</span>
              <span className="quick-stat-text">Official Syllabus</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls: Semester Tabs & Search Filter */}
        <div className="semester-controls-bar">
          <div className="semester-tabs-container">
            {semestersList.map((sem) => {
              const colors = semesterColors[sem.semester];
              const isActive = selectedSemester === String(sem.semester);
              return (
                <button
                  key={sem.semester}
                  type="button"
                  className={`sem-nav-tab ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(String(sem.semester))}
                  style={{
                    '--tab-accent': colors.primary,
                  }}
                  aria-pressed={isActive}
                >
                  <span className="sem-dot" style={{ backgroundColor: colors.primary }} />
                  <span>Sem {sem.semester}</span>
                  <span className="sem-tab-count">{sem.subjects.length}</span>
                </button>
              );
            })}

            <button
              type="button"
              className={`sem-nav-tab all-sem-tab ${selectedSemester === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
              aria-pressed={selectedSemester === 'all'}
              title="View all 29 subjects across all 6 semesters"
            >
              <Layers size={14} style={{ marginRight: 4 }} />
              <span>All 6 Semesters</span>
              <span className="sem-tab-count">29</span>
            </button>
          </div>

          <div className="semester-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by subject, code, or topic (e.g. C++, React, AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="semester-search-input"
              aria-label="Filter subjects"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Results summary when searching */}
        {searchQuery.trim() && (
          <div className="search-results-summary">
            <span>
              Found <strong>{totalMatchingSubjects}</strong> subject{totalMatchingSubjects === 1 ? '' : 's'} matching "{searchQuery}"
            </span>
            <button className="clear-search-link" onClick={() => setSearchQuery('')}>
              Reset filter
            </button>
          </div>
        )}

        {/* No Results Fallback */}
        {filteredSemesters.length === 0 && (
          <div className="semester-empty-state">
            <div className="empty-icon-box">
              <BookOpen size={28} />
            </div>
            <h3>No matching subjects found</h3>
            <p>We couldn't find any subjects matching "{searchQuery}". Try searching for another keyword like "programming", "database", or "AI".</p>
            <button className="empty-reset-btn" onClick={() => { setSearchQuery(''); setSelectedSemester('all'); }}>
              View All 29 Subjects
            </button>
          </div>
        )}

        {/* Semester Sections Container */}
        <div className="semesters-flow-wrapper">
          {filteredSemesters.map((sem) => {
            const colors = semesterColors[sem.semester];
            return (
              <section
                key={sem.semester}
                id={`semester-section-${sem.semester}`}
                className="semester-card-section"
                style={{
                  '--semester-accent': colors.primary,
                  '--semester-light': colors.light,
                  '--semester-border': colors.border,
                }}
              >
                {/* Semester Header Box */}
                <div className="semester-header-box">
                  <div className="semester-header-left">
                    <div className="semester-badge-row">
                      <span className="semester-number-pill" style={{ backgroundColor: colors.light, color: colors.primaryDark }}>
                        <span className="pill-dot" style={{ backgroundColor: colors.primary }} />
                        Semester {sem.semester}
                      </span>
                      <span className="semester-category-pill">
                        {sem.categoryBadge}
                      </span>
                      <span className="semester-subject-count-pill">
                        {sem.subjects.length} Subjects
                      </span>
                    </div>

                    <h3 className="semester-title">
                      {sem.title}
                    </h3>

                    <p className="semester-subtitle">
                      {sem.subtitle}
                    </p>
                  </div>
                </div>

                {/* Grid of Subject Cards */}
                <div className="semester-subjects-grid">
                  {sem.subjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      semester={sem.semester}
                      colors={colors}
                      onSelect={(sub) => handleCardClick(sub, sem.semester)}
                      onStudy={(sub) => handleStudyClick(sub, sem.semester)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Semester Stepper & View All Switcher */}
        {selectedSemester !== 'all' && filteredSemesters.length > 0 && (
          <div className="semester-pagination-bar">
            <button
              type="button"
              className="sem-page-btn prev"
              disabled={Number(selectedSemester) <= 1}
              onClick={() => handleTabClick(String(Number(selectedSemester) - 1), true)}
              title={Number(selectedSemester) > 1 ? `Go to Semester ${Number(selectedSemester) - 1}` : 'First semester'}
            >
              <ArrowLeft size={16} />
              <span>Previous Semester ({Number(selectedSemester) > 1 ? `Sem ${Number(selectedSemester) - 1}` : 'Start'})</span>
            </button>

            <button
              type="button"
              className="sem-view-all-link"
              onClick={() => handleTabClick('all')}
              title="Show all 29 subjects across all 6 semesters"
            >
              <Layers size={15} />
              <span>Show All 6 Semesters (29 Subjects)</span>
            </button>

            <button
              type="button"
              className="sem-page-btn next"
              disabled={Number(selectedSemester) >= 6}
              onClick={() => handleTabClick(String(Number(selectedSemester) + 1), true)}
              title={Number(selectedSemester) < 6 ? `Go to Semester ${Number(selectedSemester) + 1}` : 'Final semester'}
            >
              <span>Next Semester ({Number(selectedSemester) < 6 ? `Sem ${Number(selectedSemester) + 1}` : 'Final'})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {selectedSemester === 'all' && filteredSemesters.length > 0 && (
          <div className="semester-pagination-bar all-mode">
            <div className="all-mode-text">
              <CheckCircle size={15} style={{ color: 'var(--color-primary, #7864c8)' }} />
              <span>Currently showing all 6 semesters (29 core subjects)</span>
            </div>
            <button
              type="button"
              className="sem-view-all-link return-single"
              onClick={() => handleTabClick('1', true)}
            >
              <span>Switch to Semester-by-Semester View (Sem 1)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalData && (
        <SubjectModal
          subject={modalData.subject}
          semester={modalData.semester}
          colors={modalData.colors}
          onClose={() => setModalData(null)}
        />
      )}
    </section>
  );
}
