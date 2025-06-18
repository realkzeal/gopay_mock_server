const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(bodyParser.json());

// Simple authentication middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No auth header' });

  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid auth format' });

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users.find(u => u.token === token);
  if (!user) return res.status(403).json({ error: 'Invalid token' });

  req.user = user;
  next();
}

// Load or initialize database
function loadDb() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf-8');
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Dynamic route handler
app.all('/api/:resource/:id?', authenticate, (req, res) => {
  const db = loadDb();
  const { resource, id } = req.params;

  if (!db[resource]) db[resource] = [];

  if (req.method === 'GET') {
    if (id) {
      const item = db[resource].find(i => i.id == id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      return res.json(item);
    }
    return res.json(db[resource]);
  }

  if (req.method === 'POST') {
    const newItem = { id: Date.now().toString(), ...req.body };
    db[resource].push(newItem);
    saveDb(db);
    return res.status(201).json(newItem);
  }

  if (req.method === 'PUT' && id) {
    const idx = db[resource].findIndex(i => i.id == id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db[resource][idx] = { ...db[resource][idx], ...req.body };
    saveDb(db);
    return res.json(db[resource][idx]);
  }

  if (req.method === 'DELETE' && id) {
    const idx = db[resource].findIndex(i => i.id == id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const deleted = db[resource].splice(idx, 1);
    saveDb(db);
    return res.json(deleted[0]);
  }

  res.status(405).json({ error: 'Method not allowed' });
});

// Simple login endpoint to get token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: user.token });
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});

/*
Setup:
1. Create a users.json file in the same directory:
[
  { "username": "admin", "password": "admin", "token": "sometoken123" }
]
2. Start the server: node index.js
3. Use /login to get a token, then use Bearer token in Authorization header for /api/* endpoints.
*/