'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, CheckCircle, Clock } from 'lucide-react';
import { mockProperties, mockReservations } from '@/lib/mock-data';
import { isAuthenticated } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Reservation, Property } from '@/lib/types';

interface ReservaComCasa extends Reservation {
  propertyName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ultimasReservas, setUltimasReservas] = useState<ReservaComCasa[]>([]);
  const [stats, setStats] = useState({
    totalCasas: 0,
    casasDisponiveis: 0,
    reservasDoMes: 0,
    reservasFuturas: 0,
  });

  useEffect(() => {
    setMounted(true);
    
    // Verificar se está logado como ADMIN
    if (!isAuthenticated('admin')) {
      router.push('/');
      return;
    }
    
    const hoje = new Date();
    
    const totalCasas = mockProperties.length;
    const casasDisponiveis = mockProperties.filter(p => p.status === 'available').length;
    
    const reservasDoMes = mockReservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn.getMonth() === hoje.getMonth() && checkIn.getFullYear() === hoje.getFullYear();
    }).length;
    
    const reservasFuturas = mockReservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn > hoje;
    }).length;

    setStats({
      totalCasas,
      casasDisponiveis,
      reservasDoMes,
      reservasFuturas,
    });

    // Buscar últimas reservas reais do Supabase (se configurado)
    if (isSupabaseConfigured()) {
      buscarUltimasReservas();
    }
  }, [router]);

  const buscarUltimasReservas = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      console.log('Supabase não configurado');
      return;
    }

    try {
      // Buscar as 3 últimas reservas ordenadas por data de checkout (mais recente primeiro)
      const { data: reservas, error: reservasError } = await supabase
        .from('reservas')
        .select('*')
        .order('checkOut', { ascending: false })
        .limit(3);

      if (reservasError) {
        console.error('Erro ao buscar reservas:', reservasError);
        return;
      }

      if (!reservas || reservas.length === 0) {
        setUltimasReservas([]);
        return;
      }

      // Buscar informações das casas
      const { data: casas, error: casasError } = await supabase
        .from('properties')
        .select('id, name');

      if (casasError) {
        console.error('Erro ao buscar casas:', casasError);
        return;
      }

      // Mapear casas por ID para facilitar busca
      const casasMap = new Map(casas?.map(casa => [casa.id, casa.name]) || []);

      // Combinar reservas com nomes das casas
      const reservasComCasas: ReservaComCasa[] = reservas.map(reserva => ({
        id: reserva.id,
        propertyId: reserva.propertyId,
        clientName: reserva.clientName,
        clientCpf: reserva.clientCpf,
        clientPhone: reserva.clientPhone,
        clientEmail: reserva.clientEmail,
        checkIn: reserva.checkIn,
        checkOut: reserva.checkOut,
        guests: reserva.guests,
        totalValue: reserva.totalValue,
        extras: reserva.extras || [],
        paymentStatus: reserva.paymentStatus,
        createdAt: reserva.createdAt,
        propertyName: casasMap.get(reserva.propertyId) || 'Casa não encontrada',
      }));

      setUltimasReservas(reservasComCasas);
    } catch (error) {
      console.error('Erro ao buscar últimas reservas:', error);
    }
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'casas':
        router.push('/admin/casas');
        break;
      case 'reservas':
        router.push('/admin/reservas');
        break;
      case 'casas-disponiveis':
        router.push('/admin/casas?filter=available');
        break;
      case 'reservas-futuras':
        router.push('/admin/reservas?filter=future');
        break;
    }
  };

  const handleReservaClick = (reservaId: string) => {
    router.push(`/admin/reservas?id=${reservaId}`);
  };

  const statsCards = [
    {
      title: 'Casas Cadastradas',
      value: stats.totalCasas,
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      action: 'casas',
    },
    {
      title: 'Reservas do Mês',
      value: stats.reservasDoMes,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      action: 'reservas',
    },
    {
      title: 'Casas Disponíveis',
      value: stats.casasDisponiveis,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      action: 'casas-disponiveis',
    },
    {
      title: 'Reservas Futuras',
      value: stats.reservasFuturas,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      action: 'reservas-futuras',
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema Lago Vibes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={() => handleCardClick(stat.action)}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </button>
          );
        })}
      </div>

      {/* Últimas Reservas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Últimas Reservas</h2>
        <div className="space-y-4">
          {!isSupabaseConfigured() ? (
            <div className="text-center py-8 text-gray-500">
              Configure o Supabase nas Integrações para ver as reservas reais
            </div>
          ) : ultimasReservas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma reserva encontrada
            </div>
          ) : (
            ultimasReservas.map((reserva) => (
              <button
                key={reserva.id}
                onClick={() => handleReservaClick(reserva.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:shadow-md text-left"
              >
                <div>
                  <p className="font-semibold text-gray-900">{reserva.clientName}</p>
                  <p className="text-sm text-gray-600">{reserva.propertyName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {reserva.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {mounted ? (
                    <p className="text-sm text-gray-600">
                      {new Date(reserva.checkIn).toLocaleDateString('pt-BR')} → {new Date(reserva.checkOut).toLocaleDateString('pt-BR')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">Carregando...</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
