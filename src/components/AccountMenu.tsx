import React, { useEffect, useState } from 'react';
import { UserCircle, LogOut, Settings, User, Mail, Phone } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import dayjs from 'dayjs';
import  supabase  from '../lib/supabaseClient';

export const AccountMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    nome?: string;
    whatsapp_number: string;
    email: string;
    vencimento_assinatura?: string;
    assinatura_ativa?: boolean;
  } | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [nome, setNome] = useState('');

  const userId = localStorage.getItem('userid');

  const fetchUserInfo = async () => {
    if (!userId) return;
  
    try {
      const { data, error } = await supabase
        .from('users')
        .select('nome, email, whatsapp_number, assinatura_ativa, vencimento_assinatura')
        .eq('id', userId)
        .single();
  
      if (error) {
        console.error('Erro ao buscar informações do usuário:', error.message);
        return;
      }
  
      setUserInfo(data);
      setNewEmail(data.email);
      setNome(data.nome || '');
    } catch (error) {
      console.error('Erro inesperado ao buscar usuário:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !userInfo) return;
  
    const updates: any = {
      email: newEmail,
      nome,
      id: userId, // obrigatório para update
    };
  
    try {
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
  
      if (error) {
        alert('Erro ao atualizar dados: ' + error.message);
      } else {
        alert('Dados atualizados com sucesso!');
        setShowSettings(false);
        setSenhaAtual('');
        setNovaSenha('');
        fetchUserInfo();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };  

  const vencimento = userInfo?.vencimento_assinatura;
  const assinaturaVencida = vencimento ? dayjs(vencimento).isBefore(dayjs(), 'day') : true;

  const resetFields = () => {
    setShowSettings(false);
    setSenhaAtual('');
    setNovaSenha('');
    setNewEmail(userInfo?.email || '');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <UserCircle className="w-10 h-10 md:w-12 md:h-12" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b space-y-1">
            <p className="flex items-center text-base font-medium">
              <User className="w-4 h-4 mr-1 text-gray-600" />
              {userInfo?.nome || 'Carregando...'}
            </p>
            <p className="flex items-center text-sm text-green-500 font-bold">
              <Phone className="w-4 h-4 mr-1" />
              {userInfo?.whatsapp_number || 'Carregando...'}
            </p>
            <p className="flex items-center text-xs text-gray-500">
              <Mail className="w-4 h-4 mr-1" />
              {userInfo?.email || ''}
            </p>
          </div>
          <button
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            onClick={() => {
              setShowSettings(true);
              setIsOpen(false);
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      )}

      <Dialog open={showSettings} onClose={resetFields} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <Dialog.Title className="text-xl font-semibold">Minha Conta</Dialog.Title>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Senha atual</label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />

              <label className="block text-sm font-medium text-gray-700">Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="text-sm text-gray-600">
              <strong>Vencimento da assinatura:</strong>{' '}
              {vencimento ? dayjs(vencimento).format('DD/MM/YYYY') : 'Não informado'}
            </div>

            <button
              className={`w-full py-2 rounded-md text-white font-semibold ${assinaturaVencida
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 cursor-default'
                }`}
              disabled={!assinaturaVencida}
            >
              {assinaturaVencida ? 'Renovar a assinatura' : 'Assinatura ativa'}
            </button>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 border rounded-md hover:bg-gray-100"
                onClick={resetFields}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSave}
              >
                Salvar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
