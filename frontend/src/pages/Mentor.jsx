import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  ShieldCheck,
  X,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { allSubjects, semestersList } from '../data/curriculumData.js';
import { listFrom, percentage } from '../utils/format.js';
import './Mentor.css';

export default function Mentor() {
  const user = useSelector((state) => state.auth.user) || {};
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'at_risk' | 'assignments' | 'quizzes' | 'communication'

  // Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);
  const [mentorSearch, setMentorSearch] = useState('');

  // Filtering State for Student Monitoring
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterProgress, setFilterProgress] = useState('all');
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  // Selected Student Modal State (Module 18 Analytics)
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // Assignment Modals
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectCode: allSubjects[0]?.code || '',
    subjectName: allSubjects[0]?.name || '',
    topic: '',
    instructions: '',
    targetSemester: 1,
    targetBatch: '',
    totalMarks: 25,
    dueDate: ''
  });
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState(null);
  const [gradingForm, setGradingForm] = useState({ submissionId: '', marksObtained: '', feedback: '' });

  // Quiz Modals
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    semester: 1,
    subjectCode: allSubjects[0]?.code || '',
    subjectName: allSubjects[0]?.name || '',
    unit: 'Unit 1',
    topic: '',
    difficulty: 'medium',
    durationMinutes: 20,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: '',
        type: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        marks: 2
      }
    ]
  });
  const [selectedQuizSubmissions, setSelectedQuizSubmissions] = useState(null);

  // Communication State
  const [directMessageRecipient, setDirectMessageRecipient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    targetSemester: 1,
    targetBatch: '',
    subject: '',
    content: '',
    priority: 'normal'
  });

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // AI Mentor Analytics Assistant (Item 37)
  const [aiAnalyticsData, setAiAnalyticsData] = useState(null);
  const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState(false);
  const [aiAnalyticsError, setAiAnalyticsError] = useState('');
  const [aiGeneratingQuestions, setAiGeneratingQuestions] = useState(false);
  const [interventionFeedback, setInterventionFeedback] = useState('');

  const clearFeedback = () => {
    setActionSuccess('');
    setActionError('');
  };

  // 1. Initial Load
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const [dashRes, studentsRes, asgRes, quizRes, broadRes] = await Promise.allSettled([
        api.get('/mentors/dashboard'),
        api.get('/mentors/students'),
        api.get('/assignments'),
        api.get('/mentor/quizzes'),
        api.get('/communication/broadcasts')
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboardData(unwrap(dashRes.value));
      }
      if (studentsRes.status === 'fulfilled') {
        setStudents(unwrap(studentsRes.value)?.students || []);
      }
      if (asgRes.status === 'fulfilled') {
        setAssignments(unwrap(asgRes.value)?.assignments || []);
      }
      if (quizRes.status === 'fulfilled') {
        setQuizzes(unwrap(quizRes.value)?.quizzes || []);
      }
      if (broadRes.status === 'fulfilled') {
        setBroadcasts(unwrap(broadRes.value)?.broadcasts || []);
      }
      if (['scrum', 'admin', 'super_admin'].includes(user.role)) {
        try {
          const teamRes = await api.get('/mentor/team');
          setMentorsList(unwrap(teamRes)?.mentors || []);
        } catch {}
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAiAnalytics = useCallback(async () => {
    setAiAnalyticsLoading(true);
    setAiAnalyticsError('');
    try {
      const res = await api.get('/ai/mentor-analytics');
      const data = unwrap(res);
      setAiAnalyticsData(data);
    } catch (err) {
      setAiAnalyticsError(getErrorMessage(err) || 'Failed to load AI cohort analytics.');
    } finally {
      setAiAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'ai_analytics' && !aiAnalyticsData) {
      loadAiAnalytics();
    }
  }, [activeTab, aiAnalyticsData, loadAiAnalytics]);

  const handleApplyIntervention = async (intervention) => {
    try {
      const targetIds = intervention.type === 'send_checkin_message'
        ? (aiAnalyticsData?.inactiveStudents || []).map((s) => s.studentId)
        : [];

      const res = await api.post('/ai/mentor-interventions/apply', {
        interventionId: intervention.id,
        actionType: intervention.type,
        studentIds: targetIds,
        customMessage: intervention.draftMessage
      });
      const data = unwrap(res);
      setInterventionFeedback(data?.feedback || 'Intervention executed successfully.');
      setTimeout(() => setInterventionFeedback(''), 4500);
    } catch (err) {
      alert(getErrorMessage(err) || 'Failed to apply intervention.');
    }
  };

  const handleGenerateAiQuizForReview = async () => {
    setAiGeneratingQuestions(true);
    try {
      const res = await api.post('/ai/quizzes/generate-for-review', {
        semester: quizForm.semester,
        subjectCode: quizForm.subjectCode,
        topic: quizForm.topic || 'all',
        difficulty: quizForm.difficulty,
        questionCount: 5
      });
      const data = unwrap(res);
      if (data && data.questions && data.questions.length > 0) {
        setQuizForm((prev) => ({
          ...prev,
          title: prev.title || data.title,
          questions: data.questions
        }));
        setActionSuccess('AI generated 5 syllabus-grounded questions. You can now review and edit them below before publishing!');
        setTimeout(clearFeedback, 5000);
      }
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Failed to generate quiz questions with AI.');
      setTimeout(clearFeedback, 4000);
    } finally {
      setAiGeneratingQuestions(false);
    }
  };

  // 2. Open Individual Student Analytics Profile
  const openStudentAnalytics = async (studentId) => {
    setSelectedStudentId(studentId);
    setStudentDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    try {
      const res = unwrap(await api.get(`/mentors/students/${studentId}`));
      setStudentDetails(res);
    } catch (err) {
      setDetailsError(getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };

  // 3. Open Direct Message Drawer
  const openDirectMessage = async (student) => {
    setDirectMessageRecipient(student);
    setChatMessages([]);
    setChatLoading(true);
    try {
      const res = unwrap(await api.get(`/communication/messages/${student._id || student.id}`));
      setChatMessages(res?.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // 4. Send Direct Message
  const handleSendDirectMessage = async () => {
    if (!chatInput.trim() || !directMessageRecipient) return;
    try {
      const payload = {
        recipientId: directMessageRecipient._id || directMessageRecipient.id,
        content: chatInput.trim(),
        scope: 'direct'
      };
      const res = unwrap(await api.post('/communication/messages', payload));
      if (res?.message) {
        setChatMessages((prev) => [...prev, res.message]);
      }
      setChatInput('');
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // 5. Send Broadcast Announcement
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    clearFeedback();
    try {
      await api.post('/communication/messages', {
        scope: 'semester',
        targetSemester: Number(broadcastForm.targetSemester),
        targetBatch: broadcastForm.targetBatch,
        subject: broadcastForm.subject,
        content: broadcastForm.content,
        priority: broadcastForm.priority
      });
      setShowBroadcastModal(false);
      setBroadcastForm({
        targetSemester: 1,
        targetBatch: '',
        subject: '',
        content: '',
        priority: 'normal'
      });
      setActionSuccess('Cohort announcement published successfully!');
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // 6. Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    clearFeedback();
    try {
      await api.post('/assignments', {
        ...assignmentForm,
        targetSemester: Number(assignmentForm.targetSemester),
        totalMarks: Number(assignmentForm.totalMarks)
      });
      setShowCreateAssignmentModal(false);
      setActionSuccess('Assignment successfully created and published!');
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // 7. Grade Submission
  const handleGradeSubmission = async (assignmentId) => {
    if (!gradingForm.submissionId || gradingForm.marksObtained === '') return;
    clearFeedback();
    try {
      await api.post(`/assignments/${assignmentId}/grade/${gradingForm.submissionId}`, {
        marksObtained: Number(gradingForm.marksObtained),
        feedback: gradingForm.feedback,
        status: 'graded'
      });
      setActionSuccess('Submission evaluated and feedback recorded!');
      setSelectedAssignmentForReview(null);
      setGradingForm({ submissionId: '', marksObtained: '', feedback: '' });
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // 8. Create Quiz Question Actions
  const handleAddQuestion = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: `q${prev.questions.length + 1}`,
          text: '',
          type: 'mcq',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          marks: 2
        }
      ]
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    clearFeedback();
    try {
      await api.post('/mentor/quizzes', {
        ...quizForm,
        semester: Number(quizForm.semester),
        durationMinutes: Number(quizForm.durationMinutes),
        isPublished: true
      });
      setShowCreateQuizModal(false);
      setActionSuccess('Custom quiz created and published to students!');
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleToggleQuizPublish = async (quizId) => {
    clearFeedback();
    try {
      const res = unwrap(await api.post(`/mentor/quizzes/${quizId}/publish`, {}));
      setActionSuccess(res?.message || 'Quiz publish status updated');
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const openQuizSubmissions = async (quizId) => {
    try {
      const res = unwrap(await api.get(`/mentor/quizzes/${quizId}/submissions`));
      setSelectedQuizSubmissions(res);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  // Student Monitoring Filtering Logic
  const filteredStudents = students.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.enrollmentNumber?.toLowerCase().includes(q);

    const matchSem = filterSemester === 'all' || String(s.semester) === filterSemester;
    const matchBatch = filterBatch === 'all' || s.batch === filterBatch;
    const matchSection = filterSection === 'all' || s.section === filterSection;

    let matchProgress = true;
    const p = s.progress?.completionPercent || 0;
    if (filterProgress === '<25') matchProgress = p < 25;
    else if (filterProgress === '25-50') matchProgress = p >= 25 && p < 50;
    else if (filterProgress === '50-75') matchProgress = p >= 50 && p < 75;
    else if (filterProgress === '>75') matchProgress = p >= 75;

    let matchQuiz = true;
    const score = s.averageQuizScore;
    if (filterQuiz === 'low') matchQuiz = score != null && score < 60;
    else if (filterQuiz === 'average') matchQuiz = score != null && score >= 60 && score < 80;
    else if (filterQuiz === 'high') matchQuiz = score != null && score >= 80;

    let matchRisk = true;
    if (filterRisk === 'critical') matchRisk = s.riskAssessment?.level === 'critical';
    else if (filterRisk === 'moderate') matchRisk = s.riskAssessment?.level === 'moderate';
    else if (filterRisk === 'on_track') matchRisk = s.riskAssessment?.level === 'on_track';

    return matchSearch && matchSem && matchBatch && matchSection && matchProgress && matchQuiz && matchRisk;
  });

  const atRiskStudents = students.filter(
    (s) => s.riskAssessment?.level === 'critical' || s.riskAssessment?.level === 'moderate'
  );

  const metrics = dashboardData?.metrics || {};

  if (loading && !dashboardData) {
    return <LoadingState message="Loading mentor workspace, assigned students, and cohort analytics..." />;
  }

  return (
    <div className="content-page mentor-container">
      {/* 1. Header Banner */}
      <header className="mentor-header">
        <div className="mentor-header-info">
          <div className="mentor-scope-badge">
            <Sparkles size={13} />
            <span>{dashboardData?.scope?.replace('_', ' ') || 'Cohort Mentorship'}</span>
          </div>
          <h1>
            <GraduationCap size={26} color="#818cf8" />
            Mentor &amp; Student Success Dashboard
          </h1>
          <p>
            Welcome, {user.name}. Monitor assigned students, identify learning risks, manage assignments &amp; quizzes, and maintain open communication.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={loadData}
            title="Refresh cohort data"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setShowBroadcastModal(true)}
          >
            <Send size={15} />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </header>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button onClick={clearFeedback} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <nav className="mentor-tabs-nav" aria-label="Mentor views">
        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>Student Monitoring</span>
          <span className="mentor-tab-badge">{students.length}</span>
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'at_risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('at_risk')}
        >
          <AlertTriangle size={16} />
          <span>At-Risk Students</span>
          {metrics.criticalRiskCount > 0 && (
            <span className="mentor-tab-badge danger">{metrics.criticalRiskCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileText size={16} />
          <span>Assignments</span>
          {metrics.pendingReviewCount > 0 && (
            <span className="mentor-tab-badge" style={{ background: '#f59e0b' }}>{metrics.pendingReviewCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <Award size={16} />
          <span>Mentor Quizzes</span>
          <span className="mentor-tab-badge">{quizzes.length}</span>
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'communication' ? 'active' : ''}`}
          onClick={() => setActiveTab('communication')}
        >
          <MessageSquare size={16} />
          <span>Communications</span>
        </button>

        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'ai_analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai_analytics')}
          style={{ borderColor: activeTab === 'ai_analytics' ? '#7c3aed' : undefined }}
        >
          <Sparkles size={16} style={{ color: '#7c3aed' }} />
          <span>AI Mentor Assistant</span>
        </button>

        {(user.role === 'scrum' || user.role === 'admin' || user.role === 'super_admin') && (
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentors')}
            style={{ borderColor: activeTab === 'mentors' ? '#6366f1' : undefined }}
          >
            <ShieldCheck size={16} style={{ color: '#6366f1' }} />
            <span>Mentors Directory</span>
            <span className="mentor-tab-badge" style={{ background: '#6366f1' }}>{mentorsList.length}</span>
          </button>
        )}
      </nav>

      {/* ====================================================================
          
          TAB 1: OVERVIEW DASHBOARD (Item 16)
          ==================================================================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Summary Grid */}
          <div className="mentor-kpi-grid">
            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Assigned Students</span>
                <div className="mentor-kpi-icon indigo"><Users size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{metrics.assignedStudentsCount || students.length}</div>
              <div className="mentor-kpi-subtext">Active enrolled mentees</div>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Cohort Progress Avg</span>
                <div className="mentor-kpi-icon emerald"><Zap size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{metrics.averageProgressPercent || 0}%</div>
              <div className="mentor-kpi-subtext">Across syllabus lessons</div>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Quiz Score Average</span>
                <div className="mentor-kpi-icon amber"><Trophy size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{metrics.averageQuizScore != null ? `${metrics.averageQuizScore}%` : '—'}</div>
              <div className="mentor-kpi-subtext">{metrics.totalQuizAttempts || 0} total attempts</div>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Attention Needed</span>
                <div className="mentor-kpi-icon rose"><AlertTriangle size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{metrics.criticalRiskCount || 0}</div>
              <div className="mentor-kpi-subtext">{metrics.moderateRiskCount || 0} moderate concern</div>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Pending Reviews</span>
                <div className="mentor-kpi-icon sky"><Clock size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{metrics.pendingReviewCount || 0}</div>
              <div className="mentor-kpi-subtext">Submissions to evaluate</div>
            </div>
          </div>

          {/* Semester-Wise Progress Breakdown */}
          <section className="mentor-section-card">
            <div className="mentor-section-header">
              <h2>
                <BookOpen size={18} color="#818cf8" />
                Semester-Wise Curriculum Momentum
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Program Semesters 1–6</span>
            </div>

            <div className="mentor-semester-grid">
              {(dashboardData?.semesterWiseProgress || []).map((sem) => (
                <div key={sem.semester} className="mentor-sem-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mentor-sem-title">Semester {sem.semester}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sem.studentCount} students</span>
                  </div>
                  <div className="mentor-sem-progress-bar">
                    <div className="mentor-sem-progress-fill" style={{ width: `${sem.averageProgress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
                    <span>Avg Progress: <strong>{sem.averageProgress}%</strong></span>
                    <span>Quiz: <strong>{sem.averageQuizScore != null ? `${sem.averageQuizScore}%` : '—'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Split Row: Students Requiring Immediate Attention & Submissions Needing Review */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* At-Risk Quick Widget */}
            <section className="mentor-section-card">
              <div className="mentor-section-header">
                <h2 style={{ color: '#f87171' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  Students Requiring Attention ({metrics.criticalRiskCount + metrics.moderateRiskCount})
                </h2>
                <button
                  type="button"
                  className="button button-small button-secondary"
                  onClick={() => setActiveTab('at_risk')}
                >
                  View All
                </button>
              </div>

              {(dashboardData?.studentsRequiringAttention || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(dashboardData.studentsRequiringAttention || []).slice(0, 5).map((student) => (
                    <div
                      key={student._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>
                          {student.name}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: '#f87171' }}>
                          {student.risk?.reasons?.[0] || 'Flagged for attention'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="button button-small button-secondary"
                          onClick={() => openStudentAnalytics(student._id)}
                          title="Open analytics profile"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          className="button button-small button-primary"
                          onClick={() => openDirectMessage(student)}
                          title="Direct message"
                        >
                          <Mail size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  <CheckCircle2 size={24} style={{ color: '#10b981', margin: '0 auto 8px auto' }} />
                  <span>All assigned mentees are in good academic standing!</span>
                </div>
              )}
            </section>

            {/* Submissions Needing Review */}
            <section className="mentor-section-card">
              <div className="mentor-section-header">
                <h2>
                  <FileText size={18} color="#38bdf8" />
                  Submissions Needing Review ({metrics.pendingReviewCount})
                </h2>
                <button
                  type="button"
                  className="button button-small button-secondary"
                  onClick={() => setActiveTab('assignments')}
                >
                  Assignments
                </button>
              </div>

              {(dashboardData?.submissionsNeedingReview || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(dashboardData.submissionsNeedingReview || []).map((sub) => (
                    <div
                      key={sub.submissionId}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>
                          {sub.studentName}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {sub.assignmentTitle} · {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="button button-small button-primary"
                        onClick={() => {
                          const asg = assignments.find((a) => a._id === sub.assignmentId);
                          setSelectedAssignmentForReview(asg || { _id: sub.assignmentId, title: sub.assignmentTitle, submissions: [] });
                          setGradingForm({ submissionId: sub.submissionId, marksObtained: '', feedback: '' });
                        }}
                      >
                        Grade
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  <CheckCircle2 size={24} style={{ color: '#10b981', margin: '0 auto 8px auto' }} />
                  <span>No submissions currently waiting for review.</span>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 2: STUDENT MONITORING (Item 17)
          ==================================================================== */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Controls Toolbar */}
          <div className="mentor-filter-bar">
            <div className="mentor-search-box">
              <Search size={15} className="mentor-search-icon" />
              <input
                type="text"
                placeholder="Search students by name, email, or enrollment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mentor-filter-group">
              <select
                className="mentor-select"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                aria-label="Filter semester"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={String(s)}>Semester {s}</option>
                ))}
              </select>

              <select
                className="mentor-select"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                aria-label="Filter batch"
              >
                <option value="all">All Batches</option>
                <option value="current">Current Cohort</option>
              </select>

              <select
                className="mentor-select"
                value={filterProgress}
                onChange={(e) => setFilterProgress(e.target.value)}
                aria-label="Filter progress range"
              >
                <option value="all">All Progress</option>
                <option value="<25">&lt; 25% (Critical)</option>
                <option value="25-50">25% – 50%</option>
                <option value="50-75">50% – 75%</option>
                <option value=">75">&gt; 75% (Advanced)</option>
              </select>

              <select
                className="mentor-select"
                value={filterQuiz}
                onChange={(e) => setFilterQuiz(e.target.value)}
                aria-label="Filter quiz performance"
              >
                <option value="all">All Quiz Scores</option>
                <option value="low">Low (&lt; 60%)</option>
                <option value="average">Average (60–80%)</option>
                <option value="high">High (&gt; 80%)</option>
              </select>

              <select
                className="mentor-select"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                aria-label="Filter attention level"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical Risk</option>
                <option value="moderate">Moderate Concern</option>
                <option value="on_track">On Track</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="mentor-students-table-wrap">
            <table className="mentor-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Academic Term</th>
                  <th>Curriculum Progress</th>
                  <th>Quiz Performance</th>
                  <th>Inactivity</th>
                  <th>Risk Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const risk = student.riskAssessment || { level: 'on_track' };
                    return (
                      <tr key={student._id || student.id}>
                        <td>
                          <div className="student-meta-cell">
                            <div className="student-avatar">
                              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="student-name-block">
                              <strong>{student.name}</strong>
                              <span>{student.enrollmentNumber || student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px' }}>
                            <strong>Semester {student.semester || 1}</strong>
                            <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8' }}>
                              {student.batch ? `Batch ${student.batch} · ` : ''}Sec {student.section || 'A'}
                            </span>
                          </div>
                        </td>
                        <td style={{ minWidth: '160px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span>{student.progress?.completedLessons || 0} Lessons</span>
                            <strong>{student.progress?.completionPercent || 0}%</strong>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${student.progress?.completionPercent || 0}%`,
                                background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                borderRadius: '999px'
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          {student.averageQuizScore != null ? (
                            <span style={{
                              fontWeight: 700,
                              color: student.averageQuizScore >= 70 ? '#10b981' : '#f87171'
                            }}>
                              {student.averageQuizScore}% ({student.quizAttempts || 0} tests)
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>No attempts</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: student.daysInactive > 7 ? '#f87171' : '#94a3b8' }}>
                            {student.daysInactive === 0 ? 'Active today' : `${student.daysInactive}d ago`}
                          </span>
                        </td>
                        <td>
                          <span className={`risk-badge ${risk.level}`}>
                            {risk.level.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="button button-small button-secondary"
                              onClick={() => openStudentAnalytics(student._id || student.id)}
                              title="Full Profile & Analytics"
                            >
                              <Eye size={13} />
                              <span>Analytics</span>
                            </button>
                            <button
                              type="button"
                              className="button button-small button-primary"
                              onClick={() => openDirectMessage(student)}
                              title="Direct Message"
                            >
                              <Mail size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No students match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 3: AT-RISK STUDENT DETECTION (Item 19)
          ==================================================================== */}
      {activeTab === 'at_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#f87171' }}>
                Algorithmic Risk Detection Engine Active
              </strong>
              <span style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                Students are evaluated continuously based on syllabus progress &lt;20%, quiz averages &lt;60%, repeated assessment failures, prolonged inactivity &gt;7 days, and overdue deliverables.
              </span>
            </div>
          </div>

          <div className="at-risk-grid">
            {atRiskStudents.length > 0 ? (
              atRiskStudents.map((student) => {
                const risk = student.riskAssessment || {};
                return (
                  <div key={student._id || student.id} className={`at-risk-card ${risk.level}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '15px', color: '#f8fafc', display: 'block' }}>
                          {student.name}
                        </strong>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Semester {student.semester || 1} · {student.email}
                        </span>
                      </div>
                      <span className={`risk-badge ${risk.level}`}>
                        {risk.level}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.15)', padding: '8px 12px', borderRadius: '8px' }}>
                      <div>Progress: <strong>{student.progress?.completionPercent || 0}%</strong></div>
                      <div>Quiz Avg: <strong>{student.averageQuizScore != null ? `${student.averageQuizScore}%` : '—'}</strong></div>
                      <div>Inactive: <strong>{student.daysInactive || 0} days</strong></div>
                      <div>Overdue: <strong>{student.overdueAssignmentsCount || 0}</strong></div>
                    </div>

                    {/* Explanations why flagged */}
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Why Flagged ({risk.reasons?.length || 0}):
                      </span>
                      <div className="at-risk-reasons-list">
                        {(risk.reasons || ['Low engagement flagged']).map((reason, idx) => (
                          <div key={idx} className="at-risk-reason-item">
                            <AlertCircle size={12} />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                      <button
                        type="button"
                        className="button button-small button-secondary"
                        style={{ flex: 1 }}
                        onClick={() => openStudentAnalytics(student._id || student.id)}
                      >
                        <Eye size={12} />
                        <span>Analytics Profile</span>
                      </button>
                      <button
                        type="button"
                        className="button button-small button-primary"
                        style={{ flex: 1 }}
                        onClick={() => openDirectMessage(student)}
                      >
                        <Mail size={12} />
                        <span>Contact Mentee</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                <h3>No At-Risk Students Detected</h3>
                <p>Every student is actively making progress and meeting academic benchmarks.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 4: MENTOR ASSIGNMENTS (Item 20)
          ==================================================================== */}
      {activeTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Mentor Coursework Assignments</h2>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Create assignments, evaluate student submissions, and award marks.</span>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setShowCreateAssignmentModal(true)}
            >
              <Plus size={15} />
              <span>Create Assignment</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {assignments.length > 0 ? (
              assignments.map((asg) => (
                <div key={asg._id} className="mentor-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {asg.subjectName} · Sem {asg.targetSemester || 1}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                      {asg.totalMarks} Marks
                    </span>
                  </div>

                  <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{asg.title}</strong>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, minHeight: '36px' }}>
                    {asg.description || asg.instructions || 'No special instructions.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span>Due: <strong>{new Date(asg.dueDate).toLocaleDateString()}</strong></span>
                    <span>Submissions: <strong>{(asg.submissions || []).length}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="button button-small button-primary"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedAssignmentForReview(asg);
                        setGradingForm({ submissionId: '', marksObtained: '', feedback: '' });
                      }}
                    >
                      <FileText size={13} />
                      <span>Review Submissions ({(asg.submissions || []).length})</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <FileText size={32} style={{ margin: '0 auto 12px auto' }} />
                <h3>No Assignments Created Yet</h3>
                <p>Click "Create Assignment" to assign practical lab work or theory problems to your students.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 5: MENTOR QUIZZES (Item 21)
          ==================================================================== */}
      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Mentor Assessment Quizzes</h2>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Design customized diagnostic quizzes, configure difficulty, and publish to students.</span>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setShowCreateQuizModal(true)}
            >
              <Plus size={15} />
              <span>Create Custom Quiz</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz._id} className="mentor-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      {quiz.subjectName} · Sem {quiz.semester}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: quiz.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.1)',
                      color: quiz.isPublished ? '#10b981' : '#94a3b8'
                    }}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{quiz.title}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                    <span>Questions: <strong>{quiz.questionCount || quiz.questions?.length || 0}</strong></span>
                    <span>Duration: <strong>{quiz.durationMinutes || 20} mins</strong></span>
                    <span>Difficulty: <strong style={{ textTransform: 'capitalize' }}>{quiz.difficulty}</strong></span>
                    <span>Attempts: <strong>{quiz.attemptsCount || 0}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <button
                      type="button"
                      className="button button-small button-secondary"
                      style={{ flex: 1 }}
                      onClick={() => handleToggleQuizPublish(quiz._id)}
                    >
                      {quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="button button-small button-primary"
                      style={{ flex: 1 }}
                      onClick={() => openQuizSubmissions(quiz._id)}
                    >
                      <span>Attempts ({quiz.attemptsCount || 0})</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <Award size={32} style={{ margin: '0 auto 12px auto' }} />
                <h3>No Mentor Quizzes Yet</h3>
                <p>Click "Create Custom Quiz" to author questions and assign them to your students.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 6: COMMUNICATIONS (Item 22)
          ==================================================================== */}
      {activeTab === 'communication' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Mentor &amp; Cohort Communications</h2>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Reach individual students or broadcast notices across entire semesters and batches.</span>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setShowBroadcastModal(true)}
            >
              <Send size={15} />
              <span>Broadcast Announcement</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Quick Direct Message Students List */}
            <div className="mentor-section-card">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc' }}>Direct Message Mentees</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                {students.map((student) => (
                  <div
                    key={student._id || student.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>{student.name}</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Semester {student.semester} · {student.email}</span>
                    </div>
                    <button
                      type="button"
                      className="button button-small button-secondary"
                      onClick={() => openDirectMessage(student)}
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast Notices Stream */}
            <div className="mentor-section-card">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc' }}>Recent Broadcast Notices</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {broadcasts.length > 0 ? (
                  broadcasts.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                          Semester {b.targetSemester || 'All'} · {b.scope}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <strong style={{ fontSize: '13.5px', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
                        {b.subject || 'Cohort Announcement'}
                      </strong>
                      <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0 }}>
                        {b.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <Mail size={24} style={{ margin: '0 auto 8px auto' }} />
                    <span>No broadcasts sent yet.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          TAB 7: AI MENTOR COHORT ANALYTICS & INTERVENTIONS (Item 37)
          ==================================================================== */}
      {activeTab === 'ai_analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#a855f7' }} />
                <span>AI Mentor Analytics Assistant</span>
              </h2>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Cohort-level diagnostics to support, not replace, your mentoring decisions.
              </span>
            </div>
            <button
              type="button"
              className="button button-secondary"
              onClick={loadAiAnalytics}
              disabled={aiAnalyticsLoading}
            >
              <RefreshCw size={14} className={aiAnalyticsLoading ? 'spin' : ''} />
              <span>Refresh AI Analysis</span>
            </button>
          </div>

          {interventionFeedback && (
            <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '13px' }}>
              ✓ {interventionFeedback}
            </div>
          )}

          {aiAnalyticsLoading ? (
            <LoadingState message="Analyzing authorized student records, quiz logs, and learning timelines..." />
          ) : aiAnalyticsError ? (
            <ErrorState message={aiAnalyticsError} onRetry={loadAiAnalytics} />
          ) : aiAnalyticsData ? (
            <>
              {/* AI Diagnostic Metrics */}
              <div className="mentor-kpi-grid">
                <div className="mentor-kpi-card">
                  <div className="mentor-kpi-header">
                    <span className="mentor-kpi-label">Cohort Size</span>
                    <div className="mentor-kpi-icon indigo"><Users size={18} /></div>
                  </div>
                  <div className="mentor-kpi-value">{aiAnalyticsData.cohortSize}</div>
                  <span className="mentor-kpi-sub">Authorized Mentees</span>
                </div>

                <div className="mentor-kpi-card">
                  <div className="mentor-kpi-header">
                    <span className="mentor-kpi-label">Inactive Students</span>
                    <div className="mentor-kpi-icon amber"><Clock size={18} /></div>
                  </div>
                  <div className="mentor-kpi-value" style={{ color: '#fbbf24' }}>
                    {aiAnalyticsData.inactiveCount}
                  </div>
                  <span className="mentor-kpi-sub">&gt; 5 days without activity</span>
                </div>

                <div className="mentor-kpi-card">
                  <div className="mentor-kpi-header">
                    <span className="mentor-kpi-label">Repeated Quiz Failures</span>
                    <div className="mentor-kpi-icon rose"><AlertTriangle size={18} /></div>
                  </div>
                  <div className="mentor-kpi-value" style={{ color: '#f87171' }}>
                    {aiAnalyticsData.repeatedFailuresCount}
                  </div>
                  <span className="mentor-kpi-sub">2+ failed assessments</span>
                </div>
              </div>

              {/* AI Suggested Interventions */}
              <div className="mentor-section-card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#a855f7' }} />
                  <span>Actionable Mentor Interventions (AI Supported)</span>
                </h3>

                {aiAnalyticsData.suggestedInterventions?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                    {aiAnalyticsData.suggestedInterventions.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(168, 85, 247, 0.2)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: item.priority === 'high' ? '#f87171' : '#fbbf24' }}>
                            {item.priority} Priority
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Recommendation</span>
                        </div>

                        <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{item.title}</strong>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1' }}>{item.description}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#818cf8', fontWeight: 600 }}>
                          Action: {item.recommendedAction}
                        </p>

                        <button
                          type="button"
                          className="button button-small button-primary"
                          style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                          onClick={() => handleApplyIntervention(item)}
                        >
                          <Send size={13} />
                          <span>Apply Intervention</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                    No urgent interventions required. The cohort is currently performing consistently on-track.
                  </p>
                )}
              </div>

              {/* Common Weak Subjects Table */}
              <div className="mentor-section-card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc' }}>
                  Common Weak Topics Across Authorized Cohort
                </h3>
                {aiAnalyticsData.commonWeakSubjects?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="mentor-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Topic</th>
                          <th>Cohort Failures</th>
                          <th>Cohort Impact</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiAnalyticsData.commonWeakSubjects.map((w, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{w.subjectName}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>{w.subjectCode}</span>
                            </td>
                            <td>{w.topic}</td>
                            <td style={{ color: '#f87171', fontWeight: 700 }}>{w.cohortFailuresCount}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${w.percentCohortAffected}%`, height: '100%', background: '#ef4444' }} />
                                </div>
                                <span>{w.percentCohortAffected}%</span>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="button button-small button-secondary"
                                onClick={() => {
                                  setQuizForm((prev) => ({
                                    ...prev,
                                    subjectCode: w.subjectCode,
                                    topic: w.topic
                                  }));
                                  setShowCreateQuizModal(true);
                                }}
                              >
                                Create Practice Quiz
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                    No widespread conceptual weakness detected across current attempts.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ====================================================================
          
          MODAL: INDIVIDUAL STUDENT ANALYTICS (Item 18)
          ==================================================================== */}
      {selectedStudentId && (
        <div className="mentor-modal-backdrop" onClick={() => setSelectedStudentId(null)}>
          <div className="mentor-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mentor-modal-header">
              <h3>Student Comprehensive Academic Profile</h3>
              <button
                type="button"
                className="button-icon"
                onClick={() => setSelectedStudentId(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mentor-modal-body">
              {detailsLoading ? (
                <LoadingState message="Loading student records, subject breakdown, and quiz analytics..." />
              ) : detailsError ? (
                <ErrorState message={detailsError} />
              ) : studentDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Student Bio Strip */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                    <div className="student-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                      {studentDetails.student?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{studentDetails.student?.name}</strong>
                      <span style={{ display: 'block', fontSize: '12.5px', color: '#94a3b8' }}>
                        Enrollment: {studentDetails.student?.enrollmentNumber || 'N/A'} · Semester {studentDetails.student?.semester} · Batch {studentDetails.student?.batch} · Sec {studentDetails.student?.section}
                      </span>
                      <span style={{ fontSize: '12px', color: '#818cf8' }}>{studentDetails.student?.email}</span>
                    </div>
                    <span className={`risk-badge ${studentDetails.riskAssessment?.level || 'on_track'}`} style={{ marginLeft: 'auto' }}>
                      {studentDetails.riskAssessment?.level}
                    </span>
                  </div>

                  {/* Why Flagged (if at risk) */}
                  {studentDetails.riskAssessment?.needsAttention && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 16px' }}>
                      <strong style={{ fontSize: '12.5px', color: '#f87171', display: 'block', marginBottom: '6px' }}>
                        Attention Flags ({studentDetails.riskAssessment.reasons?.length}):
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#cbd5e1' }}>
                        {(studentDetails.riskAssessment.reasons || []).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Progress & Quiz Metrics Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Curriculum Progress</span>
                      <strong style={{ display: 'block', fontSize: '18px', color: '#818cf8' }}>
                        {studentDetails.progress?.completionPercent || 0}%
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Completed Lessons</span>
                      <strong style={{ display: 'block', fontSize: '18px', color: '#10b981' }}>
                        {studentDetails.progress?.completedLessons || 0}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quiz Average</span>
                      <strong style={{ display: 'block', fontSize: '18px', color: '#f59e0b' }}>
                        {studentDetails.quizMetrics?.averageQuizScore != null ? `${studentDetails.quizMetrics.averageQuizScore}%` : '—'}
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quizzes Attempted</span>
                      <strong style={{ display: 'block', fontSize: '18px', color: '#38bdf8' }}>
                        {studentDetails.quizMetrics?.totalAttempts || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Subject-Wise Performance in Enrolled Semester */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f8fafc' }}>
                      Semester {studentDetails.student?.semester} Subject Performance
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(studentDetails.subjectWisePerformance || []).map((sub) => (
                        <div
                          key={sub.code}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{sub.name}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                              Code: {sub.code} · {sub.credits} Credits · {sub.nature}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: 700 }}>
                              {sub.completedLessons} / {sub.totalLessons} Lessons ({sub.progressPercent}%)
                            </span>
                            <span style={{ display: 'block', fontSize: '11px', color: sub.averageQuizScore >= 70 ? '#10b981' : '#f87171' }}>
                              Quiz Avg: {sub.averageQuizScore != null ? `${sub.averageQuizScore}%` : 'None'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', color: '#34d399', display: 'block', marginBottom: '6px' }}>Strong Topics:</strong>
                      {(studentDetails.strengthsAndWeaknesses?.strongTopics || []).length > 0 ? (
                        studentDetails.strengthsAndWeaknesses.strongTopics.map((t, idx) => (
                          <span key={idx} style={{ display: 'inline-block', fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', margin: '2px' }}>
                            {t.topic} ({t.averageScore}%)
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Consistent scores observed.</span>
                      )}
                    </div>

                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '12px', color: '#f87171', display: 'block', marginBottom: '6px' }}>Weak Topics (Needs Revision):</strong>
                      {(studentDetails.strengthsAndWeaknesses?.weakTopics || []).length > 0 ? (
                        studentDetails.strengthsAndWeaknesses.weakTopics.map((t, idx) => (
                          <span key={idx} style={{ display: 'inline-block', fontSize: '11px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', margin: '2px' }}>
                            {t.topic} ({t.averageScore}%)
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>No severe deficiencies detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Quiz History Table */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#f8fafc' }}>Recent Quiz History</h4>
                    {(studentDetails.quizMetrics?.recentAttempts || []).length > 0 ? (
                      <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        <table className="mentor-table" style={{ fontSize: '12px' }}>
                          <thead>
                            <tr>
                              <th>Quiz</th>
                              <th>Score</th>
                              <th>Result</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentDetails.quizMetrics.recentAttempts.map((att, i) => (
                              <tr key={att._id || i}>
                                <td>{att.lessonTitle || att.topic || 'Quiz Attempt'}</td>
                                <td><strong>{att.score}%</strong></td>
                                <td>
                                  <span style={{ color: att.passed ? '#10b981' : '#f87171', fontWeight: 600 }}>
                                    {att.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </td>
                                <td>{new Date(att.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>No quizzes recorded.</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mentor-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedStudentId(null)}
              >
                Close
              </button>
              {studentDetails?.student && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    const st = studentDetails.student;
                    setSelectedStudentId(null);
                    openDirectMessage(st);
                  }}
                >
                  <Mail size={14} />
                  <span>Send Direct Message</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: DIRECT MESSAGING DRAWER (Item 22)
          ==================================================================== */}
      {directMessageRecipient && (
        <div className="mentor-modal-backdrop" onClick={() => setDirectMessageRecipient(null)}>
          <div className="mentor-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="mentor-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Message with {directMessageRecipient.name}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{directMessageRecipient.email}</span>
              </div>
              <button
                type="button"
                className="button-icon"
                onClick={() => setDirectMessageRecipient(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mentor-modal-body" style={{ padding: '16px 20px' }}>
              <div className="chat-messages-container">
                {chatLoading ? (
                  <LoadingState message="Loading chat conversation..." />
                ) : chatMessages.length > 0 ? (
                  chatMessages.map((msg) => {
                    const isMe = String(msg.senderId) === String(user.id || user._id);
                    return (
                      <div key={msg._id} className={`chat-bubble ${isMe ? 'sent' : 'received'}`}>
                        <span>{msg.content}</span>
                        <span className="chat-timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <span>Start a conversation with {directMessageRecipient.name}.</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  className="mentor-form-input"
                  style={{ flex: 1 }}
                  placeholder="Type an advisory message or encouragement..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendDirectMessage();
                  }}
                />
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleSendDirectMessage}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: CREATE ASSIGNMENT (Item 20)
          ==================================================================== */}
      {showCreateAssignmentModal && (
        <div className="mentor-modal-backdrop" onClick={() => setShowCreateAssignmentModal(false)}>
          <div className="mentor-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateAssignment}>
              <div className="mentor-modal-header">
                <h3>Create New Coursework Assignment</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setShowCreateAssignmentModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div className="mentor-form-group">
                  <label>Assignment Title *</label>
                  <input
                    type="text"
                    required
                    className="mentor-form-input"
                    placeholder="e.g. Practical Lab 2: Binary Search Trees Implementation"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Target Semester *</label>
                    <select
                      className="mentor-form-select"
                      value={assignmentForm.targetSemester}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, targetSemester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mentor-form-group">
                    <label>Subject *</label>
                    <select
                      className="mentor-form-select"
                      value={assignmentForm.subjectCode}
                      onChange={(e) => {
                        const selected = allSubjects.find((s) => s.code === e.target.value);
                        setAssignmentForm({
                          ...assignmentForm,
                          subjectCode: e.target.value,
                          subjectName: selected ? selected.name : assignmentForm.subjectName
                        });
                      }}
                    >
                      {allSubjects.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Total Marks</label>
                    <input
                      type="number"
                      min="1"
                      className="mentor-form-input"
                      value={assignmentForm.totalMarks}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: Number(e.target.value) })}
                    />
                  </div>

                  <div className="mentor-form-group">
                    <label>Submission Deadline *</label>
                    <input
                      type="date"
                      required
                      className="mentor-form-input"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mentor-form-group">
                  <label>Topic / Unit</label>
                  <input
                    type="text"
                    className="mentor-form-input"
                    placeholder="e.g. Unit 2: Non-Linear Data Structures"
                    value={assignmentForm.topic}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, topic: e.target.value })}
                  />
                </div>

                <div className="mentor-form-group">
                  <label>Instructions &amp; Requirements</label>
                  <textarea
                    className="mentor-form-textarea"
                    placeholder="Detail the problem statement, deliverables, and submission guidelines..."
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowCreateAssignmentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: SUBMISSIONS REVIEW & GRADING (Item 20)
          ==================================================================== */}
      {selectedAssignmentForReview && (
        <div className="mentor-modal-backdrop" onClick={() => setSelectedAssignmentForReview(null)}>
          <div className="mentor-modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="mentor-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Review Submissions: {selectedAssignmentForReview.title}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {selectedAssignmentForReview.subjectName} · Max Marks: {selectedAssignmentForReview.totalMarks}
                </span>
              </div>
              <button
                type="button"
                className="button-icon"
                onClick={() => setSelectedAssignmentForReview(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mentor-modal-body">
              {(selectedAssignmentForReview.submissions || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(selectedAssignmentForReview.submissions || []).map((sub) => (
                    <div
                      key={sub._id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{sub.studentName}</strong>
                          <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8' }}>
                            Submitted on {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                          background: sub.status === 'graded' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: sub.status === 'graded' ? '#10b981' : '#f59e0b'
                        }}>
                          {sub.status}: {sub.marksObtained != null ? `${sub.marksObtained}/${selectedAssignmentForReview.totalMarks}` : 'Pending'}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                        {sub.content || 'No text content provided.'}
                        {sub.attachmentUrl && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={sub.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span>View Attached Project / Code</span>
                              <ArrowRight size={12} />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Grading Form for this submission */}
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                        <input
                          type="number"
                          placeholder="Marks"
                          min="0"
                          max={selectedAssignmentForReview.totalMarks}
                          className="mentor-form-input"
                          style={{ padding: '6px 10px', fontSize: '12.5px' }}
                          value={gradingForm.submissionId === sub._id ? gradingForm.marksObtained : (sub.marksObtained || '')}
                          onChange={(e) => setGradingForm({ ...gradingForm, submissionId: sub._id, marksObtained: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Feedback comment..."
                          className="mentor-form-input"
                          style={{ padding: '6px 10px', fontSize: '12.5px' }}
                          value={gradingForm.submissionId === sub._id ? gradingForm.feedback : (sub.feedback || '')}
                          onChange={(e) => setGradingForm({ ...gradingForm, submissionId: sub._id, feedback: e.target.value })}
                        />
                        <button
                          type="button"
                          className="button button-small button-primary"
                          onClick={() => {
                            if (gradingForm.submissionId !== sub._id) {
                              setGradingForm({ submissionId: sub._id, marksObtained: sub.marksObtained || '', feedback: sub.feedback || '' });
                            }
                            handleGradeSubmission(selectedAssignmentForReview._id);
                          }}
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  <FileText size={28} style={{ margin: '0 auto 8px auto' }} />
                  <span>No submissions received for this assignment yet.</span>
                </div>
              )}
            </div>

            <div className="mentor-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedAssignmentForReview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: CREATE CUSTOM QUIZ (Item 21)
          ==================================================================== */}
      {showCreateQuizModal && (
        <div className="mentor-modal-backdrop" onClick={() => setShowCreateQuizModal(false)}>
          <div className="mentor-modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateQuiz}>
              <div className="mentor-modal-header">
                <h3>Author Custom Mentor Quiz</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setShowCreateQuizModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div className="mentor-form-group">
                  <label>Quiz Title *</label>
                  <input
                    type="text"
                    required
                    className="mentor-form-input"
                    placeholder="e.g. Operating Systems Unit 2: Process Scheduling Diagnostic"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Semester *</label>
                    <select
                      className="mentor-form-select"
                      value={quizForm.semester}
                      onChange={(e) => setQuizForm({ ...quizForm, semester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mentor-form-group">
                    <label>Subject *</label>
                    <select
                      className="mentor-form-select"
                      value={quizForm.subjectCode}
                      onChange={(e) => {
                        const selected = allSubjects.find((s) => s.code === e.target.value);
                        setQuizForm({
                          ...quizForm,
                          subjectCode: e.target.value,
                          subjectName: selected ? selected.name : quizForm.subjectName
                        });
                      }}
                    >
                      {allSubjects.map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mentor-form-group">
                    <label>Difficulty</label>
                    <select
                      className="mentor-form-select"
                      value={quizForm.difficulty}
                      onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Duration (Minutes)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      className="mentor-form-input"
                      value={quizForm.durationMinutes}
                      onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                    />
                  </div>

                  <div className="mentor-form-group">
                    <label>Passing Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="mentor-form-input"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Question Builder */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '12px 16px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} />
                      AI Question Generator
                    </strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                      Auto-generate syllabus questions, then review and edit them below before publishing.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button button-small button-primary"
                    disabled={aiGeneratingQuestions}
                    onClick={handleGenerateAiQuizForReview}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Sparkles size={13} />
                    <span>{aiGeneratingQuestions ? 'Generating…' : 'Generate with AI'}</span>
                  </button>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#f8fafc' }}>
                      Questions ({quizForm.questions.length})
                    </h4>
                    <button
                      type="button"
                      className="button button-small button-secondary"
                      onClick={handleAddQuestion}
                    >
                      <Plus size={12} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quizForm.questions.map((q, qIndex) => (
                      <div
                        key={q.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          padding: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
                            Question {qIndex + 1}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {q.marks || 1} mark(s)
                          </span>
                        </div>

                        <input
                          type="text"
                          required
                          className="mentor-form-input"
                          style={{ marginBottom: '8px' }}
                          placeholder="Question text..."
                          value={q.text}
                          onChange={(e) => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].text = e.target.value;
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                        />

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={Number(q.correctAnswer) === optIndex}
                                onChange={() => {
                                  const updated = [...quizForm.questions];
                                  updated[qIndex].correctAnswer = optIndex;
                                  setQuizForm({ ...quizForm, questions: updated });
                                }}
                              />
                              <input
                                type="text"
                                required
                                className="mentor-form-input"
                                style={{ padding: '6px 10px', fontSize: '12px', flex: 1 }}
                                placeholder={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...quizForm.questions];
                                  updated[qIndex].options[optIndex] = e.target.value;
                                  setQuizForm({ ...quizForm, questions: updated });
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        <input
                          type="text"
                          className="mentor-form-input"
                          placeholder="Explanation for correct answer..."
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].explanation = e.target.value;
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowCreateQuizModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Publish Quiz to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: QUIZ SUBMISSIONS / ATTEMPTS (Item 21)
          ==================================================================== */}
      {selectedQuizSubmissions && (
        <div className="mentor-modal-backdrop" onClick={() => setSelectedQuizSubmissions(null)}>
          <div className="mentor-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="mentor-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Quiz Results: {selectedQuizSubmissions.quiz?.title}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {selectedQuizSubmissions.attemptsCount} student attempt(s) recorded
                </span>
              </div>
              <button
                type="button"
                className="button-icon"
                onClick={() => setSelectedQuizSubmissions(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mentor-modal-body">
              {(selectedQuizSubmissions.attempts || []).length > 0 ? (
                <table className="mentor-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Result</th>
                      <th>Time</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuizSubmissions.attempts.map((att) => (
                      <tr key={att._id}>
                        <td>
                          <strong>{att.studentId?.name || 'Student'}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>
                            {att.studentId?.enrollmentNumber || att.studentId?.email}
                          </span>
                        </td>
                        <td><strong>{att.score}%</strong></td>
                        <td>
                          <span style={{ color: att.passed ? '#10b981' : '#f87171', fontWeight: 600 }}>
                            {att.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td>{att.timeTakenSeconds ? `${att.timeTakenSeconds}s` : '—'}</td>
                        <td>{new Date(att.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  <Award size={28} style={{ margin: '0 auto 8px auto' }} />
                  <span>No student attempts recorded for this quiz yet.</span>
                </div>
              )}
            </div>

            <div className="mentor-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedQuizSubmissions(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          
          MODAL: BROADCAST COHORT ANNOUNCEMENT (Item 22)
          ==================================================================== */}
      {showBroadcastModal && (
        <div className="mentor-modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
          <div className="mentor-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSendBroadcast}>
              <div className="mentor-modal-header">
                <h3>Broadcast Cohort Notice</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Target Semester *</label>
                    <select
                      className="mentor-form-select"
                      value={broadcastForm.targetSemester}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, targetSemester: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mentor-form-group">
                    <label>Priority</label>
                    <select
                      className="mentor-form-select"
                      value={broadcastForm.priority}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mentor-form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    required
                    className="mentor-form-input"
                    placeholder="e.g. Midterm Laboratory Schedule & Project Deliverables"
                    value={broadcastForm.subject}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  />
                </div>

                <div className="mentor-form-group">
                  <label>Notice Content *</label>
                  <textarea
                    required
                    className="mentor-form-textarea"
                    placeholder="Enter the announcement message to broadcast to all students..."
                    value={broadcastForm.content}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                  />
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <Send size={14} />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
