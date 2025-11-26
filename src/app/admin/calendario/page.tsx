'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
}

interface Reservation {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  clientName: string;
  status?: string;
  paymentStatus?: string;
}

interface BlockedDate {
  propertyId: string;
  date: string;
  type: 'bloqueio_proprietario' | 'bloqueio_admin';
}

export default function CalendarioPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

  useEffect(() => {
    // Carregar casas do localStorage
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
    }

    // Carregar reservas do localStorage
    const storedReservations = localStorage.getItem('reservations');
    if (storedReservations) {
      setReservations(JSON.parse(storedReservations));
    }

    // Carregar datas bloqueadas
    const savedBlockedDates = localStorage.getItem('blockedDates');
    if (savedBlockedDates) {
      setBlockedDates(JSON.parse(savedBlockedDates));
    }
  }, []);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  // Função para verificar se uma data está bloqueada pelo proprietário
  const isDateBlockedByOwner = (propertyId: string, day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const checkDate = new Date(year, month, day);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    return blockedDates.some(b => 
      b.propertyId === propertyId && 
      b.date === dateStr && 
      b.type === 'bloqueio_proprietario'
    );
  };

  // Função para verificar se uma data está entre check-in e check-out (INCLUSIVE)
  const getReservationForDate = (propertyId: string, day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const checkDate = new Date(year, month, day);
    // Normalizar para meia-noite para comparação correta
    checkDate.setHours(0, 0, 0, 0);

    return reservations.find(reservation => {
      if (reservation.propertyId !== propertyId) return false;
      
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      
      // Normalizar datas para meia-noite
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      // Verificar se a data está entre check-in e check-out (INCLUSIVE)
      return checkDate >= checkIn && checkDate <= checkOut;
    });
  };

  const isDateReserved = (propertyId: string, day: number) => {
    return !!getReservationForDate(propertyId, day);
  };

  const handleDayClick = (propertyId: string, day: number) => {
    // Verificar se está bloqueado pelo proprietário
    if (isDateBlockedByOwner(propertyId, day)) {
      alert('Esta data foi bloqueada pelo proprietário e não pode ser reservada.');
      return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDate = new Date(year, month, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const reservation = getReservationForDate(propertyId, day);

    if (reservation) {
      // Dia ocupado - abrir tela de edição da reserva
      router.push(`/admin/reservas/${reservation.id}/editar`);
    } else {
      // Dia disponível - abrir tela de nova reserva com casa e data preenchidas
      router.push(`/admin/reservas/nova?propertyId=${propertyId}&checkIn=${formattedDate}`);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  // Filtrar propriedades baseado na seleção
  const filteredProperties = selectedPropertyId === 'all' 
    ? properties 
    : properties.filter(p => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário de Ocupação</h1>
        <p className="text-gray-600">Visualize a ocupação de todas as casas</p>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Filtro de Casas */}
        {properties.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label htmlFor="property-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por Casa
            </label>
            <select
              id="property-filter"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Casas</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Disponível (clique para criar reserva)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Ocupado (clique para ver/editar reserva)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-600">Bloqueado pelo proprietário</span>
          </div>
        </div>

        {/* Properties Calendar */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhuma casa cadastrada ainda.</p>
            <button
              onClick={() => router.push('/admin/casas/nova')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Cadastrar Primeira Casa
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProperties.map(property => (
              <div key={property.id} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-4">{property.name}</h3>
                
                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {days.map(day => {
                    const isReserved = isDateReserved(property.id, day);
                    const isBlocked = isDateBlockedByOwner(property.id, day);
                    const isToday = 
                      day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();

                    let bgColor = 'bg-green-500 hover:bg-green-600';
                    let textColor = 'text-white';
                    
                    if (isReserved) {
                      bgColor = 'bg-red-500 hover:bg-red-600';
                    } else if (isBlocked) {
                      bgColor = 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed';
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => handleDayClick(property.id, day)}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${bgColor} ${textColor} ${
                          !isBlocked ? 'cursor-pointer hover:scale-105' : ''
                        } ${
                          isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
