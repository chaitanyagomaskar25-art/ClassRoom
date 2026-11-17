import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Layers3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { idOf, listFrom, nameOf } from '../utils/format.js';

export default function Curriculum() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [selected, setSelected] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjectsError, setSubjectsError] = useState('');

  const loadSemesters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = listFrom(unwrap(await api.get('/semesters')), 'semesters');
      setSemesters(list);
      if (!selected && list.length) setSelected(idOf(list[0]));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const loadSubjects = useCallback(async () => {
    if (!selected) { setSubjects([]); return; }
    setSubjectsLoading(true);
    setSubjectsError('');
    try {
      setSubjects(listFrom(unwrap(await api.get(`/semesters/${selected}/subjects`)), 'subjects'));
    } catch (requestError) {
      setSubjectsError(getErrorMessage(requestError));
    } finally {
      setSubjectsLoading(false);
    }
  }, [selected]);

  useEffect(() => { loadSemesters(); }, [loadSemesters]);
  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  return <div className="content-page">
    <div className="page-heading"><div><span className="eyebrow">YOUR LEARNING MAP</span><h1>Curriculum</h1><p>Every big goal starts with a clear next step.</p></div><div className="heading-illustration"><GraduationCap size={25} /></div></div>
    {loading ? <LoadingState label="Loading your curriculum…" /> : error ? <ErrorState message={error} onRetry={loadSemesters} /> : semesters.length === 0 ? <EmptyState title="Your curriculum is taking shape" detail="Your academic semesters will appear here once they're set up." /> : <>
      <section className="curriculum-intro"><div className="curriculum-intro-icon"><Layers3 size={20} /></div><div><strong>A path built one semester at a time</strong><span>Choose a semester to discover its subjects, topics and lessons.</span></div><span className="curriculum-count">{semesters.length} SEMESTERS</span></section>
      <div className="curriculum-layout">
        <aside className="semester-selector"><span className="nav-caption">ACADEMIC PATH</span>{semesters.map((semester, index) => {
          const id = idOf(semester);
          return <button className={`semester-option ${selected === id ? 'selected' : ''}`} key={id || index} onClick={() => setSelected(id)}><span className="semester-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{nameOf(semester)}</strong><small>{semester.subjectCount ?? semester.subjects?.length ?? '—'} subjects</small></span><ChevronRight size={16} /></button>;
        })}</aside>
        <section className="subject-content">
          {subjectsLoading ? <LoadingState label="Finding your subjects…" /> : subjectsError ? <ErrorState message={subjectsError} onRetry={loadSubjects} /> : <>
            <div className="subject-heading"><div><span className="eyebrow">SEMESTER OVERVIEW</span><h2>{nameOf(semesters.find((semester) => idOf(semester) === selected))}</h2><p>{subjects.length} subjects to explore at your own pace</p></div><div className="subject-heading-icon"><BookOpen size={21} /></div></div>
            {subjects.length ? <div className="subject-grid">{subjects.map((subject, index) => {
              const topicCount = subject.topicCount ?? subject.topics?.length;
              return <article className="subject-card" key={idOf(subject) || index}><div className={`subject-card-symbol subject-symbol-${index % 4}`}><BookOpen size={19} /></div><div className="subject-card-info"><span className="subject-code">{subject.code || `SUBJECT ${String(index + 1).padStart(2, '0')}`}</span><h3>{nameOf(subject)}</h3><p>{subject.description || 'Explore topics, lessons and practice materials for this subject.'}</p></div><div className="subject-card-bottom"><span>{topicCount === undefined ? 'Topics and lessons' : `${topicCount} ${topicCount === 1 ? 'topic' : 'topics'}`}</span><button onClick={() => navigate(`/learning?semester=${encodeURIComponent(selected)}&subject=${encodeURIComponent(idOf(subject))}`)}>Explore subject <ArrowRight size={14} /></button></div></article>;
            })}</div> : <EmptyState title="No subjects have been added yet" detail="Your mentor or administrator can add subjects to this semester." />}
          </>}
        </section>
      </div>
    </>}
  </div>;
}
