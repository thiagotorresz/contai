import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Token não enviado');

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const transacoes = await pool.query(
      'SELECT * FROM transacoes WHERE userId = $1 ORDER BY data DESC',
      [userId]
    );

    res.json(transacoes.rows);
  } catch (err) {
    console.error(err);
    res.status(401).send('Token inválido');
  }
});

router.put('/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Token não enviado');

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id } = req.params;
    const { descricao, valor, categoria, data } = req.body;

    const result = await pool.query(
      `UPDATE transacoes
       SET descricao = $1, valor = $2, categoria = $3, data = $4
       WHERE id = $5 AND userId = $6
       RETURNING *`,
      [descricao, valor, categoria, data, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Transação não encontrada');
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar transação');
  }
});

router.delete('/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Token não enviado');

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM transacoes
       WHERE id = $1 AND userId = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Transação não encontrada');
    }

    res.sendStatus(204); // sucesso, sem conteúdo
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir transação');
  }
});

router.post('/', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Token não enviado');

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { descricao, valor, categoria, data, tipo } = req.body;

    const result = await pool.query(
      `INSERT INTO transacoes (descricao, valor, categoria, data, tipo, userId)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [descricao, valor, categoria, data, tipo, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar transação');
  }
});


export default router;
