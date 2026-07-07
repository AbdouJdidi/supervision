const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  res.json(services);
});

router.post('/', (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Le nom et l\'URL sont obligatoires' });
  }

  const stmt = db.prepare('INSERT INTO services (name, url, status, last_checked) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, url, 'UNKNOWN', null);

  const newService = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newService);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Service introuvable' });
  }

  res.status(204).send();
});

router.post('/:id/check', async (req, res) => {
  const { id } = req.params;
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);

  if (!service) {
    return res.status(404).json({ error: 'Service introuvable' });
  }

  let status = 'DOWN';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); 

    const response = await fetch(service.url, { signal: controller.signal });
    clearTimeout(timeout);

    status = response.ok ? 'UP' : 'DOWN';
  } catch (err) {
    status = 'DOWN';
  }

  const lastChecked = new Date().toISOString();

  db.prepare('UPDATE services SET status = ?, last_checked = ? WHERE id = ?')
    .run(status, lastChecked, id);

  const updatedService = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.json(updatedService);
});

module.exports = router;