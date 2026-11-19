import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Award,
  BookOpen,
  CheckCircle,
  ExternalLink,
  Flame,
  Github,
  GraduationCap,
  Layers,
  Share2,
  Sparkles,
  Star,
  UserCheck
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import './Portfolio.css';

export default function Portfolio() {
  const { studentId: paramStudentId } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  
  const targetStudentId = paramStudentId || currentUser?._id || currentUser?.id;
  const isOwnPortfolio = currentUser && (currentUser._id === targetStudentId || currentUser.id === targetStudentId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!targetStudentId) {
      setError('Please log in or provide a valid student portfolio link.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    api.get(`/career/portfolio/${targetStudentId}`)
      .then((res) => {
        if (!isMounted) return;
        const data = unwrap(res);
        setPortfolio(data?.portfolio || null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getErrorMessage(err) || 'Failed to load student portfolio.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetStudentId]);

  const handleShare = () => {
    const url = `${window.location.origin}/portfolio/${targetStudentId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast('Portfolio link copied to clipboard!');
        })
        .catch(() => {
          showToast(`Share URL: ${url}`);
        });
    } else {
      showToast(`Share URL: ${url}`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  if (loading) {
    return (
      <div className="portfolio-page">
        <div className="portfolio-loading">
          <div className="spinner"></div>
          <p>Loading verified academic portfolio…</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="portfolio-page">
        <div className="portfolio-error">
          <p>{error || 'Student portfolio not found.'}</p>
          {isOwnPortfolio ? (
            <Link to="/profile" className="btn-edit-profile-link" style={{ marginTop: '1rem' }}>
              Set up your profile
            </Link>
          ) : (
            <Link to="/dashboard" className="btn-edit-profile-link" style={{ marginTop: '1rem' }}>
              Return to Platform
            </Link>
          )}
        </div>
      </div>
    );
  }

  const { profile, academics, projects = [], certificates = [], achievements = [] } = portfolio;

  return (
    <div className="portfolio-page">
      {/* Hero Header */}
      <div className="portfolio-hero">
        <div className="portfolio-hero-top">
          <div className="portfolio-avatar-group">
            <div className="portfolio-avatar">
              {profile.avatar || profile.profilePhoto ? (
                <img src={profile.avatar || profile.profilePhoto} alt={profile.name} />
              ) : (
                <span>{profile.name?.charAt(0)?.toUpperCase() || 'S'}</span>
              )}
            </div>
            <div className="portfolio-identity">
              <h1>{profile.name}</h1>
              <div className="portfolio-degree">
                <GraduationCap size={18} />
                <span>{profile.program || 'Bachelor of Computer Applications (Hons. with Research)'}</span>
              </div>
              <div className="portfolio-institution">
                Semester {profile.semester || 1} • BCA (Hons. with Research)
              </div>
            </div>
          </div>

          <div className="portfolio-actions">
            <button className="btn-share-portfolio" onClick={handleShare}>
              <Share2 size={16} />
              <span>Share Portfolio</span>
            </button>
            {isOwnPortfolio && (
              <Link to="/profile" className="btn-edit-profile-link">
                <UserCheck size={16} />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>

        <p className="portfolio-bio">
          {profile.bio || 'Computer Applications candidate passionate about full-stack engineering, databases, and applied algorithms.'}
        </p>

        {/* Quick Academic Metrics */}
        <div className="portfolio-metrics-grid">
          <div className="portfolio-metric-card">
            <div className="metric-icon-wrap">
              <Sparkles size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Mastery Level</span>
              <span className="metric-val">Level {academics.level || 1} ({academics.rankTitle || 'Novice'})</span>
            </div>
          </div>

          <div className="portfolio-metric-card">
            <div className="metric-icon-wrap" style={{ color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)' }}>
              <Flame size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Learning Streak</span>
              <span className="metric-val">{academics.streakDays || 1} Days Active</span>
            </div>
          </div>

          <div className="portfolio-metric-card">
            <div className="metric-icon-wrap" style={{ color: '#059669', background: 'rgba(5, 150, 105, 0.1)' }}>
              <BookOpen size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Curriculum Modules</span>
              <span className="metric-val">{academics.completedLessonsCount || 0} Completed</span>
            </div>
          </div>

          <div className="portfolio-metric-card">
            <div className="metric-icon-wrap" style={{ color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)' }}>
              <Layers size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-label">Verified Projects</span>
              <span className="metric-val">{projects.length} Showcased</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <section className="portfolio-section">
        <div className="section-title">
          <Sparkles size={20} className="text-primary" />
          <span>Core Competencies & Technologies</span>
          <span className="section-badge-count">{profile.skills?.length || 0}</span>
        </div>
        <div className="skills-cloud-wrap">
          {profile.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill, idx) => (
              <span key={idx} className="skill-pill">
                {skill}
              </span>
            ))
          ) : (
            <p className="empty-state-card" style={{ width: '100%', margin: 0 }}>
              No specific technical skills highlighted yet.
            </p>
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="portfolio-section">
        <div className="section-title">
          <Layers size={20} className="text-primary" />
          <span>Featured Projects & Implementations</span>
          <span className="section-badge-count">{projects.length}</span>
        </div>

        {projects.length > 0 ? (
          <div className="portfolio-projects-grid">
            {projects.map((proj) => (
              <div key={proj._id} className="portfolio-project-card">
                <div className="proj-top-bar">
                  <span className="proj-category-tag">{proj.category || 'Software Project'}</span>
                  <span className={`proj-status-badge ${proj.status}`}>
                    {proj.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <h3 className="proj-title">{proj.title}</h3>
                <p className="proj-desc">{proj.description}</p>

                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="proj-tech-tags">
                    {proj.techStack.map((tech, i) => (
                      <span key={i} className="proj-tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="proj-progress-row">
                  <div className="proj-progress-labels">
                    <span>Progress</span>
                    <span>{proj.completionPercent || 0}%</span>
                  </div>
                  <div className="proj-progress-track">
                    <div
                      className="proj-progress-bar"
                      style={{ width: `${proj.completionPercent || 0}%` }}
                    />
                  </div>
                </div>

                {proj.mentorRating && (
                  <div className="proj-mentor-rating">
                    <Star size={14} fill="#eab308" stroke="#eab308" />
                    <span>Mentor Verified Rating: {proj.mentorRating}/5</span>
                  </div>
                )}

                <div className="proj-links-row">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proj-link-btn"
                    >
                      <Github size={14} />
                      <span>Code Repository</span>
                    </a>
                  )}
                  {proj.liveDemoUrl && (
                    <a
                      href={proj.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proj-link-btn"
                    >
                      <ExternalLink size={14} />
                      <span>Live Preview</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <p>No featured projects highlighted on portfolio yet.</p>
            {isOwnPortfolio && (
              <Link to="/projects" className="btn-share-portfolio" style={{ marginTop: '0.75rem' }}>
                Add New Project
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Two Column: Certifications & Achievements */}
      <div className="portfolio-two-col portfolio-section">
        {/* Certifications */}
        <section>
          <div className="section-title">
            <Award size={20} className="text-primary" />
            <span>Academic Certifications</span>
            <span className="section-badge-count">{certificates.length}</span>
          </div>

          <div className="certs-list">
            {certificates.length > 0 ? (
              certificates.map((cert, index) => (
                <div key={index} className="cert-card">
                  <div className="cert-icon">
                    <Award size={22} />
                  </div>
                  <div className="cert-info">
                    <h4>Course Completion: {cert.subjectName || 'BCA Core Curriculum'}</h4>
                    <div className="cert-issuer">Faculty of Computing</div>
                    <div className="cert-meta">
                      <span>Grade: {cert.grade || 'A+'}</span>
                      <span>•</span>
                      <span>{new Date(cert.issuedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-card">
                <p>Complete curriculum subjects and pass end-of-semester assessments to earn verified certificates.</p>
              </div>
            )}
          </div>
        </section>

        {/* Achievements / Badges */}
        <section>
          <div className="section-title">
            <Sparkles size={20} className="text-primary" />
            <span>Earned Achievements</span>
            <span className="section-badge-count">{achievements.length}</span>
          </div>

          <div className="badges-list">
            {achievements.length > 0 ? (
              achievements.map((item, index) => {
                const title = typeof item === 'string' ? item.replace(/_/g, ' ') : item.title || item.badgeId;
                const desc = item.description || 'Institutional achievement milestone unlocked.';
                return (
                  <div key={index} className="badge-card">
                    <div className="badge-art">
                      <Sparkles size={20} />
                    </div>
                    <div className="badge-info">
                      <h4 style={{ textTransform: 'capitalize' }}>{title}</h4>
                      <p className="badge-desc">{desc}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state-card">
                <p>Participate in quizzes, complete lessons, and code projects to unlock achievement badges.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {toastMessage && (
        <div className="portfolio-toast">
          <CheckCircle size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
