'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  propertyId: string;
  clientName: string;
  checkIn: string;
  checkOut: string;
  totalValue: number;
  paidValue?: number;
  ownerTotalValue?: number;
  ownerPaidValue?: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

export default function FinanceiroPage() {
  const [mounted, setMounted] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Carregar casas
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
    }

    // Carregar reservas
    const storedReservations = localStorage.getItem('reservations');
    if (storedReservations) {
      const allReservations = JSON.parse(storedReservations);
      setReservations(allReservations);

      // Calcular totais baseado nos valores SALVOS nas reservas
      let recebido = 0;
      let pendente = 0;

      allReservations.forEach((reservation: Reservation) => {
        const valorPagoCliente = reservation.paidValue || 0;
        const valorTotalReserva = reservation.totalValue || 0;
        const valorRestanteCliente = valorTotalReserva - valorPagoCliente;

        recebido += valorPagoCliente;
        pendente += valorRestanteCliente;
      });

      setTotalRecebido(recebido);
      setTotalPendente(pendente);
    }
  }, []);

  // Filtrar reservas com pagamento pendente
  const proximosPagamentos = reservations.filter(r => {
    const valorTotalReserva = r.totalValue || 0;
    const valorPagoCliente = r.paidValue || 0;
    const valorRestanteCliente = valorTotalReserva - valorPagoCliente;
    return valorRestanteCliente > 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
        <p className="text-gray-600">
          Visão geral dos pagamentos e valores pendentes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Recebido */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
              Recebido
            </span>
          </div>
          <h3 className="text-sm text-green-700 mb-2 font-semibold">Total Recebido</h3>
          <p className="text-4xl font-bold text-green-900">
            R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-green-600 mt-2">
            Soma de todos os valores pagos pelos clientes
          </p>
        </div>

        {/* Total Pendente */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
              Pendente
            </span>
          </div>
          <h3 className="text-sm text-orange-700 mb-2 font-semibold">Total Pendente</h3>
          <p className="text-4xl font-bold text-orange-900">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-orange-600 mt-2">
            Soma de todos os valores restantes a receber
          </p>
        </div>
      </div>

      {/* Próximos Pagamentos */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Próximos Pagamentos ({proximosPagamentos.length})
          </h2>
        </div>

        {proximosPagamentos.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pagamento pendente
            </h3>
            <p className="text-gray-600">
              Todas as reservas estão com pagamentos em dia!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proximosPagamentos.map((reservation) => {
              const property = properties.find(p => p.id === reservation.propertyId);
              const valorTotalReserva = reservation.totalValue || 0;
              const valorPagoCliente = reservation.paidValue || 0;
              const valorRestanteCliente = valorTotalReserva - valorPagoCliente;

              return (
                <Link
                  key={reservation.id}
                  href={`/admin/reservas?id=${reservation.id}`}
                  className="block bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {reservation.clientName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {property?.name || 'Casa não encontrada'}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Check-in: {formatDate(reservation.checkIn)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Check-out: {formatDate(reservation.checkOut)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Valor Restante</p>
                        <p className="text-2xl font-bold text-orange-700">
                          R$ {valorRestanteCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Já Pago</p>
                        <p className="text-sm font-semibold text-green-700">
                          R$ {valorPagoCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo Geral */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Resumo Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-blue-700 mb-1">Total de Reservas</p>
            <p className="text-3xl font-bold text-blue-900">{reservations.length}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700 mb-1">Reservas com Pendências</p>
            <p className="text-3xl font-bold text-orange-700">{proximosPagamentos.length}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700 mb-1">Valor Total Esperado</p>
            <p className="text-3xl font-bold text-blue-900">
              R$ {(totalRecebido + totalPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
