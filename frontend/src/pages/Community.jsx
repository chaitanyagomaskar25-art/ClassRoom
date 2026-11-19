import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Flame,
  Heart,
  Lock,
  MessageCircle,
  MessageSquare,
  Pin,
  Plus,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import './Community.css';

export default function Community() {
  const currentUser = useSelector((state) => state.auth.user) || {};
  const token = useSelector((state) => state.auth.token);
  const isStaff = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(currentUser.role);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Expanded comments by post ID
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    category: 'general',
    subjectCode: '',
    projectUrl: '',
    codeSnippet: '',
    tags: ''
  });
  const [submittingPost, setSubmittingPost] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [filterCategory]);

  // Real-time socket listener for new community posts
  useEffect(() => {
    const socket = getSocket(token);
    if (!socket) return;

    const handleNewPost = (newPost) => {
      showToast(`📢 New community post: "${newPost.title.slice(0, 30)}..."`);
      loadPosts();
    };

    socket.on('community:new_post', handleNewPost);
    return () => {
      socket.off('community:new_post', handleNewPost);
    };
  }, [token]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/community/posts?category=${filterCategory}`);
      const data = unwrap(res);
      setPosts(data?.posts || []);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to load community feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) return;

    setSubmittingPost(true);
    try {
      const tagsArray = postForm.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await api.post('/community/posts', {
        ...postForm,
        tags: tagsArray
      });

      setShowCreateModal(false);
      setPostForm({
        title: '',
        content: '',
        category: 'general',
        subjectCode: '',
        projectUrl: '',
        codeSnippet: '',
        tags: ''
      });
      showToast('Post published successfully!');
      loadPosts();
    } catch (err) {
      alert(getErrorMessage(err) || 'Failed to publish post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      const data = unwrap(res);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, hasLiked: data.hasLiked, likesCount: data.likesCount }
            : p
        )
      );
    } catch (err) {
      console.warn('Like failed:', err.message);
    }
  };

  const toggleComments = async (postId) => {
    const isCurrentlyExpanded = Boolean(expandedComments[postId]);
    setExpandedComments((prev) => ({ ...prev, [postId]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded && !commentsMap[postId]) {
      try {
        const res = await api.get(`/community/posts/${postId}`);
        const data = unwrap(res);
        setCommentsMap((prev) => ({ ...prev, [postId]: data?.comments || [] }));
      } catch (err) {
        console.warn('Failed to load comments:', err.message);
      }
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    try {
      const res = await api.post(`/community/posts/${postId}/comments`, { content: text });
      const data = unwrap(res);

      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
      }));

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
    } catch (err) {
      alert(getErrorMessage(err) || 'Failed to submit comment.');
    }
  };

  const handleReportPost = async (postId) => {
    const reason = prompt('Please specify why this post should be reviewed:');
    if (!reason || !reason.trim()) return;

    try {
      await api.post(`/community/posts/${postId}/report`, { reason });
      showToast('Thank you. The report has been flagged for mentor review.');
    } catch (err) {
      alert(getErrorMessage(err) || 'Failed to submit report.');
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      await api.post(`/community/posts/${postId}/moderate`, { action });
      showToast(`Moderation action applied: ${action}`);
      loadPosts();
    } catch (err) {
      alert(getErrorMessage(err) || 'Moderator action failed.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="community-page">
      {/* Header Bar */}
      <div className="community-header-bar">
        <div>
          <h1 className="community-title">
            <Users size={28} className="text-primary" />
            <span>Student & Mentor Community</span>
          </h1>
          <p className="community-sub">
            Share capstone projects, discuss challenging algorithms, ask curriculum questions, and collaborate with peers.
          </p>
        </div>

        <button
          type="button"
          className="btn-create-post"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          <span>New Discussion Post</span>
        </button>
      </div>

      {toastMessage && (
        <div style={{ background: '#0f172a', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Sparkles size={16} color="#a855f7" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="community-filter-row">
        {[
          { id: 'all', label: 'All Discussions' },
          { id: 'dsa', label: 'DSA & Algorithms' },
          { id: 'web_dev', label: 'Web & Systems' },
          { id: 'database', label: 'Database & SQL' },
          { id: 'projects', label: 'Project Showcase' },
          { id: 'curriculum', label: 'Course Curriculum' },
          { id: 'study_groups', label: 'Study Groups' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`comm-pill ${filterCategory === cat.id ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
          <p>Loading community posts…</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
          <p>{error}</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post._id} className={`post-card ${post.isPinned ? 'pinned' : ''}`}>
              <div className="post-card-top">
                <div className="author-meta-wrap">
                  <div className="author-avatar-circle">
                    {post.authorName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="author-name-text">{post.authorName}</span>
                      <span className={`author-role-badge role-${post.authorRole}`}>
                        {post.authorRole}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {post.isPinned && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  {post.isLocked && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem' }}>
                      <Lock size={12} /> Locked
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary)' }}>
                    #{post.category}
                  </span>
                </div>
              </div>

              <h3 className="post-card-title">{post.title}</h3>
              <p className="post-card-prose">{post.content}</p>

              {/* Code snippet if present */}
              {post.codeSnippet && (
                <pre className="post-code-block">
                  <code>{post.codeSnippet}</code>
                </pre>
              )}

              {/* Project link if present */}
              {post.projectUrl && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <a
                    href={post.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Project Repository / Demo</span>
                  </a>
                </div>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="post-tags-row">
                  {post.tags.map((t, i) => (
                    <span key={i} className="post-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Interactive Actions */}
              <div className="post-card-footer">
                <div className="post-interactive-btns">
                  <button
                    type="button"
                    className={`btn-post-action ${post.hasLiked ? 'liked' : ''}`}
                    onClick={() => handleLikePost(post._id)}
                  >
                    <Heart size={16} fill={post.hasLiked ? '#ef4444' : 'none'} />
                    <span>{post.likesCount || 0}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-post-action"
                    onClick={() => toggleComments(post._id)}
                  >
                    <MessageSquare size={16} />
                    <span>{post.commentsCount || 0} Replies</span>
                  </button>

                  <button
                    type="button"
                    className="btn-post-action"
                    onClick={() => handleReportPost(post._id)}
                  >
                    <ShieldAlert size={14} />
                    <span>Report</span>
                  </button>
                </div>

                {/* Moderator Controls for Staff */}
                {isStaff && (
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-post-action"
                      onClick={() => handleModeratePost(post._id, post.isPinned ? 'unpin' : 'pin')}
                      title="Pin/Unpin"
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-post-action"
                      onClick={() => handleModeratePost(post._id, post.isLocked ? 'unlock' : 'lock')}
                      title="Lock/Unlock"
                    >
                      <Lock size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {expandedComments[post._id] && (
                <div className="comments-accordion">
                  <div className="comments-list">
                    {(commentsMap[post._id] || []).map((c) => (
                      <div key={c._id} className="comment-item">
                        <div className="comment-author-row">
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.authorName} <small style={{ color: 'var(--text-secondary)' }}>({c.authorRole})</small>
                          </span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{c.content}</p>
                      </div>
                    ))}
                  </div>

                  {!post.isLocked && (
                    <div className="comment-input-row">
                      <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a constructive reply..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post._id); }}
                      />
                      <button
                        type="button"
                        className="btn-create-post"
                        style={{ padding: '0.45rem 0.85rem' }}
                        onClick={() => handleAddComment(post._id)}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
          <p>No community posts in this category yet. Be the first to start a conversation!</p>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Create Community Discussion</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  className="comment-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="e.g. How to structure B-Tree index partitions for large datasets"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    className="coding-select"
                    style={{ width: '100%' }}
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  >
                    <option value="general">General Academic Discussion</option>
                    <option value="dsa">DSA & Algorithms</option>
                    <option value="web_dev">Web & Backend Systems</option>
                    <option value="database">Database & SQL</option>
                    <option value="projects">Project Showcase & Feedback</option>
                    <option value="curriculum">Course Syllabus Questions</option>
                    <option value="study_groups">Study Group Formation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Project URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="comment-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    placeholder="https://github.com/..."
                    value={postForm.projectUrl}
                    onChange={(e) => setPostForm({ ...postForm, projectUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Discussion Details *
                </label>
                <textarea
                  required
                  className="code-textarea"
                  style={{ minHeight: '120px', width: '100%', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  placeholder="Explain your question, share your project architecture, or invite feedback..."
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Code Snippet (Optional)
                </label>
                <textarea
                  className="code-textarea"
                  style={{ minHeight: '80px', width: '100%' }}
                  placeholder="// Paste illustrative code..."
                  value={postForm.codeSnippet}
                  onChange={(e) => setPostForm({ ...postForm, codeSnippet: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  className="comment-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="mongodb, indexing, bca-sem1"
                  value={postForm.tags}
                  onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-back-problems"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create-post"
                  disabled={submittingPost}
                >
                  {submittingPost ? 'Publishing…' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
