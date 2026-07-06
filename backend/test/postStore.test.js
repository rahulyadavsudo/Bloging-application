const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createPostStore } = require('../src/models/postStore');

test('store persists posts to disk', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blogstore-'));
  const store = createPostStore(path.join(tempDir, 'posts.json'));

  const created = await store.addPost({
    title: 'Hello from the test',
    excerpt: 'Persisted through the store',
    author: 'Ada',
  });

  assert.equal(created.title, 'Hello from the test');
  const posts = await store.getPosts();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].title, 'Hello from the test');
});

test('store can update and delete posts', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blogstore-'));
  const store = createPostStore(path.join(tempDir, 'posts.json'));

  const created = await store.addPost({
    title: 'Original title',
    excerpt: 'Original excerpt',
    author: 'Ada',
  });

  const updated = await store.updatePost(created.id, {
    title: 'Updated title',
  });

  assert.equal(updated.title, 'Updated title');
  assert.equal(updated.excerpt, 'Original excerpt');

  const deleted = await store.deletePost(created.id);
  assert.equal(deleted, true);

  const posts = await store.getPosts();
  assert.equal(posts.length, 0);
});
