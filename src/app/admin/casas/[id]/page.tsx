'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, MapPin, Users, Bed, Bath, DollarSign, Edit, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  ownerId: string;
  ownerPercentage?: number;
  status: 'available' | 'unavailable';
  extras: string[];
  images: string[];
}

interface Reservation {
  id: string;
  propertyId: string;
  clientName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalValue: number;
}

interface Owner {
  id: string;
  name: string;
  phone: string;
  percentage: number;
}

interface DayData {
  day: number;
  date: Date;
  isReserved: boolean;
  isToday: boolean;
  reservationId?: string | null;
}

export default function CasaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  useEffect(() => {
    // Carregar casa
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      const properties: Property[] = JSON.parse(storedProperties);
      const foundProperty = properties.find(p => p.id === id);
      setProperty(foundProperty || null);

      // Carregar proprietário
      if (foundProperty) {
        const storedOwners = localStorage.getItem('owners');
        if (storedOwners) {
          const owners: Owner[] = JSON.parse(storedOwners);
          const foundOwner = owners.find(o => o.id === foundProperty.ownerId);
          setOwner(foundOwner || null);
        }
      }
    }

    // Carregar reservas desta casa
    const storedReservations = localStorage.getItem('reservations');
    if (storedReservations) {
      const allReservations: Reservation[] = JSON.parse(storedReservations);
      const propertyReservations = allReservations.filter(r => r.propertyId === id);
      setReservations(propertyReservations);
    }
  }, [id]);

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Casa não encontrada</h2>
      </div>
    );
  }

  // Função para verificar se uma data está reservada e retornar o ID da reserva
  const getReservationForDate = (date: Date): string | null => {
    const reservation = reservations.find(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      return currentDate >= checkIn && currentDate <= checkOut;
    });
    return reservation ? reservation.id : null;
  };

  // Função para verificar se uma data está disponível para seleção
  const isDateAvailable = (date: Date): boolean => {
    return !getReservationForDate(date);
  };

  // Função para lidar com clique em uma data
  const handleDateClick = (dayData: DayData) => {
    const clickedDate = new Date(dayData.date);
    clickedDate.setHours(0, 0, 0, 0);

    // Se a data está reservada, abrir a reserva
    if (dayData.reservationId) {
      router.push(`/admin/reservas/${dayData.reservationId}/editar`);
      return;
    }

    // Se não há check-in selecionado, selecionar como check-in
    if (!selectedCheckIn) {
      setSelectedCheckIn(clickedDate);
      setSelectedCheckOut(null);
      return;
    }

    // Se já tem check-in mas não tem check-out
    if (selectedCheckIn && !selectedCheckOut) {
      // Se clicou na mesma data, desselecionar
      if (clickedDate.getTime() === selectedCheckIn.getTime()) {
        setSelectedCheckIn(null);
        return;
      }

      // Se clicou em data anterior ao check-in, trocar
      if (clickedDate < selectedCheckIn) {
        setSelectedCheckIn(clickedDate);
        return;
      }

      // Verificar se há reservas entre check-in e check-out
      const hasReservationBetween = reservations.some(reservation => {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        return (checkIn > selectedCheckIn && checkIn < clickedDate) ||
               (checkOut > selectedCheckIn && checkOut < clickedDate);
      });

      if (hasReservationBetween) {
        alert('Não é possível selecionar este período pois há reservas entre as datas.');
        return;
      }

      // Selecionar como check-out e redirecionar
      setSelectedCheckOut(clickedDate);
      
      // Redirecionar para nova reserva com dados preenchidos
      const checkInStr = selectedCheckIn.toISOString().split('T')[0];
      const checkOutStr = clickedDate.toISOString().split('T')[0];
      router.push(`/admin/reservas/nova?propertyId=${id}&checkIn=${checkInStr}&checkOut=${checkOutStr}`);
      return;
    }

    // Se já tem check-in e check-out, resetar e começar novo
    setSelectedCheckIn(clickedDate);
    setSelectedCheckOut(null);
  };

  // Gerar calendário do mês
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let day = 1;

    // Preencher semanas
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < startingDayOfWeek) || day > daysInMonth) {
          weekDays.push(null);
        } else {
          const currentDate = new Date(year, month, day);
          currentDate.setHours(0, 0, 0, 0);
          const reservationId = getReservationForDate(currentDate);
          const isReserved = !!reservationId;
          const isToday = 
            currentDate.getDate() === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          weekDays.push({
            day,
            date: currentDate,
            isReserved,
            isToday,
            reservationId
          });
          day++;
        }
      }
      calendar.push(weekDays);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  // Verificar se uma data está selecionada
  const isDateSelected = (date: Date): boolean => {
    if (!selectedCheckIn) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const checkInDate = new Date(selectedCheckIn);
    checkInDate.setHours(0, 0, 0, 0);
    
    if (!selectedCheckOut) {
      return checkDate.getTime() === checkInDate.getTime();
    }
    
    const checkOutDate = new Date(selectedCheckOut);
    checkOutDate.setHours(0, 0, 0, 0);
    return checkDate >= checkInDate && checkDate <= checkOutDate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/casas"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
          <p className="text-gray-600">Detalhes completos da propriedade</p>
        </div>
        <Link
          href={`/admin/casas/${property.id}/editar`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Edit className="w-5 h-5" />
          Editar Casa
        </Link>
      </div>

      {/* Images */}
      {property.images && property.images.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-96 bg-gray-200">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Localização</p>
                <p className="font-semibold text-gray-900">{property.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Capacidade</p>
                <p className="font-semibold text-gray-900">{property.capacity} pessoas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Bed className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Quartos</p>
                <p className="font-semibold text-gray-900">{property.bedrooms} quartos ({property.suites} suítes)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Bath className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Banheiros</p>
                <p className="font-semibold text-gray-900">{property.bathrooms} banheiros</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {property.status === 'available' ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Valores</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Diária Semana</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">R$ {property.weekdayPrice.toLocaleString('pt-BR')}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Diária Fim de Semana</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">R$ {property.weekendPrice.toLocaleString('pt-BR')}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Diária Feriado</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">R$ {property.holidayPrice.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proprietário */}
      {owner && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Proprietário</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{owner.name}</p>
              <p className="text-gray-600">{owner.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Percentual de Repasse</p>
              <p className="text-2xl font-bold text-green-600">{property.ownerPercentage || owner.percentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Descrição */}
      {property.description && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição</h2>
          <p className="text-gray-700 leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* Calendário de Reservas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Calendário Interativo</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Selecionado</span>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900 font-medium">
            💡 <strong>Como usar:</strong> Clique em uma data disponível (verde) para selecionar check-in, depois clique em outra para check-out. 
            Clique em uma data reservada (vermelha) para ver/editar a reserva.
          </p>
          {selectedCheckIn && !selectedCheckOut && (
            <p className="text-sm text-blue-700 mt-2">
              ✓ Check-in selecionado: {selectedCheckIn.toLocaleDateString('pt-BR')}. Agora selecione o check-out.
            </p>
          )}
        </div>

        {/* Navegação do Calendário */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            ← Anterior
          </button>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Próximo →
          </button>
        </div>

        {/* Calendário */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Dias da Semana */}
          <div className="grid grid-cols-7 bg-gray-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do Mês */}
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-t border-gray-200">
              {week.map((dayData, dayIndex) => (
                <div
                  key={dayIndex}
                  onClick={() => dayData && handleDateClick(dayData)}
                  className={`p-3 min-h-[80px] border-r border-gray-200 last:border-r-0 transition-all ${
                    dayData 
                      ? dayData.isReserved 
                        ? 'bg-red-50 cursor-pointer hover:bg-red-100' 
                        : isDateSelected(dayData.date)
                        ? 'bg-blue-100 cursor-pointer hover:bg-blue-200'
                        : 'bg-white cursor-pointer hover:bg-green-50' 
                      : 'bg-gray-50'
                  }`}
                >
                  {dayData && (
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-semibold mb-1 ${
                        dayData.isToday 
                          ? 'text-blue-600' 
                          : dayData.isReserved 
                          ? 'text-red-600' 
                          : isDateSelected(dayData.date)
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        {dayData.day}
                      </span>
                      {dayData.isReserved && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                      {!dayData.isReserved && isDateSelected(dayData.date) && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                      {dayData.isToday && (
                        <div className="text-xs text-blue-600 font-medium">Hoje</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Reservas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Reservas Ativas</h2>
          <Link
            href={`/admin/reservas/nova?propertyId=${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Reserva
          </Link>
        </div>
        
        {reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map(reservation => (
              <Link
                key={reservation.id}
                href={`/admin/reservas/${reservation.id}/editar`}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-gray-900">{reservation.clientName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">{reservation.guests} hóspedes</p>
                </div>
                <div className="mt-3 md:mt-0 text-left md:text-right">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-semibold text-gray-900">R$ {reservation.totalValue.toLocaleString('pt-BR')}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Nenhuma reserva ativa para esta casa</p>
        )}
      </div>
    </div>
  );
}
