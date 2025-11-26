'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function ProprietarioDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCasas: 0,
    reservasAtivas: 0,
    totalRecebido: 0,
    totalPendente: 0,
  });
  const [ownerName, setOwnerName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Verificar se está logado como PROPRIETÁRIO
    if (!isAuthenticated('owner')) {
      router.push('/');
      return;
    }

    // Obter dados da sessão
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      router.push('/');
      return;
    }

    const session = JSON.parse(userSession);
    if (session.role !== 'owner') {
      router.push('/');
      return;
    }

    const ownerId = session.id;
    setOwnerName(session.name || 'Proprietário');

    // Buscar casas do proprietário usando ownerId
    const savedProperties = localStorage.getItem('properties');
    const savedReservations = localStorage.getItem('reservations');

    if (savedProperties) {
      const properties = JSON.parse(savedProperties);
      // Filtrar casas onde ownerId corresponde ao ID do proprietário logado
      const ownerProperties = properties.filter((p: any) => p.ownerId === ownerId);
      
      let reservasAtivas = 0;
      let totalRecebido = 0;
      let totalPendente = 0;

      if (savedReservations) {
        const reservations = JSON.parse(savedReservations);
        const ownerPropertyIds = ownerProperties.map((p: any) => p.id);
        
        // Filtrar reservas das casas do proprietário
        reservations.forEach((reservation: any) => {
          if (ownerPropertyIds.includes(reservation.propertyId)) {
            // Contar reservas ativas (confirmadas e futuras)
            const checkOut = new Date(reservation.checkOut);
            const hoje = new Date();
            if (checkOut >= hoje && reservation.paymentStatus !== 'cancelled') {
              reservasAtivas++;
            }
            
            // Calcular valores usando os campos corretos da reserva
            const valorPagoProprietario = reservation.ownerPaidValue || 0;
            const valorRepasseProprietario = reservation.ownerTotalValue || 0;
            const valorRestanteProprietario = valorRepasseProprietario - valorPagoProprietario;
            
            totalRecebido += valorPagoProprietario;
            totalPendente += valorRestanteProprietario;
          }
        });
      }

      setStats({
        totalCasas: ownerProperties.length,
        reservasAtivas,
        totalRecebido,
        totalPendente,
      });
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {ownerName}!
        </h1>
        <p className="text-gray-600">
          Visão geral das suas propriedades e reservas
        </p>
      </div>

      {/* Stats Grid - Todos clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/proprietario/casas"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Minhas Casas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCasas}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Home className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/proprietario/reservas"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reservas Ativas</p>
              <p className="text-3xl font-bold text-blue-600">{stats.reservasAtivas}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/proprietario/financeiro"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {stats.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link
          href="/proprietario/financeiro"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pendente</p>
              <p className="text-3xl font-bold text-orange-600">
                R$ {stats.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/proprietario/casas"
            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Home className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-gray-900">Minhas Casas</p>
              <p className="text-sm text-gray-600">Ver e gerenciar casas</p>
            </div>
          </Link>

          <Link
            href="/proprietario/reservas"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Reservas</p>
              <p className="text-sm text-gray-600">Ver todas as reservas</p>
            </div>
          </Link>

          <Link
            href="/proprietario/financeiro"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Financeiro</p>
              <p className="text-sm text-gray-600">Ver detalhes financeiros</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
