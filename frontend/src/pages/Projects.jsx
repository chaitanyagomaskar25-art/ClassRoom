import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Check,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Github,
  Globe,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { LoadingState, ErrorState, EmptyState } from '../components/ContentState.jsx';
import './Projects.css';

export default function Projects() {
  const user = useSelector((state) => state.auth.user) || {};
  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(user.role);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  // New Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Full-Stack Web',
    techStack: 'React, Node.js, Express, MongoDB, Tailwind CSS',
    githubUrl: '',
    liveDemoUrl: '',
    documentationUrl: ''
  });

  // Mentor Review Modal State
  const [reviewingProject, setReviewingProject] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '', approved: true });
  const [actionSuccess, setActionSuccess] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const res = unwrap(await api.get('/projects'));
      setProjects(res?.projects || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;
    try {
      const techArray = createForm.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await api.post('/projects', {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
        techStack: techArray,
        githubUrl: createForm.githubUrl.trim(),
        liveDemoUrl: createForm.liveDemoUrl.trim(),
        documentationUrl: createForm.documentationUrl.trim()
      });

      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        category: 'Full-Stack Web',
        techStack: 'React, Node.js, Express, MongoDB, Tailwind CSS',
        githubUrl: '',
        liveDemoUrl: '',
        documentationUrl: ''
      });
      setActionSuccess('Project launched! +50 XP awarded to your portfolio.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadProjects();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Toggle Milestone
  const handleToggleMilestone = async (projectId, milestoneId) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    const updatedMilestones = (project.milestones || []).map((m) =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date() : null }
        : m
    );

    try {
      await api.put(`/projects/${projectId}`, {
        milestones: updatedMilestones
      });
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Mentor Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingProject) return;
    try {
      await api.post(`/projects/${reviewingProject._id}/review`, reviewForm);
      setReviewingProject(null);
      setActionSuccess('Mentor evaluation and rating recorded successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
      loadProjects();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Filtering
  const filteredProjects = projects.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.techStack || []).some((t) => t.toLowerCase().includes(q));

    return matchCat && matchSearch;
  });

  const categories = [
    'all',
    'Full-Stack Web',
    'Backend System',
    'Database Architecture',
    'Mobile App',
    'AI & Machine Learning',
    'Capstone Research'
  ];

  if (loading && projects.length === 0) {
    return <LoadingState label="Loading coursework projects and lab deliverables..." />;
  }

  return (
    <div className="content-page projects-page">
      {/* 1. Hero Banner */}
      <header className="projects-hero">
        <div className="projects-hero-info">
          <h1>
            <FolderGit2 size={30} color="#e0f2fe" />
            Project-Based Learning &amp; Capstone Portfolio
          </h1>
          <p>
            Build industry-grade computing applications, manage development milestones, connect GitHub repositories, and receive faculty mentor feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={loadProjects}
            title="Refresh projects"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          {!isMentor && (
            <button
              type="button"
              className="button button-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      </header>

      {/* Action Success Alert */}
      {actionSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* 2. Controls & Categories Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="projects-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`button button-small ${categoryFilter === cat ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="mentor-form-input"
            style={{ width: '100%', paddingLeft: '32px', fontSize: '12.5px' }}
            placeholder="Search projects by tech or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <span className="project-category-tag">{project.category}</span>
                <span className={`project-status-pill ${project.status}`}>
                  {project.status?.replace('_', ' ')} ({project.completionPercent || 0}%)
                </span>
              </div>

              <strong style={{ fontSize: '17px', color: '#f8fafc' }}>{project.title}</strong>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, minHeight: '40px' }}>
                {project.description || 'Structured practical project aligned with university computing curriculum.'}
              </p>

              {/* Tech Stack */}
              <div className="tech-tags-list">
                {(project.techStack || []).map((tech, idx) => (
                  <span key={idx} className="tech-tag">{tech}</span>
                ))}
              </div>

              {/* Milestones Checklist */}
              <div className="milestones-strip">
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                  Project Milestones ({(project.milestones || []).filter((m) => m.completed).length}/{(project.milestones || []).length}):
                </span>
                {(project.milestones || []).map((m) => (
                  <div key={m.id} className={`milestone-item ${m.completed ? 'done' : ''}`}>
                    <button
                      type="button"
                      style={{
                        background: m.completed ? '#10b981' : 'transparent',
                        border: m.completed ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: !isMentor ? 'pointer' : 'default',
                        color: '#fff'
                      }}
                      onClick={() => !isMentor && handleToggleMilestone(project._id, m.id)}
                      disabled={isMentor}
                    >
                      {m.completed && <Check size={12} />}
                    </button>
                    <span style={{ textDecoration: m.completed ? 'line-through' : 'none' }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mentor Review / Evaluation Box */}
              {project.mentorReview?.reviewedAt && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="#fbbf24" />
                      Mentor Rating: {project.mentorReview.rating}/5
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      By {project.mentorReview.mentorName}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                    "{project.mentorReview.feedback || 'Approved project implementation.'}"
                  </p>
                </div>
              )}

              {/* Action Links & Buttons */}
              <div className="project-links-row">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="project-link-btn">
                    <Github size={14} />
                    <span>Source Code</span>
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="project-link-btn">
                    <Globe size={14} />
                    <span>Live Demo</span>
                  </a>
                )}

                {isMentor && (
                  <button
                    type="button"
                    className="button button-small button-primary"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => {
                      setReviewingProject(project);
                      setReviewForm({
                        rating: project.mentorReview?.rating || 5,
                        feedback: project.mentorReview?.feedback || '',
                        approved: true
                      });
                    }}
                  >
                    <span>Evaluate Project</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            <FolderGit2 size={36} style={{ margin: '0 auto 12px auto' }} />
            <h3>No Projects in this Category</h3>
            <p>Click "Create Project" to add your coursework application or capstone deliverable.</p>
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL: CREATE NEW PROJECT
          ==================================================================== */}
      {showCreateModal && (
        <div className="mentor-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="mentor-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateProject}>
              <div className="mentor-modal-header">
                <h3>Launch New Software Project</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div className="mentor-form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    required
                    className="mentor-form-input"
                    placeholder="e.g. Scalable Microservices Architecture for Smart Campus"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>Category</label>
                    <select
                      className="mentor-form-select"
                      value={createForm.category}
                      onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    >
                      <option value="Full-Stack Web">Full-Stack Web</option>
                      <option value="Backend System">Backend System</option>
                      <option value="Database Architecture">Database Architecture</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                      <option value="Capstone Research">Capstone Research</option>
                    </select>
                  </div>

                  <div className="mentor-form-group">
                    <label>Tech Stack (Comma Separated)</label>
                    <input
                      type="text"
                      className="mentor-form-input"
                      placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                      value={createForm.techStack}
                      onChange={(e) => setCreateForm({ ...createForm, techStack: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mentor-form-group">
                  <label>Project Description &amp; Scope</label>
                  <textarea
                    className="mentor-form-textarea"
                    placeholder="Describe problem statement, architectural patterns, and user capabilities..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="mentor-form-group">
                    <label>GitHub Repository URL</label>
                    <input
                      type="url"
                      className="mentor-form-input"
                      placeholder="https://github.com/username/project"
                      value={createForm.githubUrl}
                      onChange={(e) => setCreateForm({ ...createForm, githubUrl: e.target.value })}
                    />
                  </div>

                  <div className="mentor-form-group">
                    <label>Live Demo URL (Optional)</label>
                    <input
                      type="url"
                      className="mentor-form-input"
                      placeholder="https://project.vercel.app"
                      value={createForm.liveDemoUrl}
                      onChange={(e) => setCreateForm({ ...createForm, liveDemoUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Publish to Portfolio (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: MENTOR PROJECT REVIEW
          ==================================================================== */}
      {reviewingProject && (
        <div className="mentor-modal-backdrop" onClick={() => setReviewingProject(null)}>
          <div className="mentor-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitReview}>
              <div className="mentor-modal-header">
                <h3>Evaluate Project: {reviewingProject.title}</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setReviewingProject(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div className="mentor-form-group">
                  <label>Rating (1 to 5 Stars)</label>
                  <select
                    className="mentor-form-select"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding Implementation)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good / Production Grade)</option>
                    <option value={3}>⭐⭐⭐ (3 - Satisfactory / Meets Requirements)</option>
                    <option value={2}>⭐⭐ (2 - Needs Architectural Revision)</option>
                    <option value={1}>⭐ (1 - Incomplete Deliverable)</option>
                  </select>
                </div>

                <div className="mentor-form-group">
                  <label>Constructive Mentor Feedback *</label>
                  <textarea
                    required
                    className="mentor-form-textarea"
                    placeholder="Provide actionable feedback on system architecture, code quality, and testing..."
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  />
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setReviewingProject(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Record Evaluation &amp; Award XP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
