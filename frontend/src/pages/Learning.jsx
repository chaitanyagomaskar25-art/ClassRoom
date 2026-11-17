import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, CirclePlay, Clock3, GraduationCap, ListChecks } from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { idOf, listFrom, nameOf } from '../utils/format.js';

export default function Learning() {
  const [searchParams] = useSearchParams();
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState(searchParams.get('semester') || '');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(searchParams.get('subject') || '');
  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [completeIds, setCompleteIds] = useState(new Set());
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [lessonDetailLoading, setLessonDetailLoading] = useState(false);
  const [lessonDetailError, setLessonDetailError] = useState('');

  const loadSemesters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = listFrom(unwrap(await api.get('/semesters')), 'semesters');
      setSemesters(items);
      if (!semesterId && items.length) setSemesterId(idOf(items[0]));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [semesterId]);

  const loadSubjects = useCallback(async () => {
    if (!semesterId) { setSubjects([]); return; }
    setDetailLoading(true);
    setDetailError('');
    try {
      const items = listFrom(unwrap(await api.get(`/semesters/${semesterId}/subjects`)), 'subjects');
      setSubjects(items);
      if (!subjectId || !items.some((item) => idOf(item) === subjectId)) setSubjectId(idOf(items[0]) || '');
    } catch (requestError) {
      setDetailError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  }, [semesterId, subjectId]);

  const loadTopics = useCallback(async () => {
    if (!subjectId) { setTopics([]); return; }
    setDetailLoading(true);
    setDetailError('');
    try {
      const items = listFrom(unwrap(await api.get(`/subjects/${subjectId}/topics`)), 'topics');
      setTopics(items);
      if (!items.some((item) => idOf(item) === topicId)) setTopicId(idOf(items[0]) || '');
    } catch (requestError) {
      setDetailError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  }, [subjectId, topicId]);

  const loadLessons = useCallback(async () => {
    if (!topicId) { setLessons([]); return; }
    setDetailLoading(true);
    setDetailError('');
    try {
      const items = listFrom(unwrap(await api.get(`/topics/${topicId}/lessons`)), 'lessons');
      setLessons(items);
      const done = items.filter((lesson) => lesson.completed || lesson.isCompleted || lesson.progress?.status === 'completed').map(idOf);
      setCompleteIds((previous) => new Set([...previous, ...done]));
    } catch (requestError) {
      setDetailError(getErrorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  }, [topicId]);

  useEffect(() => { loadSemesters(); }, [loadSemesters]);
  useEffect(() => { loadSubjects(); }, [loadSubjects]);
  useEffect(() => { loadTopics(); }, [loadTopics]);
  useEffect(() => { loadLessons(); }, [loadLessons]);

  async function markComplete(lesson) {
    const lessonId = idOf(lesson);
    setSavingId(lessonId);
    setMessage('');
    try {
      await api.post(`/progress/lessons/${lessonId}/complete`);
      setCompleteIds((previous) => new Set(previous).add(lessonId));
      setMessage('Lesson marked complete. Nice work!');
    } catch (requestError) {
      setDetailError(getErrorMessage(requestError));
    } finally {
      setSavingId('');
    }
  }

  async function openLesson(lesson) {
    setActiveLesson(lesson);
    setLessonDetail(null);
    setLessonDetailError('');
    setLessonDetailLoading(true);
    try {
      const response = unwrap(await api.get(`/curriculum/lessons/${idOf(lesson)}`));
      setLessonDetail(response.lesson || response);
    } catch (requestError) {
      setLessonDetailError(getErrorMessage(requestError));
    } finally {
      setLessonDetailLoading(false);
    }
  }

  function closeLesson() {
    setActiveLesson(null);
    setLessonDetail(null);
    setLessonDetailError('');
  }

  const activeSubject = subjects.find((subject) => idOf(subject) === subjectId);
  const activeTopic = topics.find((topic) => idOf(topic) === topicId);

  return <div className="content-page">
    <div className="page-heading"><div><span className="eyebrow">LEARN AT YOUR OWN PACE</span><h1>My lessons</h1><p>Focus on one idea at a time. You're right where you need to be.</p></div><div className="heading-illustration mint-illustration"><BookOpen size={24} /></div></div>
    {loading ? <LoadingState label="Finding your next lesson…" /> : error ? <ErrorState message={error} onRetry={loadSemesters} /> : semesters.length === 0 ? <EmptyState title="Your first lesson is on its way" detail="Lessons will appear when your curriculum is added." /> : <>
      <section className="learning-controls panel">
        <label>Semester<select value={semesterId} onChange={(event) => { setSemesterId(event.target.value); setSubjectId(''); setTopicId(''); }}><option value="">Choose semester</option>{semesters.map((item) => <option key={idOf(item)} value={idOf(item)}>{nameOf(item)}</option>)}</select><ChevronDown size={15} /></label>
        <label>Subject<select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setTopicId(''); }}><option value="">Choose subject</option>{subjects.map((item) => <option key={idOf(item)} value={idOf(item)}>{nameOf(item)}</option>)}</select><ChevronDown size={15} /></label>
        <label>Topic<select value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="">Choose topic</option>{topics.map((item) => <option key={idOf(item)} value={idOf(item)}>{nameOf(item)}</option>)}</select><ChevronDown size={15} /></label>
      </section>
      {detailLoading ? <LoadingState label="Loading your lesson plan…" /> : detailError ? <ErrorState message={detailError} onRetry={loadLessons} /> : !subjectId ? <EmptyState title="Choose a subject to begin" detail="Pick a semester and we'll show you the subjects in your study plan." /> : !topicId ? <EmptyState title="Choose a topic to explore" detail="Your selected subject is ready. Choose a topic to find its lessons." /> : lessons.length === 0 ? <EmptyState title="More lessons are coming" detail="There aren't any lessons under this topic yet." /> : <>
        <div className="learning-path-summary"><div className="path-subject-icon"><GraduationCap size={21} /></div><div><span className="eyebrow">{nameOf(activeSubject)}</span><h2>{nameOf(activeTopic)}</h2><span>{lessons.length} lessons <i>·</i> {lessons.filter((lesson) => completeIds.has(idOf(lesson))).length} completed</span></div><div className="path-summary-progress"><strong>{Math.round(lessons.filter((lesson) => completeIds.has(idOf(lesson))).length / lessons.length * 100)}%</strong><span>TOPIC COMPLETE</span></div></div>
        {message && <div className="success-message" role="status"><CheckCircle2 size={17} />{message}</div>}
        <div className="lesson-list">{lessons.map((lesson, index) => {
          const id = idOf(lesson);
          const complete = completeIds.has(id);
          return <article className={`lesson-row ${complete ? 'lesson-done' : ''}`} key={id || index}><div className={`lesson-index ${complete ? 'done' : ''}`}>{complete ? <Check size={17} /> : String(index + 1).padStart(2, '0')}</div><div className="lesson-main"><span className="lesson-meta"><span>LESSON</span>{(lesson.duration || lesson.estimatedMinutes) && <><i>·</i><span><Clock3 size={12} /> {lesson.duration || lesson.estimatedMinutes} min</span></>}</span><h3>{nameOf(lesson)}</h3><p>{lesson.description || lesson.summary || 'A focused lesson to help you understand this topic.'}</p></div><div className="lesson-actions"><button className="button button-secondary" onClick={() => openLesson(lesson)}><CirclePlay size={15} /> Open lesson</button></div></article>;
        })}</div>
        <div className="lesson-next"><ArrowLeft size={15} /><span>Learning one step at a time is enough.</span><button onClick={() => setTopicId(topics[topics.findIndex((topic) => idOf(topic) === topicId) + 1] ? idOf(topics[topics.findIndex((topic) => idOf(topic) === topicId) + 1]) : topicId)}>Next topic <ArrowRight size={14} /></button></div>
      </>}
      {activeLesson && <div className="lesson-modal-backdrop" role="presentation" onClick={closeLesson}><section className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-dialog-title" onClick={(event) => event.stopPropagation()}><button className="text-back" onClick={closeLesson}><ArrowLeft size={15} /> Back to lessons</button>{lessonDetailLoading ? <LoadingState label="Opening your lesson…" /> : lessonDetailError ? <ErrorState message={lessonDetailError} onRetry={() => openLesson(activeLesson)} /> : lessonDetail && <><span className="eyebrow">{nameOf(activeSubject)} · LESSON</span><h2 id="lesson-dialog-title">{nameOf(lessonDetail)}</h2><p className="lesson-modal-summary">{lessonDetail.summary}</p><div className="lesson-reading">{lessonDetail.content?.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>) || <p>{lessonDetail.summary || 'Your lesson content is ready.'}</p>}</div><div className="lesson-modal-actions"><button className="button button-secondary" onClick={closeLesson}>Keep learning</button><button className="button button-primary" disabled={completeIds.has(idOf(activeLesson)) || savingId === idOf(activeLesson)} onClick={() => markComplete(activeLesson)}>{savingId === idOf(activeLesson) ? 'Saving…' : completeIds.has(idOf(activeLesson)) ? <><CheckCircle2 size={15} /> Completed</> : <><Check size={15} /> Mark lesson complete</>}</button></div></>}</section></div>}
      <div className="learning-encouragement"><ListChecks size={18} /><span><strong>Every completed lesson counts.</strong> Your progress updates as you learn.</span></div>
    </>}
  </div>;
}
