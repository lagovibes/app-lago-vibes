'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateAdmin, authenticateOwner, saveUserSession } from '@/lib/auth';
import { Building2, User, Lock, Mail, AlertCircle } from 'lucide-react';

type UserType = 'admin' | 'owner';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      // Autenticar APENAS no tipo selecionado (sem misturar validações)
      if (userType === 'admin') {
        // Validar APENAS na tabela de administradores
        result = authenticateAdmin(email, password);
      } else {
        // Validar APENAS na tabela de proprietários
        result = authenticateOwner(email, password);
      }

      if (result.success && result.user) {
        // Salvar sessão (limpa sessões antigas automaticamente)
        saveUserSession(result.user);

        // Redirecionar para dashboard correto baseado no tipo
        if (userType === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/proprietario/dashboard');
        }
      } else {
        setError(result.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">LV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lago Vibes</h1>
          <p className="text-gray-600">Sistema de Gestão</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Seletor de Tipo de Usuário */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Acesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUserType('admin');
                  setError('');
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  userType === 'admin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm font-medium">Administrador</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('owner');
                  setError('');
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  userType === 'owner'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">Proprietário</span>
              </button>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                userType === 'admin'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Informação adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {userType === 'admin' 
                ? 'Acesso exclusivo para administradores do sistema'
                : 'Acesso para proprietários cadastrados no sistema'
              }
            </p>
          </div>
        </div>

        {/* Link para site público */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
