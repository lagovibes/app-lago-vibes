'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getWhatsAppLink } from '@/lib/utils-format';
import { Calendar, ArrowLeft, MessageCircle, MapPin, Users, Bed, X } from 'lucide-react';
import type { Property, Reservation } from '@/lib/types';

interface BlockedDate {
  propertyId: string;
  date: string;
  type: 'bloqueio_proprietario' | 'bloqueio_admin';
}

export default function DisponibilidadeContent() {
  const searchParams = useSearchParams();
  const preSelectedPropertyId = searchParams.get('propertyId');

  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateAction, setShowDateAction] = useState(false);
  const [clickedDateInfo, setClickedDateInfo] = useState<{ date: Date; isOccupied: boolean; reservation?: Reservation } | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar casas, reservas e bloqueios - EXECUTA APENAS UMA VEZ
  useEffect(() => {
    const loadData = () => {
      try {
        const storedProperties = localStorage.getItem('properties');
        const storedReservations = localStorage.getItem('reservations');
        const storedBlockedDates = localStorage.getItem('blockedDates');
        
        if (storedProperties) {
          const parsedProperties = JSON.parse(storedProperties);
          setProperties(parsedProperties);
          
          // Se vier propertyId na URL, selecionar automaticamente e mostrar calendário
          if (preSelectedPropertyId) {
            const propertyExists = parsedProperties.some((p: Property) => p.id === preSelectedPropertyId);
            if (propertyExists) {
              setSelectedProperty(preSelectedPropertyId);
              setShowCalendar(true); // Mostrar calendário automaticamente
            }
          }
        }
        
        if (storedReservations) {
          setReservations(JSON.parse(storedReservations));
        }

        // Carregar datas bloqueadas pelo proprietário e admin
        if (storedBlockedDates) {
          setBlockedDates(JSON.parse(storedBlockedDates));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [preSelectedPropertyId]);

  const selectedPropertyData = properties.find(p => p.id === selectedProperty);

  // Função para verificar se uma data está bloqueada
  const isDateBlocked = (date: Date): boolean => {
    if (!selectedProperty) return false;

    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(
      blocked => blocked.propertyId === selectedProperty && blocked.date === dateStr
    );
  };

  // Função para obter reserva de uma data específica
  const getReservationForDate = (date: Date): Reservation | null => {
    if (!selectedProperty) return null;

    const dateStr = date.toISOString().split('T')[0];
    
    const reservation = reservations.find(reservation => {
      if (reservation.propertyId !== selectedProperty) return false;
      
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      
      // Normalizar datas para comparação (remover horas)
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate >= checkIn && currentDate <= checkOut;
    });

    return reservation || null;
  };

  // Função para verificar se uma data está ocupada (reservada OU bloqueada)
  const isDateOccupied = (date: Date): boolean => {
    return getReservationForDate(date) !== null || isDateBlocked(date);
  };

  // Gerar dias do mês selecionado
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    // Ajustar para iniciar a semana na Segunda-feira
let startingDayOfWeek = firstDay.getDay();
startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = [];
    
    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isBlocked = isDateBlocked(date);
      const reservation = getReservationForDate(date);
      const isOccupied = reservation !== null || isBlocked;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push({
        day,
        date,
        isOccupied,
        isPast,
        isAvailable: !isOccupied && !isPast,
        reservation,
        isBlocked
      });
    }
    
    return days;
  };

  const calendarDays = selectedProperty && showCalendar ? generateCalendarDays() : [];

  // Função para lidar com clique no botão "Consultar Datas"
  const handleConsultarDatas = () => {
    if (selectedProperty) {
      setShowCalendar(true);
    }
  };

  // Função para lidar com clique em data
  const handleDateClick = (dayData: any) => {
    if (!dayData || dayData.isPast) return;

    setClickedDateInfo({
      date: dayData.date,
      isOccupied: dayData.isOccupied,
      reservation: dayData.reservation
    });
    setShowDateAction(true);
  };

  // Função para gerar link do WhatsApp com data selecionada
  const getWhatsAppLinkWithDate = () => {
    if (!selectedPropertyData || !clickedDateInfo) return '#';

    const dateStr = clickedDateInfo.date.toLocaleDateString('pt-BR');
    const propertyUrl = `${window.location.origin}/casa/${selectedPropertyData.id}`;
    const message = `Olá! Gostaria de consultar disponibilidade para:\n\n🏠 Casa: ${selectedPropertyData.name}\n📅 Data: ${dateStr}\n🔗 Link: ${propertyUrl}`;
    
    const whatsappNumber = selectedPropertyData.whatsappNumber || '61999999999';
    return getWhatsAppLink(whatsappNumber, message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando disponibilidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">LV</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Lago Vibes
              </span>
            </Link>
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Consultar Disponibilidade
          </h1>
          <p className="text-lg text-gray-600">
            {preSelectedPropertyId && selectedPropertyData 
              ? `Calendário de disponibilidade para ${selectedPropertyData.name}`
              : 'Escolha a casa e o mês para visualizar as datas disponíveis'}
          </p>
        </div>

        {/* FLUXO 1: Veio da página da casa (propertyId na URL) */}
        {preSelectedPropertyId && selectedPropertyData ? (
          <div className="space-y-8">
            {/* Info da Casa Selecionada */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedPropertyData.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop'}
                    alt={selectedPropertyData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{selectedPropertyData.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedPropertyData.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedPropertyData.capacity} pessoas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{selectedPropertyData.bedrooms} quartos</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/disponibilidade"
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Trocar casa
                </Link>
              </div>
            </div>

            {/* Seleção de Mês */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Escolha o Mês
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setShowDateAction(false);
                }}
                min={new Date().toISOString().slice(0, 7)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Calendário */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Disponibilidade
                </h2>
                <p className="text-gray-600">
                  {new Date(
    Number(selectedMonth.split('-')[0]),         // Ano
    Number(selectedMonth.split('-')[1]) - 1,     // Mês (corrigindo)
    1
).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Indisponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700">Data passada</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {/* Week days header */}
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb','Dom',].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-700 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((dayData, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(dayData)}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                      ${!dayData ? 'bg-transparent' : ''}
                      ${dayData?.isPast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                      ${dayData?.isAvailable ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' : ''}
                      ${dayData?.isOccupied ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600' : ''}
                    `}
                  >
                    {dayData?.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* FLUXO 2: Acesso direto à página de disponibilidade (sem propertyId) */
          <>
            {/* Property and Month Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Property Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Escolha a Casa
                  </label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => {
                      setSelectedProperty(e.target.value);
                      setShowCalendar(false);
                      setShowDateAction(false);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma casa</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Escolha o Mês
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setShowDateAction(false);
                    }}
                    min={new Date().toISOString().slice(0, 7)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botão Consultar Datas */}
              {selectedProperty && !showCalendar && (
                <div className="text-center">
                  <button
                    onClick={handleConsultarDatas}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    Consultar Datas
                  </button>
                </div>
              )}
            </div>

            {/* Calendar Display */}
            {showCalendar && selectedProperty && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPropertyData?.name}
                  </h2>
                  <p className="text-gray-600">
                    {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700">Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-700">Indisponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-sm text-gray-700">Data passada</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {/* Week days header */}
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((dayData, index) => (
                    <div
                      key={index}
                      onClick={() => handleDateClick(dayData)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                        ${!dayData ? 'bg-transparent' : ''}
                        ${dayData?.isPast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                        ${dayData?.isAvailable ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' : ''}
                        ${dayData?.isOccupied ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600' : ''}
                      `}
                    >
                      {dayData?.day}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Ação de Data */}
        {showDateAction && clickedDateInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
              <button
                onClick={() => setShowDateAction(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              {clickedDateInfo.isOccupied ? (
                // Data ocupada
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Data indisponível
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta data está bloqueada ou reservada. Selecione outra data.
                  </p>
                  <button
                    onClick={() => setShowDateAction(false)}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                // Data disponível
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Deseja consultar essa data no WhatsApp?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {clickedDateInfo.date.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <div className="space-y-3">
                    <a
                      href={getWhatsAppLinkWithDate()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Consultar no WhatsApp
                    </a>
                    <button
                      onClick={() => setShowDateAction(false)}
                      className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Properties List - Só mostra se NÃO vier propertyId na URL */}
        {!preSelectedPropertyId && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas as Casas Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link 
                  key={property.id} 
                  href={`/casa/${property.id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                >
                  {/* Imagem da casa */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {property.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{property.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} quartos</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        A partir de <span className="text-lg font-bold text-blue-600">R$ {property.valorBase || '0'}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {properties.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Nenhuma casa cadastrada ainda
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
