import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './lib/supabaseClient';

export function LoginPage() {
  const navigate = useNavigate();
  const [rawWhatsapp, setRawWhatsapp] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const cleaned = digits.startsWith('55') ? digits : '55' + digits;
    return cleaned.slice(0, 12);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setRawWhatsapp(onlyDigits);
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedWhatsapp = formatWhatsapp(rawWhatsapp);

    if (formattedWhatsapp.length !== 12) {
      setError('Número inválido. Use o formato DDD + número (sem o 9). Ex: 3196812719');
      return;
    }
    

    try {
      const { data, error: authError } = await supabase
        .from('users')
        .select('id, email, whatsapp_number, senha, nome, assinatura_ativa, vencimento_assinatura')
        .eq('whatsapp_number', formattedWhatsapp)
        .single();

      if (authError || !data) {
        setError('Usuário não encontrado');
        return;
      }

      if (data.senha !== senha) {
        setError('Senha incorreta');
        return;
      }

      localStorage.setItem('token', 'user-auth-token');
      localStorage.setItem('userid', data.id.toString());
      localStorage.setItem('userName', data.nome);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f1f5f9] to-[#dbeafe] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="./img/contai-logo.png"
            alt="Logo Contai"
            className="h-20"
          />
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-2">Bem-vindo de volta 👋</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Faça login para acessar sua conta</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="tel"
              value={rawWhatsapp}
              onChange={handleWhatsappChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ex: 3196812719"
              required
            />

            <p className="text-xs text-gray-500 mt-1">DDI 55 será adicionado automaticamente</p>
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
