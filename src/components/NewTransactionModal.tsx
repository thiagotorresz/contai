import React, { useState } from 'react';
import { X } from 'lucide-react';
import supabase from '../lib/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newTransaction: any) => void;
}

export const NewTransactionModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    descricao: '',
    valor: 0,
    categoria: '',
    data: '',
    tipo: 'receita',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatValor = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userid = localStorage.getItem('userid');

    if (!userid) {
      alert('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert([
          {
            ...form,
            userid,
            criado_em: new Date().toISOString(), // ou use `form.data` se quiser
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onAdd(data); // Adiciona a nova transação à lista no componente pai
      onClose();
      window.location.reload(); // Recarrega a página para buscar as novas transações
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg p-6 w-full max-w-md relative ${
          form.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Nova Transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Valor"
            value={formatValor(form.valor)}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              setForm({ ...form, valor: value ? parseFloat(value) / 100 : 0 });
            }}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <div className="flex justify-between mb-4">
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded ${
                form.tipo === 'receita' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setForm({ ...form, tipo: 'receita' })}
            >
              Receita
            </button>
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded ${
                form.tipo === 'despesa' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setForm({ ...form, tipo: 'despesa' })}
            >
              Despesa
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
};
