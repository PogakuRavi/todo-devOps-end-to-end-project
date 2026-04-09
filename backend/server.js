const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const client = require('prom-client');   // ✅ ADD THIS

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('../frontend'));

// ✅ collect default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

const db = new sqlite3.Database('./todo.db');

db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT
)`);

app.get('/todos', (req, res) => {
  db.all("SELECT * FROM todos", [], (err, rows) => {
    res.json(rows);
  });
});

app.post('/todos', (req, res) => {
  const { task } = req.body;
  db.run("INSERT INTO todos(task) VALUES(?)", [task]);
  res.send("Task added");
});

app.delete('/todos/:id', (req, res) => {
  db.run("DELETE FROM todos WHERE id=?", [req.params.id]);
  res.send("Task deleted");
});

// ✅ ADD THIS (metrics endpoint)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3000, () => console.log("Server running on port 3000"));
