const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function createUserStore(filePath = path.join(__dirname, '../../database/users.json')) {
  const resolvedPath = path.resolve(filePath);

  function ensureFile() {
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
      fs.writeFileSync(resolvedPath, '[]', 'utf8');
    }
  }

  function readUsers() {
    ensureFile();
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    return JSON.parse(raw);
  }

  function writeUsers(users) {
    ensureFile();
    fs.writeFileSync(resolvedPath, JSON.stringify(users, null, 2));
  }

  function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  return {
    async registerUser({ username, password }) {
      const users = readUsers();
      const existing = users.find((user) => user.username === username);
      if (existing) {
        throw new Error('Username already exists');
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        passwordHash: hashPassword(password),
      };
      users.push(newUser);
      writeUsers(users);
      return { id: newUser.id, username: newUser.username };
    },
    async verifyUser({ username, password }) {
      const users = readUsers();
      const user = users.find((entry) => entry.username === username);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.passwordHash !== hashPassword(password)) {
        throw new Error('Invalid password');
      }

      return { id: user.id, username: user.username };
    },
  };
}

module.exports = { createUserStore };
