import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  FileCheck2,
  Flame,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Users2,
  X
} from 'lucide-react';
import SemesterSubjectsSection from '../components/SemesterSubjectsSection.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import './LandingPage.css';

export default function LandingPage() {
  const { token } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Smooth scroll handler
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSemester = (e, semNumber) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('select-semester-tab', { detail: semNumber }));
    const element = document.getElementById(`semester-section-${semNumber}`) || document.getElementById('curriculum');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'Is this curriculum official for Eternal University BCA students?',
      a: 'Yes! The semester-wise subjects, course codes, and descriptions strictly follow the official BCA Hons. with Research syllabus from Eternal University, covering Semesters 1 through 6.'
    },
    {
      q: 'How do I explore individual subject modules and topics?',
      a: 'Click on any subject card in the curriculum section to open its overview modal with key learning modules, or click "Explore in Curriculum" to access full study resources and quizzes.'
    },
    {
      q: 'Is the platform completely free for enrolled students?',
      a: 'Yes, the learning platform is completely open and free for students and mentors to follow semester roadmaps, read bite-sized lesson notes, and take self-assessment quizzes.'
    },
    {
      q: 'How do self-assessment quizzes help with university exams?',
      a: 'Each unit includes targeted multiple-choice quizzes that provide immediate grading, explanation breakdowns, and score histories so you can identify weak areas before exam day.'
    },
    {
      q: 'Can faculty and mentors monitor cohort performance?',
      a: 'Yes, faculty mentors have a dedicated dashboard to view batch progress percentages, quiz mastery averages, and provide personalized academic interventions.'
    }
  ];

  return (
    <div className="landing-wrapper" id="home">
      {/* Ambient Glows */}
      <div className="landing-ambient-orbs" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      {/* Modern Navbar */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-mark">C</span>
            <span>classroom</span>
            <span className="landing-brand-badge">BCA Hons.</span>
          </Link>

          <nav className="landing-nav-links" aria-label="Main Navigation">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="landing-nav-link">
              Home
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="landing-nav-link">
              About
            </a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="landing-nav-link">
              Features
            </a>
            <a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')} className="landing-nav-link">
              Curriculum
            </a>
            <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')} className="landing-nav-link">
              Benefits
            </a>
          </nav>

          <div className="landing-nav-actions">
            <ThemeToggle />
            {token ? (
              <Link to="/dashboard" className="landing-btn-primary">
                <LayoutDashboard size={16} />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="landing-btn-primary">
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>

          <button
            className="landing-mobile-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`landing-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="landing-nav-link">
            Home
          </a>
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="landing-nav-link">
            About
          </a>
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="landing-nav-link">
            Features
          </a>
          <a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')} className="landing-nav-link">
            Curriculum
          </a>
          <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')} className="landing-nav-link">
            Benefits
          </a>
          <div className="landing-mobile-actions">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Theme Mode</span>
              <ThemeToggle variant="pill" />
            </div>
            {token ? (
              <Link to="/dashboard" className="landing-btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn-ghost" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="landing-btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="hero-pill-sparkle" />
            <span>Eternal University · BCA Hons. with Research</span>
            <span className="hero-pill-badge">Semesters 1—6</span>
          </div>

          <h1 className="hero-heading">
            Master Your BCA Journey with{' '}
            <span className="hero-gradient-text">Clarity & Confidence</span>.
          </h1>

          <p className="hero-description">
            The official academic learning companion for BCA Hons. with Research students at Eternal University.
            Explore your semester-wise syllabus, master code fundamentals,
            test retention with instant quizzes, and stay connected with faculty mentors.
          </p>

          <div className="hero-cta-group">
            <Link to={token ? "/dashboard" : "/register"} className="hero-btn-primary">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>
            <Link to={token ? "/dashboard" : "/login"} className="hero-btn-secondary">
              <span>Sign In</span>
              <Compass size={18} />
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>Official Eternal University Syllabus Aligned</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>29 Semester-Wise Subjects Mapped</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>Instant Self-Assessment Quizzes</span>
            </div>
          </div>
        </div>

        {/* Hero Visual SaaS Illustration / Interactive Mockup */}
        <div className="hero-mockup-container">
          <div className="mockup-window">
            {/* Window Top Header */}
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <span className="mockup-dot dot-red" />
                <span className="mockup-dot dot-yellow" />
                <span className="mockup-dot dot-green" />
              </div>
              <div className="mockup-address-bar">
                <ShieldCheck size={12} color="#10b981" />
                <span>classroom.eternal.edu/bca/semester-2/web-dev</span>
              </div>
            </div>

            {/* Mockup Workspace Body */}
            <div className="mockup-body">
              {/* Mockup Sidebar */}
              <div className="mockup-sidebar">
                <div className="mockup-side-logo">
                  <span className="landing-brand-mark" style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}>C</span>
                  <span>classroom</span>
                </div>

                <div className="mockup-side-menu">
                  <div className="mockup-side-item active">
                    <LayoutDashboard size={14} />
                    <span>Overview</span>
                  </div>
                  <div className="mockup-side-item">
                    <BookOpen size={14} />
                    <span>Curriculum</span>
                  </div>
                  <div className="mockup-side-item">
                    <Code2 size={14} />
                    <span>My Lessons</span>
                  </div>
                  <div className="mockup-side-item">
                    <CheckCircle2 size={14} />
                    <span>Quizzes</span>
                  </div>
                  <div className="mockup-side-item">
                    <TrendingUp size={14} />
                    <span>My Progress</span>
                  </div>
                </div>

                <div className="mockup-side-streak-box">
                  <Flame size={15} color="#ea580c" />
                  <span><strong>5-Day Streak</strong> · Keep it up!</span>
                </div>
              </div>

              {/* Mockup Main Viewport */}
              <div className="mockup-main">
                {/* Metric Summary Cards */}
                <div className="mockup-header-stats">
                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Active Semester</span>
                    <div className="mockup-stat-value">
                      Semester 2 <span className="mockup-stat-badge">On Track</span>
                    </div>
                    <div className="mockup-stat-progress">
                      <div className="mockup-stat-fill" style={{ width: '74%' }} />
                    </div>
                  </div>

                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Quiz Mastery</span>
                    <div className="mockup-stat-value">
                      92% <span className="mockup-stat-badge">+8% this week</span>
                    </div>
                    <div className="mockup-stat-progress">
                      <div className="mockup-stat-fill" style={{ width: '92%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                    </div>
                  </div>

                  <div className="mockup-stat-card">
                    <span className="mockup-stat-label">Completed Units</span>
                    <div className="mockup-stat-value">
                      18 / 24 <span className="mockup-stat-badge">75% done</span>
                    </div>
                    <div className="mockup-stat-progress">
                      <div className="mockup-stat-fill" style={{ width: '75%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                    </div>
                  </div>
                </div>

                {/* Content Highlights */}
                <div className="mockup-content-grid">
                  {/* Current Active Lesson */}
                  <div className="mockup-lesson-card">
                    <span className="mockup-card-tag">Current Lesson · Unit 3</span>
                    <div className="mockup-lesson-title">Web Development Frontend 1: Flexbox & Grid</div>
                    <div className="mockup-code-snippet">
                      <span className="mockup-code-type">.course-grid</span> {'{\n'}
                      {'  '}display: <span className="mockup-code-highlight">grid</span>;{'\n'}
                      {'  '}grid-template-columns: <span className="mockup-code-highlight">repeat(3, 1fr)</span>;{'\n'}
                      {'  '}gap: <span className="mockup-code-type">20px</span>;{'\n'}
                      {'}'}
                    </div>
                  </div>

                  {/* Quick Assessment Quiz */}
                  <div className="mockup-quiz-preview">
                    <span className="mockup-card-tag" style={{ background: '#ecfdf5', color: '#047857' }}>
                      Quiz Review · 100% Score
                    </span>
                    <div className="mockup-quiz-q">Which CSS property establishes a grid formatting context?</div>
                    <div className="mockup-quiz-options">
                      <div className="mockup-quiz-opt">A) position: grid</div>
                      <div className="mockup-quiz-opt correct">
                        <span>B) display: grid</span>
                        <Check size={14} color="#059669" />
                      </div>
                      <div className="mockup-quiz-opt">C) float: grid</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Glassmorphic Badges */}
          <div className="mockup-floating-badge badge-top-right">
            <div className="floating-icon-wrapper floating-icon-mentor">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="floating-text-primary">Faculty Feedback</div>
              <div className="floating-text-subtle">"Excellent progress in Web Frontend 1, Pratiksha!"</div>
            </div>
          </div>

          <div className="mockup-floating-badge badge-bottom-left">
            <div className="floating-icon-wrapper floating-icon-achievement">
              <Trophy size={18} />
            </div>
            <div>
              <div className="floating-text-primary">Badge Unlocked: Algorithm Master</div>
              <div className="floating-text-subtle">Completed Problem Solving 1 & 2</div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="landing-metrics-bar">
        <div className="metrics-container">
          <div className="metric-item">
            <span className="metric-number">6</span>
            <span className="metric-title">Semesters Covered</span>
            <span className="metric-caption">A complete syllabus roadmap from Day 1 to Graduation.</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">29</span>
            <span className="metric-title">Official Subjects</span>
            <span className="metric-caption">Programming, Databases, Web, Systems, AI, and Cloud.</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">100%</span>
            <span className="metric-title">Instant Evaluation</span>
            <span className="metric-caption">Quizzes graded immediately with detailed solutions.</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">1:1</span>
            <span className="metric-title">Mentor Visibility</span>
            <span className="metric-caption">Keep faculty and students aligned on academic goals.</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-section" id="about">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">About Classroom</span>
            <h2 className="section-title">Engineered Specifically for BCA Students & Faculty</h2>
            <p className="section-description">
              General e-learning platforms are either too generic or bloated with distractions.
              Classroom was created to deliver an intentional, focused environment designed around
              the official computer applications syllabus at Eternal University.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-story">
              <h3>Bridging academic theory with practical programming mastery.</h3>
              <p>
                BCA students are expected to learn rigorous theoretical computer science concepts while
                building practical programming problem-solving skills in C, C++, Web, AI, and database architectures.
              </p>
              <p>
                Classroom simplifies this journey into a calm, linear progression. You always know what to study next,
                how well you understand each unit, and where your strengths lie.
              </p>

              <div className="about-pillars">
                <div className="pillar-card">
                  <div className="pillar-icon-box">
                    <Layers size={20} />
                  </div>
                  <div className="pillar-content">
                    <h4>Semester-by-Semester Roadmap</h4>
                    <p>No guessing or scouring random tutorials. Follow a verified, semester-calibrated syllabus.</p>
                  </div>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon-box">
                    <FileCheck2 size={20} />
                  </div>
                  <div className="pillar-content">
                    <h4>Active Recall & Retention</h4>
                    <p>Reinforce your memory right after studying each module through instant knowledge checks.</p>
                  </div>
                </div>

                <div className="pillar-card">
                  <div className="pillar-icon-box">
                    <Users2 size={20} />
                  </div>
                  <div className="pillar-content">
                    <h4>Faculty & Mentor Alignment</h4>
                    <p>Mentors can easily follow cohort progress, review quiz metrics, and guide students early.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-visual-panel">
              <div className="about-panel-badge">
                <GraduationCap size={15} />
                <span>ETERNAL UNIVERSITY · BCA HONS.</span>
              </div>
              <blockquote className="about-panel-quote">
                "Classroom turned our scattered semester syllabus into an intuitive, calm daily study habit.
                Students grasp programming fundamentals faster and score significantly higher on semester examinations."
              </blockquote>
              <div className="about-panel-author">
                <div className="author-avatar">EU</div>
                <div className="author-info">
                  <strong>Department of Computer Applications</strong>
                  <span>Eternal University Academic Board</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section" id="features" style={{ backgroundColor: '#ffffff' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Key Capabilities</span>
            <h2 className="section-title">Everything You Need to Succeed Each Semester</h2>
            <p className="section-description">
              Carefully designed tools to help BCA students stay organized, master code fundamentals,
              and build lifelong computer science confidence.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper icon-purple">
                <BookOpenCheck size={26} />
              </div>
              <span className="feature-eyebrow">Structured Roadmap</span>
              <h3 className="feature-title">Verified Semester Curricula</h3>
              <p className="feature-text">
                Browse all 29 subjects across Semesters 1 to 6. Access unit objectives,
                recommended lesson order, and syllabus topics in one clean view.
              </p>
              <div className="feature-tags">
                <span className="feature-tag">Syllabus Aligned</span>
                <span className="feature-tag">29 Subjects</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper icon-blue">
                <Code2 size={26} />
              </div>
              <span className="feature-eyebrow">Interactive Content</span>
              <h3 className="feature-title">Bite-Sized Modular Lessons</h3>
              <p className="feature-text">
                Learn core concepts without the textbook clutter. Each lesson is formatted with clear code
                syntax, visual diagrams, and bulleted takeaways for efficient retention.
              </p>
              <div className="feature-tags">
                <span className="feature-tag">Code Snippets</span>
                <span className="feature-tag">Self-Paced</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper icon-emerald">
                <CheckCircle2 size={26} />
              </div>
              <span className="feature-eyebrow">Knowledge Validation</span>
              <h3 className="feature-title">Self-Assessment Quizzes</h3>
              <p className="feature-text">
                Test your understanding after every lesson. Get instant scores, detailed answer reviews,
                and track your study streaks to build consistent habits.
              </p>
              <div className="feature-tags">
                <span className="feature-tag">Instant Scoring</span>
                <span className="feature-tag">Streak Multiplier</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper icon-amber">
                <TrendingUp size={26} />
              </div>
              <span className="feature-eyebrow">Actionable Analytics</span>
              <h3 className="feature-title">Progress & Mentor Dashboard</h3>
              <p className="feature-text">
                Monitor overall completion percentage, subject mastery, and quiz trends. Mentors get dedicated
                views to monitor student cohorts and offer timely guidance.
              </p>
              <div className="feature-tags">
                <span className="feature-tag">Mastery Rate</span>
                <span className="feature-tag">Mentor Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Semester-wise Subjects Curriculum Section */}
      <SemesterSubjectsSection />

      {/* Benefits Section */}
      <section className="landing-section" id="benefits" style={{ backgroundColor: '#ffffff' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Why Classroom</span>
            <h2 className="section-title">Designed for Students. Trusted by Mentors.</h2>
            <p className="section-description">
              A dual-sided ecosystem that empowers learners to excel while giving mentors the exact visibility they need.
            </p>
          </div>

          <div className="benefits-grid">
            {/* For Students */}
            <div className="benefit-card">
              <div className="benefit-badge badge-student">
                <GraduationCap size={16} />
                <span>FOR BCA STUDENTS</span>
              </div>
              <h3 className="benefit-card-title">Study with Direction, Consistency & Zero Stress</h3>
              <p className="benefit-card-desc">
                Replace last-minute cramming and confusing forum threads with a serene, organized study companion.
              </p>

              <div className="benefit-checklist">
                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-purple">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Clear Semester Trajectory:</strong> Know exactly which modules count towards your degree and what to study today.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-purple">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Master Programming Fundamentals:</strong> Build real code intuition with syntax-highlighted code blocks in C, C++, and SQL.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-purple">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Daily Habit & Streak Mechanics:</strong> Visual progress rings and study streaks make consistent learning rewarding.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-purple">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Exam Readiness:</strong> Practice with unit quizzes to solidify memory long before final university exams arrive.
                  </div>
                </div>
              </div>
            </div>

            {/* For Mentors */}
            <div className="benefit-card">
              <div className="benefit-badge badge-mentor">
                <Users2 size={16} />
                <span>FOR FACULTY & MENTORS</span>
              </div>
              <h3 className="benefit-card-title">Actionable Insights Without Administrative Burden</h3>
              <p className="benefit-card-desc">
                Gain real-time transparency into how your students are performing across each semester unit.
              </p>

              <div className="benefit-checklist">
                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-green">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Cohort Progress at a Glance:</strong> Instantly view completion percentages for all enrolled students in your batch.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-green">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Identify Students Falling Behind:</strong> Automatic score tracking flags learners who struggle with specific quizzes.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-green">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Standardized Syllabus Delivery:</strong> Ensure all students have access to uniform, high-quality reference notes.
                  </div>
                </div>

                <div className="benefit-check-item">
                  <div className="benefit-check-icon check-green">
                    <Check size={14} />
                  </div>
                  <div>
                    <strong>Targeted Intervention:</strong> Provide encouraging feedback and personalized help right when it matters most.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="landing-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">
              Find quick answers about the Eternal University BCA curriculum, course codes, and student access.
            </p>
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div className="faq-accordion-q">
                    <span className="faq-q-text">
                      {faq.q}
                    </span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: 18, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                      <ChevronRight size={18} />
                    </span>
                  </div>
                  {isOpen && (
                    <p className="faq-a-text">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action Banner */}
      <div className="section-container">
        <div className="landing-cta-banner">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Start Your Next Semester on the Right Track.</h2>
            <p className="cta-banner-desc">
              Join Eternal University BCA students and faculty who have turned scattered notes into a structured,
              rewarding path to academic excellence.
            </p>
            <div className="cta-banner-buttons">
              <Link to={token ? "/dashboard" : "/register"} className="cta-banner-btn-white">
                <span>{token ? "Open Your Dashboard" : "Get Started Free"}</span>
                <ArrowRight size={16} />
              </Link>
              <Link to={token ? "/curriculum" : "/login"} className="cta-banner-btn-outline">
                <span>{token ? "Explore Curriculum" : "Sign In to Classroom"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern SaaS Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Col */}
            <div className="footer-brand-col">
              <Link to="/" className="landing-brand">
                <span className="landing-brand-mark">C</span>
                <span>classroom</span>
              </Link>
              <p className="footer-tagline">
                The modern learning companion for BCA Hons. with Research students and faculty at Eternal University.
              </p>
            </div>

            {/* Quick Links Col */}
            <div>
              <div className="footer-col-title">Platform</div>
              <ul className="footer-links">
                <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About Platform</a></li>
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a></li>
                <li><a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')}>Semester Subjects</a></li>
                <li><a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')}>Benefits</a></li>
              </ul>
            </div>

            {/* Semesters Col */}
            <div>
              <div className="footer-col-title">Semesters</div>
              <ul className="footer-links">
                <li><a href="#semester-section-1" onClick={(e) => scrollToSemester(e, 1)}>Semester 1 (Foundations)</a></li>
                <li><a href="#semester-section-2" onClick={(e) => scrollToSemester(e, 2)}>Semester 2 (Web Dev & AI)</a></li>
                <li><a href="#semester-section-3" onClick={(e) => scrollToSemester(e, 3)}>Semester 3 (React & Core)</a></li>
                <li><a href="#semester-section-4" onClick={(e) => scrollToSemester(e, 4)}>Semester 4 (Backend & Cloud)</a></li>
                <li><a href="#semester-section-5" onClick={(e) => scrollToSemester(e, 5)}>Semester 5 (AI & Capstone)</a></li>
                <li><a href="#semester-section-6" onClick={(e) => scrollToSemester(e, 6)}>Semester 6 (Data Science)</a></li>
              </ul>
            </div>

            {/* Account & Support Col */}
            <div>
              <div className="footer-col-title">Account</div>
              <ul className="footer-links">
                <li><Link to="/login">Student Sign In</Link></li>
                <li><Link to="/register">Create Free Account</Link></li>
                <li><Link to="/mentor">Mentor Portal</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Classroom · Eternal University BCA Hons. with Research. All rights reserved.</span>
            <button className="footer-back-to-top" onClick={scrollToTop}>
              <ArrowUp size={14} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
