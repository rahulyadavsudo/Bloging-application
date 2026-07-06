const fs = require('node:fs');
const path = require('node:path');
const { MongoClient } = require('mongodb');

function createFilePostStore(filePath = path.join(__dirname, '../../database/posts.json')) {
  const resolvedPath = path.resolve(filePath);

  function ensureFile() {
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, '[]', 'utf8');
    }
  }

  function readPosts() {
    ensureFile();
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(raw);
  }

  function writePosts(posts) {
    ensureFile();
    fs.writeFileSync(resolvedPath, JSON.stringify(posts, null, 2));
  }

  return {
    getPosts() {
      return readPosts();
    },
    addPost(post) {
      const posts = readPosts();
      const newPost = {
        id: Date.now(),
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
      writePosts(posts);
      return newPost;
    },
    updatePost(id, updates) {
      const posts = readPosts();
      const target = posts.find((post) => String(post.id) === String(id));
      if (!target) {
        return null;
      }

      Object.assign(target, updates);
      writePosts(posts);
      return target;
    },
    deletePost(id) {
      const posts = readPosts();
      const filtered = posts.filter((post) => String(post.id) !== String(id));
      if (filtered.length === posts.length) {
        return false;
      }
      writePosts(filtered);
      return true;
    },
  };
}

function createPostStore(filePath = path.join(__dirname, '../../database/posts.json')) {
  const fallbackStore = createFilePostStore(filePath);
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogging-app';
  let client = null;
  let mongoReady = false;
  let connectAttempted = false;

  async function ensureMongoConnection() {
    if (mongoReady || connectAttempted) {
      return mongoReady;
    }

    connectAttempted = true;

    try {
      client = await MongoClient.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      const db = client.db();
      const collection = db.collection('posts');
      await collection.createIndex({ createdAt: -1 });
      mongoReady = true;
      return true;
    } catch (error) {
      console.warn(`MongoDB unavailable at ${mongoUri}; using file-based fallback. ${error.message}`);
      return false;
    }
  }

  function mapPost(post) {
    return {
      id: post._id ? post._id.toString() : post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      createdAt: post.createdAt,
    };
  }

  return {
    async getPosts() {
      const isMongoActive = await ensureMongoConnection();
      if (isMongoActive && client) {
        const db = client.db();
        const collection = db.collection('posts');
        const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return posts.map(mapPost);
      }

      return fallbackStore.getPosts();
    },
    async addPost(post) {
      const isMongoActive = await ensureMongoConnection();
      if (isMongoActive && client) {
        const db = client.db();
        const collection = db.collection('posts');
        const newPost = {
          title: post.title,
          excerpt: post.excerpt,
          author: post.author,
          createdAt: new Date().toISOString(),
        };
        const result = await collection.insertOne(newPost);
        return { id: result.insertedId.toString(), ...newPost };
      }

      return fallbackStore.addPost(post);
    },
    async updatePost(id, updates) {
      const isMongoActive = await ensureMongoConnection();
      if (isMongoActive && client) {
        const db = client.db();
        const collection = db.collection('posts');
        const result = await collection.findOneAndUpdate(
          { _id: new require('mongodb').ObjectId(id) },
          { $set: updates },
          { returnDocument: 'after' }
        );
        return result.value ? mapPost(result.value) : null;
      }

      return fallbackStore.updatePost(id, updates);
    },
    async deletePost(id) {
      const isMongoActive = await ensureMongoConnection();
      if (isMongoActive && client) {
        const db = client.db();
        const collection = db.collection('posts');
        const result = await collection.deleteOne({ _id: new require('mongodb').ObjectId(id) });
        return result.deletedCount > 0;
      }

      return fallbackStore.deletePost(id);
    },
    async getPersistenceMode() {
      const isMongoActive = await ensureMongoConnection();
      return isMongoActive ? 'mongodb' : 'file';
    },
  };
}

module.exports = { createPostStore, createFilePostStore };
