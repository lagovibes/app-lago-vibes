'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface BackupData {
  casas: any[];
  reservas: any[];
  extras: any[];
  proprietarios: any[];
}

export default function BackupPage() {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar dados atuais para exportação
    loadCurrentData();
  }, []);

  const loadCurrentData = () => {
    try {
      const casas = JSON.parse(localStorage.getItem('properties') || '[]');
      const reservas = JSON.parse(localStorage.getItem('reservations') || '[]');
      const extras = JSON.parse(localStorage.getItem('extras') || '[]');
      const proprietarios = JSON.parse(localStorage.getItem('owners') || '[]');

      const backup: BackupData = {
        casas,
        reservas,
        extras,
        proprietarios
      };

      setExportData(JSON.stringify(backup, null, 2));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do sistema' });
    }
  };

  const handleExport = () => {
    try {
      // Recarregar dados mais recentes
      loadCurrentData();
      setMessage({ type: 'success', text: 'Dados exportados com sucesso! Copie o JSON abaixo.' });
      
      // Auto-scroll para o textarea
      setTimeout(() => {
        const textarea = document.getElementById('export-textarea');
        if (textarea) {
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar dados' });
    }
  };

  const handleImport = () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Validar se é um JSON válido
      const parsedData = JSON.parse(importData);

      // Validar estrutura do JSON
      if (!parsedData.casas || !parsedData.reservas || !parsedData.extras || !parsedData.proprietarios) {
        throw new Error('JSON inválido: estrutura incorreta. Certifique-se de que contém: casas, reservas, extras e proprietarios');
      }

      // Validar se são arrays
      if (
        !Array.isArray(parsedData.casas) ||
        !Array.isArray(parsedData.reservas) ||
        !Array.isArray(parsedData.extras) ||
        !Array.isArray(parsedData.proprietarios)
      ) {
        throw new Error('JSON inválido: todos os campos devem ser arrays');
      }

      // Confirmar antes de substituir
      if (!confirm('⚠️ ATENÇÃO: Isso irá substituir TODOS os dados atuais do sistema. Deseja continuar?')) {
        setIsLoading(false);
        return;
      }

      // Substituir dados no localStorage
      localStorage.setItem('properties', JSON.stringify(parsedData.casas));
      localStorage.setItem('reservations', JSON.stringify(parsedData.reservas));
      localStorage.setItem('extras', JSON.stringify(parsedData.extras));
      localStorage.setItem('owners', JSON.stringify(parsedData.proprietarios));

      // Atualizar dados de exportação
      loadCurrentData();

      setMessage({
        type: 'success',
        text: `✅ Backup importado com sucesso! ${parsedData.casas.length} casas, ${parsedData.reservas.length} reservas, ${parsedData.extras.length} extras e ${parsedData.proprietarios.length} proprietários foram restaurados.`
      });

      // Limpar campo de importação
      setImportData('');

      // Recarregar página após 2 segundos para atualizar todas as telas
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `❌ Erro ao importar: ${error.message || 'JSON inválido ou formato incorreto'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Tentar usar a Clipboard API moderna
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(exportData);
        setMessage({ type: 'success', text: '📋 JSON copiado para a área de transferência!' });
      } else {
        // Fallback para navegadores que não suportam ou contextos não seguros
        const textarea = document.createElement('textarea');
        textarea.value = exportData;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setMessage({ type: 'success', text: '📋 JSON copiado para a área de transferência!' });
          } else {
            throw new Error('Comando de cópia falhou');
          }
        } catch (err) {
          setMessage({ 
            type: 'error', 
            text: '❌ Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente o texto.' 
          });
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: '❌ Não foi possível copiar automaticamente. Por favor, selecione e copie manualmente o texto.' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup e Restauração</h1>
        <p className="text-gray-600">
          Exporte e importe todos os dados do sistema (casas, reservas, extras e proprietários)
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Exportar Backup</h2>
              <p className="text-sm text-gray-600">
                Visualize e copie todos os dados do sistema
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2"
          >
            <Database className="w-5 h-5" />
            Atualizar Exportação
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              JSON Completo (Somente Leitura)
            </label>
            <button
              onClick={copyToClipboard}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              📋 Copiar JSON
            </button>
          </div>
          <textarea
            id="export-textarea"
            value={exportData}
            readOnly
            className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Os dados exportados aparecerão aqui..."
          />
          <p className="text-xs text-gray-500">
            💡 Copie este JSON e salve em um local seguro para fazer backup dos seus dados
          </p>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Upload className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Importar Backup</h2>
            <p className="text-sm text-gray-600">
              Cole um JSON de backup para restaurar os dados
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Cole o JSON do Backup
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder='Cole aqui o JSON completo do backup, exemplo:
{
  "casas": [...],
  "reservas": [...],
  "extras": [...],
  "proprietarios": [...]
}'
          />
          <p className="text-xs text-gray-500">
            ⚠️ O JSON deve conter as chaves: casas, reservas, extras e proprietarios
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={!importData.trim() || isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Importar Backup
            </>
          )}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Atenção:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Esta ação irá <strong>substituir TODOS os dados atuais</strong></li>
                <li>Faça um backup antes de importar novos dados</li>
                <li>O sistema será recarregado após a importação</li>
                <li>Certifique-se de que o JSON está no formato correto</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Como usar esta funcionalidade
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>1. Exportar:</strong> Clique em "Atualizar Exportação" para ver os dados atuais no formato JSON</p>
          <p><strong>2. Copiar:</strong> Use o botão "Copiar JSON" ou selecione e copie manualmente</p>
          <p><strong>3. Salvar:</strong> Cole o JSON em um arquivo .txt ou .json e salve em local seguro</p>
          <p><strong>4. Importar:</strong> Cole um JSON de backup no campo de importação</p>
          <p><strong>5. Restaurar:</strong> Clique em "Importar Backup" para substituir os dados atuais</p>
        </div>
      </div>
    </div>
  );
}
