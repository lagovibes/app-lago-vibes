'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FinancialData {
  totalRecebido: number;
  totalPendente: number;
  proximosPagamentos: Array<{
    propertyName: string;
    guestName: string;
    amount: number;
    date: string;
  }>;
}

export default function ProprietarioFinanceiroPage() {
  const router = useRouter();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRecebido: 0,
    totalPendente: 0,
    proximosPagamentos: [],
  });

  useEffect(() => {
    // Verificar se está logado
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      router.push('/proprietario');
      return;
    }

    const session = JSON.parse(userSession);
    if (session.role !== 'owner') {
      router.push('/proprietario');
      return;
    }

    const ownerId = session.id;

    // Buscar casas e reservas do proprietário
    const savedProperties = localStorage.getItem('properties');
    const savedReservations = localStorage.getItem('reservations');

    if (savedProperties && savedReservations) {
      const properties = JSON.parse(savedProperties);
      const allReservations = JSON.parse(savedReservations);
      
      // Filtrar apenas casas do proprietário logado
      const ownerPropertyIds = properties
        .filter((p: any) => p.ownerId === ownerId)
        .map((p: any) => p.id);

      let totalRecebido = 0;
      let totalPendente = 0;
      const proximosPagamentos: any[] = [];

      // Processar reservas das casas do proprietário
      allReservations.forEach((reservation: any) => {
        if (ownerPropertyIds.includes(reservation.propertyId)) {
          const property = properties.find((p: any) => p.id === reservation.propertyId);
          
          // Usar os campos corretos da reserva
          const valorPagoProprietario = reservation.ownerPaidValue || 0;
          const valorRepasseProprietario = reservation.ownerTotalValue || 0;
          const valorRestanteProprietario = valorRepasseProprietario - valorPagoProprietario;
          
          totalRecebido += valorPagoProprietario;
          totalPendente += valorRestanteProprietario;

          // Adicionar aos próximos pagamentos se houver valor pendente
          if (valorRestanteProprietario > 0) {
            proximosPagamentos.push({
              propertyName: property?.name || 'Casa não encontrada',
              guestName: reservation.clientName,
              amount: valorRestanteProprietario,
              date: reservation.checkOut, // Usar data de check-out como referência
            });
          }
        }
      });

      // Ordenar próximos pagamentos por data
      proximosPagamentos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setFinancialData({
        totalRecebido,
        totalPendente,
        proximosPagamentos: proximosPagamentos.slice(0, 5), // Mostrar apenas os 5 próximos
      });
    }
  }, [router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
        <p className="text-gray-600">
          Acompanhe seus recebimentos e valores pendentes
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {financialData.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Valor total já recebido de todas as reservas
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pendente</p>
              <p className="text-3xl font-bold text-orange-600">
                R$ {financialData.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Valor total ainda não recebido
          </p>
        </div>
      </div>

      {/* Próximos Pagamentos */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Próximos Pagamentos</h2>
        </div>

        {financialData.proximosPagamentos.length > 0 ? (
          <div className="space-y-4">
            {financialData.proximosPagamentos.map((pagamento, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {pagamento.propertyName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Cliente: {pagamento.guestName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Previsão: {formatDate(pagamento.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">
                    R$ {pagamento.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">a receber</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum pagamento pendente no momento</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Informações Importantes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Os valores mostrados são apenas para visualização</li>
              <li>• Os pagamentos são gerenciados pelo administrador</li>
              <li>• As datas de pagamento são estimativas baseadas no check-out</li>
              <li>• Entre em contato com o administrador para mais detalhes sobre pagamentos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
