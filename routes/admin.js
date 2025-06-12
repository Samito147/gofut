// routes/admin.js
const express = require('express');
const router  = express.Router();
const pool    = require('../db'); // ajuste o path se necessário

// GET /api/players → lista de { id, nick }
router.get('/players', async (req, res) => {
  const { rows } = await pool.query('SELECT id, nick FROM users ORDER BY nick');
  res.json(rows);
});

// POST /api/admin/stats → insere na tabela user_stats
router.post('/admin/stats', async (req, res) => {
  const { player1Id, player2Id, stats } = req.body;
  const query = `
    INSERT INTO user_stats
      (player1_id, player2_id, played, goals, avg_corners, yellow_cards, red_cards)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`;
  const vals = [
    player1Id, player2Id,
    stats.played,
    stats.goals,
    stats.corners,
    stats.yellow,
    stats.red
  ];
  try {
    const { rows } = await pool.query(query, vals);
    res.json(rows[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao inserir estatísticas' });
  }
});

module.exports = router;
