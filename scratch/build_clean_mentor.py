import re

with open('/tmp/CleanMentor.jsx') as f:
    code = f.read()

# 1. Add ShieldCheck to imports
code = code.replace("  Users,\n  X,\n  Zap", "  Users,\n  ShieldCheck,\n  X,\n  Zap")

# 2. Add state
old_state = "  const [broadcasts, setBroadcasts] = useState([]);"
new_state = """  const [broadcasts, setBroadcasts] = useState([]);
  const [mentorsList, setMentorsList] = useState([]);
  const [mentorSearch, setMentorSearch] = useState('');"""
code = code.replace(old_state, new_state, 1)

# 3. Add load mentors in loadData
old_load = """      if (broadRes.status === 'fulfilled') {
        setBroadcasts(unwrap(broadRes.value)?.broadcasts || []);
      }"""
new_load = """      if (broadRes.status === 'fulfilled') {
        setBroadcasts(unwrap(broadRes.value)?.broadcasts || []);
      }
      if (['scrum', 'admin', 'super_admin'].includes(user.role)) {
        try {
          const teamRes = await api.get('/mentor/team');
          setMentorsList(unwrap(teamRes)?.mentors || []);
        } catch {}
      }"""
code = code.replace(old_load, new_load, 1)

# 4. Add Nav Tab
old_nav_end = """        <button
          type="button"
          className={`mentor-tab-btn ${activeTab === 'ai_analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai_analytics')}
          style={{ borderColor: activeTab === 'ai_analytics' ? '#7c3aed' : undefined }}
        >
          <Sparkles size={16} style={{ color: '#7c3aed' }} />
          <span>AI Mentor Assistant</span>
        </button>
      </nav>"""

new_nav_end = """        <button
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
      </nav>"""
code = code.replace(old_nav_end, new_nav_end, 1)

# 5. Insert TAB 8: MENTORS DIRECTORY right before TAB 7: AI MENTOR COHORT ANALYTICS
mentors_tab_jsx = """      {/* ====================================================================
          TAB 8: MENTORS DIRECTORY (Scrum Master & Institutional Oversight)
          ==================================================================== */}
      {activeTab === 'mentors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: '#6366f1' }} />
                <span>Academic Mentors &amp; Faculty Directory</span>
              </h2>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Supervise mentor assignments, cohort distribution, and student coverage across semesters.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="search-input-wrap" style={{ minWidth: '260px' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search mentors by name, email, department..."
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                  className="search-input"
                />
                {mentorSearch && (
                  <button type="button" className="search-clear-btn" onClick={() => setMentorSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mentors KPI Overview */}
          <div className="mentor-kpi-grid">
            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Total Faculty &amp; Mentors</span>
                <div className="mentor-kpi-icon indigo"><Users size={18} /></div>
              </div>
              <div className="mentor-kpi-value">{mentorsList.length}</div>
              <span className="mentor-kpi-sub">Active Academic Guides</span>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Students Under Mentorship</span>
                <div className="mentor-kpi-icon green"><GraduationCap size={18} /></div>
              </div>
              <div className="mentor-kpi-value" style={{ color: '#10b981' }}>
                {mentorsList.reduce((acc, m) => acc + (m.assignedStudentsCount || 0), 0)}
              </div>
              <span className="mentor-kpi-sub">Assigned BCA Candidates</span>
            </div>

            <div className="mentor-kpi-card">
              <div className="mentor-kpi-header">
                <span className="mentor-kpi-label">Scrum Leads &amp; Admins</span>
                <div className="mentor-kpi-icon purple"><ShieldCheck size={18} /></div>
              </div>
              <div className="mentor-kpi-value" style={{ color: '#8b5cf6' }}>
                {mentorsList.filter((m) => m.role === 'scrum').length || 1}
              </div>
              <span className="mentor-kpi-sub">Program &amp; Sprint Leads</span>
            </div>
          </div>

          {/* Mentors Grid / Table */}
          <div className="mentor-section-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#6366f1' }} />
              <span>Mentor Roster &amp; Cohort Distribution</span>
            </h3>

            {mentorsList.length === 0 ? (
              <EmptyState message="No mentors found or unable to load mentor directory." />
            ) : (
              <div className="table-responsive">
                <table className="mentor-table">
                  <thead>
                    <tr>
                      <th>Mentor / Lead</th>
                      <th>Role &amp; Designation</th>
                      <th>Department</th>
                      <th>Assigned Mentees</th>
                      <th>Covered Semesters</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorsList
                      .filter((m) => {
                        const q = mentorSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          m.name?.toLowerCase().includes(q) ||
                          m.email?.toLowerCase().includes(q) ||
                          m.role?.toLowerCase().includes(q) ||
                          m.department?.toLowerCase().includes(q)
                        );
                      })
                      .map((mentor) => (
                        <tr key={mentor._id || mentor.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: mentor.role === 'scrum' ? '#6366f1' : '#059669',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '13px'
                              }}>
                                {(mentor.name || 'M').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#f8fafc' }}>{mentor.name}</strong>
                                <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8' }}>
                                  {mentor.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: mentor.role === 'scrum'
                                ? 'rgba(99,102,241,0.15)'
                                : mentor.role === 'senior_mentor'
                                ? 'rgba(234,179,8,0.15)'
                                : 'rgba(16,185,129,0.15)',
                              color: mentor.role === 'scrum'
                                ? '#a5b4fc'
                                : mentor.role === 'senior_mentor'
                                ? '#fde047'
                                : '#6ee7b7'
                            }}>
                              {mentor.role === 'scrum'
                                ? 'Scrum Master'
                                : mentor.role === 'senior_mentor'
                                ? 'Senior Mentor'
                                : 'Academic Mentor'}
                            </span>
                          </td>
                          <td style={{ color: '#cbd5e1', fontSize: '12.5px' }}>
                            {mentor.institution || mentor.department || 'Computer Science & Applications'}
                          </td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: mentor.assignedStudentsCount > 0 ? '#10b981' : '#94a3b8'
                            }}>
                              {mentor.assignedStudentsCount || 0} students
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(mentor.semestersCovered?.length > 0
                                ? mentor.semestersCovered
                                : [1, 2, 3]
                              ).map((sem) => (
                                <span
                                  key={sem}
                                  style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '3px',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#cbd5e1'
                                  }}
                                >
                                  Sem {sem}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="button button-small button-secondary"
                                onClick={() => {
                                  setActiveTab('students');
                                  setSearch(mentor.name);
                                }}
                                title="View students assigned to this mentor"
                              >
                                <Eye size={12} />
                                <span>View Students</span>
                              </button>
                              <button
                                type="button"
                                className="button button-small button-secondary"
                                onClick={() => {
                                  setDirectMessageRecipient({
                                    id: mentor._id || mentor.id,
                                    name: mentor.name,
                                    email: mentor.email
                                  });
                                }}
                                title="Message this mentor directly"
                              >
                                <Mail size={12} />
                                <span>Message</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}\n\n      """

code = code.replace("{/* ====================================================================\n          TAB 7: AI MENTOR COHORT ANALYTICS", mentors_tab_jsx + "{/* ====================================================================\n          TAB 7: AI MENTOR COHORT ANALYTICS", 1)

with open('frontend/src/pages/Mentor.jsx', 'w') as out:
    out.write(code)

print("Updated frontend/src/pages/Mentor.jsx, total lines:", len(code.split('\n')))
