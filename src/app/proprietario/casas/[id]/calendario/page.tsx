'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Calendar as CalendarIcon } from 'lucide-react';

interface BlockedDate {
  propertyId: string;
  date: string;
  type: 'bloqueio_proprietario' | 'bloqueio_admin';
}

export default function ProprietarioCalendarioPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    // Verificar se proprietário tem acesso a esta casa
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
    const savedProperties = localStorage.getItem('properties');
    
    if (savedProperties) {
      const properties = JSON.parse(savedProperties);
      const prop = properties.find((p: any) => p.id === propertyId && p.ownerId === ownerId);
      
      if (!prop) {
        router.push('/proprietario/casas');
        return;
      }
      
      setProperty(prop);
    }

    // Carregar datas bloqueadas
    const savedBlockedDates = localStorage.getItem('blockedDates');
    if (savedBlockedDates) {
      const allBlocked = JSON.parse(savedBlockedDates);
      setBlockedDates(allBlocked.filter((b: BlockedDate) => b.propertyId === propertyId));
    }

    // Carregar reservas
    const savedReservations = localStorage.getItem('reservations');
    if (savedReservations) {
      const allReservations = JSON.parse(savedReservations);
      setReservations(allReservations.filter((r: any) => r.propertyId === propertyId));
    }
  }, [propertyId, router]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(b => b.date === dateStr);
  };

  const isDateReserved = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    
    return reservations.some(r => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return date >= checkIn && date <= checkOut;
    });
  };

  const toggleBlockDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isBlocked = isDateBlocked(date);
    
    let updatedBlocked: BlockedDate[];
    
    if (isBlocked) {
      // Remover bloqueio
      updatedBlocked = blockedDates.filter(b => b.date !== dateStr);
    } else {
      // Adicionar bloqueio do tipo "bloqueio_proprietario"
      updatedBlocked = [...blockedDates, {
        propertyId,
        date: dateStr,
        type: 'bloqueio_proprietario'
      }];
    }
    
    setBlockedDates(updatedBlocked);
    
    // Salvar no localStorage (todas as datas bloqueadas)
    const savedBlockedDates = localStorage.getItem('blockedDates');
    const allBlocked = savedBlockedDates ? JSON.parse(savedBlockedDates) : [];
    const otherBlocked = allBlocked.filter((b: BlockedDate) => b.propertyId !== propertyId);
    const newAllBlocked = [...otherBlocked, ...updatedBlocked];
    localStorage.setItem('blockedDates', JSON.stringify(newAllBlocked));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (!property) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
        <p className="text-gray-600">
          Gerencie o calendário e bloqueie datas indisponíveis
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Legenda</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-lg"></div>
            <span className="text-sm text-gray-700">Disponível</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 border-2 border-red-500 rounded-lg"></div>
            <span className="text-sm text-gray-700">Reservado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 border-2 border-gray-400 rounded-lg"></div>
            <span className="text-sm text-gray-700">Bloqueado por você</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(year, month, day);
            const isBlocked = isDateBlocked(date);
            const isReserved = isDateReserved(date);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            let bgColor = 'bg-green-100 border-green-500 hover:bg-green-200';
            let textColor = 'text-gray-900';
            
            if (isPast) {
              bgColor = 'bg-gray-50 border-gray-200';
              textColor = 'text-gray-400';
            } else if (isReserved) {
              bgColor = 'bg-red-100 border-red-500';
            } else if (isBlocked) {
              bgColor = 'bg-gray-200 border-gray-400 hover:bg-gray-300';
            }

            return (
              <button
                key={day}
                onClick={() => !isPast && !isReserved && toggleBlockDate(date)}
                disabled={isPast || isReserved}
                className={`aspect-square flex items-center justify-center border-2 rounded-lg transition-all ${bgColor} ${textColor} ${
                  isPast || isReserved ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <span className="font-semibold">{day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Como usar o calendário</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Clique em uma data <strong>verde</strong> para bloqueá-la</li>
              <li>• Clique em uma data <strong>cinza</strong> para desbloquear</li>
              <li>• Datas <strong>vermelhas</strong> estão reservadas e não podem ser bloqueadas</li>
              <li>• Datas bloqueadas por você aparecerão como <strong>cinza</strong> no painel do administrador</li>
              <li>• No site público, datas bloqueadas aparecerão como <strong>indisponíveis</strong> (vermelhas)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
