import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { whatsapp_number, senha } = req.body;

  // Verificação de formato do número
  const whatsappRegex = /^55\d{10}$/; // 55 + DDD (2 dígitos) + número (8 dígitos)
  if (!whatsappRegex.test(whatsapp_number)) {
    return res.status(400).json({ 
      message: 'Formato de número inválido. Use o formato 553172225812 (sem o 9 após o DDD).' 
    });
  }

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE whatsapp_number = $1',
      [whatsapp_number]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado. Certifique-se de que o número do WhatsApp está no formato correto, como por exemplo: 553196812719 (sem o 9 após o DDD).' 
      });
    }

    // Comparação direta, pois senha não está criptografada
    if (senha !== user.rows[0].senha) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, userId: user.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});


// Rota para buscar dados do usuário logado
router.get('/me/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query(
      `SELECT nome, whatsapp_number, email, vencimento_assinatura, assinatura_ativa
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
});

// Rota para atualizar email ou senha
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { email, novaSenha, senhaAtual, nome } = req.body;

  try {
    // Buscar o usuário atual
    const user = await pool.query('SELECT senha FROM users WHERE id = $1', [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const senhaCorreta = user.rows[0].senha === senhaAtual;

    if (novaSenha && !senhaCorreta) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Atualização condicional
    const fieldsToUpdate = [];
    const values = [];
    let index = 1;

    if (email) {
      fieldsToUpdate.push(`email = $${index++}`);
      values.push(email);
    }

    if (novaSenha && senhaCorreta) {
      fieldsToUpdate.push(`senha = $${index++}`);
      values.push(novaSenha);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'Nenhum dado para atualizar' });
    }

    if (nome) {
      fieldsToUpdate.push(`nome = $${index++}`);
      values.push(nome);
    }    

    values.push(id); // última posição para WHERE id
    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${index}`;
    
    await pool.query(query, values);

    res.json({ message: 'Dados atualizados com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar dados do usuário' });
  }
});

export default router;
