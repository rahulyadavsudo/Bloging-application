const express = require('express');
const cors = require('cors');
const { createPostStore } = require('./models/postStore');
const { createUserStore } = require('./models/authStore');

const app = express();
const PORT = process.env.PORT || 5000;
const postStore = createPostStore();
const userStore = createUserStore();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.user = null;
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    const persistence = await postStore.getPersistenceMode();
    res.json({ status: 'ok', message: 'Backend is running', persistence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await postStore.getPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const user = await userStore.registerUser({ username, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const user = await userStore.verifyUser({ username, password });
    req.user = user;
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, excerpt, author } = req.body;

  if (!title || !excerpt || !author) {
    return res.status(400).json({ error: 'title, excerpt, and author are required' });
  }

  try {
    const createdPost = await postStore.addPost({ title, excerpt, author });
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = await postStore.updatePost(req.params.id, req.body);
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deleted = await postStore.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
