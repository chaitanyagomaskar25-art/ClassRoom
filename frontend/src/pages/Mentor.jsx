import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, BookOpen, CircleAlert, GraduationCap, Search, UsersRound } from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { listFrom, percentage } from '../utils/format.js';

export default function Mentor() {
  const user = useSelector((state) => state.auth.user) || {};
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [studentsResult, analyticsResult] = await Promise.allSettled([
        api.get('/mentors/students'),
        api.get('/dashboard/mentor'),
      ]);
      if (studentsResult.status === 'rejected') throw studentsResult.reason;
      const studentData = unwrap(studentsResult.value);
      setStudents(listFrom(studentData, 'students'));
      setAnalytics(analyticsResult.status === 'fulfilled' ? unwrap(analyticsResult.value) : null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((student) => `${student.name || student.user?.name || ''} ${student.email || student.user?.email || ''} ${student.batch || ''} ${student.semester?.name || student.semester || ''}`.toLowerCase().includes(search.toLowerCase()));
  const roleTitle = String(user.role).toLowerCase() === 'admin' ? 'Student monitoring' : 'My students';
  const progressFor = (student) => percentage(student.progress?.completionPercent ?? student.overallProgress);
  const scoreFor = (student) => student.averageQuizScore;
  const isAtRisk = (student) => progressFor(student) < 40 || (scoreFor(student) != null && Number(scoreFor(student)) < 50);
  const averageProgress = students.length ? Math.round(students.reduce((sum, student) => sum + progressFor(student), 0) / students.length) : 0;
  const atRiskCount = students.filter(isAtRisk).length;

  async function openStudent(student) {
    setSelectedStudent(student);
    setStudentDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    try {
      setStudentDetails(unwrap(await api.get(`/mentors/students/${student._id || student.id}`)));
    } catch (requestError) {
      setDetailsError(getErrorMessage(requestError));
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeStudent() {
    setSelectedStudent(null);
    setStudentDetails(null);
    setDetailsError('');
  }

  return <div className="content-page">
    <div className="page-heading"><div><span className="eyebrow">GUIDANCE THAT MAKES A DIFFERENCE</span><h1>{roleTitle}</h1><p>See how your students are learning and where a little guidance could help.</p></div><div className="heading-illustration mint-illustration"><UsersRound size={24} /></div></div>
    {loading ? <LoadingState label="Loading your student list…" /> : error ? <ErrorState message={error} onRetry={load} /> : <>
      <section className="mentor-overview">
        <article className="mentor-stat-card"><span className="mentor-stat-icon lavender"><UsersRound size={18} /></span><div><span>Assigned students</span><strong>{analytics?.totalStudents ?? analytics?.studentsCount ?? analytics?.metrics?.studentCount ?? students.length}</strong></div></article>
        <article className="mentor-stat-card"><span className="mentor-stat-icon sage"><BookOpen size={18} /></span><div><span>Average progress</span><strong>{averageProgress}%</strong></div></article>
        <article className="mentor-stat-card"><span className="mentor-stat-icon peach"><CircleAlert size={18} /></span><div><span>May need support</span><strong>{analytics?.atRiskStudents ?? atRiskCount}</strong></div></article>
      </section>
      <section className="panel student-table-panel">
        <div className="student-table-heading"><div><span className="eyebrow">YOUR GUIDANCE MATTERS</span><h2>Student overview <span className="table-count">{students.length}</span></h2><p>Student information is limited to your assigned students.</p></div><label className="student-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your students" aria-label="Search students" /></label></div>
        {filtered.length ? <div className="student-table-scroll"><table className="student-table"><thead><tr><th>STUDENT</th><th>SEMESTER</th><th>LESSONS</th><th>QUIZ AVG.</th><th>PROGRESS</th><th>DETAILS</th></tr></thead><tbody>{filtered.map((student, index) => {
          const person = student.user || student;
          const initials = (person.name || 'Student').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
          const progress = progressFor(student);
          const score = scoreFor(student);
          const atRisk = isAtRisk(student);
          const semesterLabel = typeof student.semester === 'number' ? `Semester ${student.semester}` : student.semester?.name || student.semester?.title || student.semesterName || student.semester || '—';
          return <tr key={student._id || student.id || index}><td><div className="student-cell"><span className={`avatar student-avatar avatar-tone-${index % 4}`}>{initials}</span><span><strong>{person.name || 'Student'}</strong><small>{person.email || '—'}</small></span></div></td><td>{semesterLabel}</td><td>{student.progress?.completedLessons ?? student.completedLessons ?? '—'}{student.progress?.totalLessons ? ` / ${student.progress.totalLessons}` : ''}</td><td>{score ?? '—'}{score != null ? '%' : ''}</td><td><div className="table-progress"><span className="table-progress-track"><i style={{ width: `${progress}%` }} /></span><strong>{progress}%</strong>{atRisk && <span className="risk-pill">Check in</span>}</div></td><td><button className="table-detail-button" onClick={() => openStudent(student)}>View <ArrowRight size={13} /></button></td></tr>;
        })}</tbody></table></div> : <EmptyState title={search ? 'No students match that search' : 'Your student list is ready when you are'} detail={search ? 'Try a different name or semester.' : 'Students assigned to you will appear here, along with their learning progress.'} />}
      </section>
      <div className="mentor-note"><GraduationCap size={19} /><span><strong>Good mentorship starts with listening.</strong> Use these insights as a starting point for a conversation, not a label.</span><ArrowRight size={16} /></div>
      {selectedStudent && <div className="lesson-modal-backdrop" role="presentation" onClick={closeStudent}><section className="lesson-modal student-detail-modal" role="dialog" aria-modal="true" aria-labelledby="student-detail-title" onClick={(event) => event.stopPropagation()}><button className="text-back" onClick={closeStudent}>← Back to students</button>{detailsLoading ? <LoadingState label="Loading the student’s progress…" /> : detailsError ? <ErrorState message={detailsError} onRetry={() => openStudent(selectedStudent)} /> : studentDetails && <><span className="eyebrow">ASSIGNED STUDENT</span><h2 id="student-detail-title">{studentDetails.student?.name || selectedStudent.name}</h2><p className="lesson-modal-summary">{studentDetails.student?.email || selectedStudent.email} · {studentDetails.student?.semester ? `Semester ${studentDetails.student.semester}` : 'BCA'}</p><div className="student-detail-metrics"><div><span>Overall progress</span><strong>{percentage(studentDetails.metrics?.completionPercent)}%</strong></div><div><span>Lessons complete</span><strong>{studentDetails.metrics?.completedLessons ?? 0} / {studentDetails.metrics?.totalLessons ?? 0}</strong></div><div><span>Quiz average</span><strong>{studentDetails.metrics?.averageQuizScore == null ? '—' : `${studentDetails.metrics.averageQuizScore}%`}</strong></div></div><h3 className="student-detail-subheading">Recent learning</h3>{listFrom(studentDetails.progress, 'progress').length ? <div className="student-detail-list">{listFrom(studentDetails.progress, 'progress').slice(0, 5).map((item, index) => <div key={item._id || index}><span>{item.lessonId?.title || 'Lesson activity'}</span><small>{item.status === 'completed' ? 'Completed' : 'In progress'}</small></div>)}</div> : <p className="lesson-modal-summary">No lesson activity has been recorded yet.</p>}</>}</section></div>}
    </>}
  </div>;
}
