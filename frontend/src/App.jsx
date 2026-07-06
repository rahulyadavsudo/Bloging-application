import { useEffect, useState } from 'react';
import './styles.css';
import { createPost, deletePost, fetchPosts, loginUser, registerUser, updatePost } from './services/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', excerpt: '', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [user, setUser] = useState(null);
  const [view, setView] = useState('auth');

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await updatePost(editingId, form);
      } else {
        await createPost(form);
      }

      setForm({ title: '', excerpt: '', author: '' });
      setEditingId(null);
      await loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(post) {
    setEditingId(post.id);
    setForm({ title: post.title, excerpt: post.excerpt, author: post.author });
  }

  async function handleDelete(id) {
    try {
      await deletePost(id);
      await loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: '', excerpt: '', author: '' });
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const result = authMode === 'login'
        ? await loginUser(authForm)
        : await registerUser(authForm);
      setUser(result.user || result);
      setAuthForm({ username: '', password: '' });
      setView('dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    setUser(null);
    setView('auth');
  }

  return (
    <div className="app-shell">
      {view === 'auth' ? (
        <section className="auth-page">
          <div className="auth-hero">
            <span className="eyebrow">Editorial publishing</span>
            <h1>Write, publish and grow your stories.</h1>
            <p>Join a beautiful space for modern writers and readers alike.</p>
          </div>

          <div className="auth-card auth-card-large">
            <div className="toggle-row">
              <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                Login
              </button>
              <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <input
                placeholder="Username"
                value={authForm.username}
                onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                required
              />
              <button type="submit">
                {authMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </div>
        </section>
      ) : (
        <>
          <header className="dashboard-header">
            <div>
              <span className="eyebrow">Writer dashboard</span>
              <h1>Welcome back, {user?.username || 'writer'}.</h1>
              <p>Compose thoughtful posts and manage your latest stories from one calm workspace.</p>
            </div>
            <button type="button" className="secondary" onClick={handleLogout}>
              Logout
            </button>
          </header>

          <main className="workspace-grid">
            <section className="composer-card" id="compose">
              <div className="section-heading">
                <h2>{editingId ? 'Edit story' : 'Write a new story'}</h2>
                <p>Craft your next post with a clean, distraction-free editor.</p>
              </div>

              <form className="composer" onSubmit={handleSubmit}>
                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                />
                <textarea
                  placeholder="Excerpt"
                  value={form.excerpt}
                  onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                  required
                />
                <input
                  placeholder="Author"
                  value={form.author}
                  onChange={(event) => setForm({ ...form, author: event.target.value })}
                  required
                />
                <div className="form-actions">
                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : editingId ? 'Update story' : 'Publish story'}
                  </button>
                  {editingId && (
                    <button type="button" className="secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="feed-card" id="posts">
              <div className="section-heading">
                <h2>Latest stories</h2>
                <p>Fresh posts from your community.</p>
              </div>

              {loading && <p className="muted">Loading stories...</p>}
              {error && <p className="error">{error}</p>}
              {!loading && !error && (
                <section className="card-grid">
                  {posts.map((post) => (
                    <article className="card" key={post.id}>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span>By {post.author}</span>
                      <div className="card-actions">
                        <button type="button" onClick={() => startEditing(post)}>
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => handleDelete(post.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </section>
              )}
            </section>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
