'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Calendar, User, Phone, DollarSign, Edit, Trash2 } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  ownerPercentage?: number;
}

interface Reservation {
  id: string;
  propertyId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientEmail?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalValue: number;
  paidValue?: number;
  ownerTotalValue?: number;
  ownerPaidValue?: number;
  extras: { extraId: string; quantity: number; price: number }[];
  paymentStatus: 'paid' | 'pending' | 'partial';
  createdAt: string;
}

function ReservasContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const idParam = searchParams.get('id');
  
  // Estados temporários dos filtros (antes de aplicar)
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchCpf, setSearchCpf] = useState('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Estados aplicados (após clicar em Buscar)
  const [appliedSearchName, setAppliedSearchName] = useState('');
  const [appliedSearchPhone, setAppliedSearchPhone] = useState('');
  const [appliedSearchCpf, setAppliedSearchCpf] = useState('');
  const [appliedFilterProperty, setAppliedFilterProperty] = useState<string>('all');
  const [appliedFilterMonth, setAppliedFilterMonth] = useState<string>('all');
  const [appliedFilterStatus, setAppliedFilterStatus] = useState<string>('all');
  
  const [mounted, setMounted] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
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

    // Se veio com ID específico, destacar a reserva
    if (idParam) {
      setHighlightedId(idParam);
      // Scroll suave até a reserva após um pequeno delay
      setTimeout(() => {
        const element = document.getElementById(`reserva-${idParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [idParam]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Função para aplicar os filtros
  const handleSearch = () => {
    setAppliedSearchName(searchName);
    setAppliedSearchPhone(searchPhone);
    setAppliedSearchCpf(searchCpf);
    setAppliedFilterProperty(filterProperty);
    setAppliedFilterMonth(filterMonth);
    setAppliedFilterStatus(filterStatus);
  };

  // Função para limpar os filtros
  const handleClearFilters = () => {
    setSearchName('');
    setSearchPhone('');
    setSearchCpf('');
    setFilterProperty('all');
    setFilterMonth('all');
    setFilterStatus('all');
    setAppliedSearchName('');
    setAppliedSearchPhone('');
    setAppliedSearchCpf('');
    setAppliedFilterProperty('all');
    setAppliedFilterMonth('all');
    setAppliedFilterStatus('all');
  };

  const filteredReservations = reservations.filter(reservation => {
    // Filtro por nome
    const matchesName = appliedSearchName === '' || 
                       reservation.clientName.toLowerCase().includes(appliedSearchName.toLowerCase());
    
    // Filtro por telefone
    const matchesPhone = appliedSearchPhone === '' || 
                        reservation.clientPhone.includes(appliedSearchPhone);
    
    // Filtro por CPF
    const matchesCpf = appliedSearchCpf === '' || 
                      reservation.clientCpf.includes(appliedSearchCpf);
    
    // Filtro por casa
    const matchesProperty = appliedFilterProperty === 'all' || 
                           reservation.propertyId === appliedFilterProperty;
    
    // Filtro por mês
    let matchesMonth = true;
    if (appliedFilterMonth !== 'all') {
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
      const selectedMonth = parseInt(appliedFilterMonth);
      
      const checkInMonth = checkInDate.getMonth() + 1;
      const checkOutMonth = checkOutDate.getMonth() + 1;
      
      matchesMonth = checkInMonth === selectedMonth || checkOutMonth === selectedMonth;
    }
    
    // Filtro por status
    const matchesStatus = appliedFilterStatus === 'all' || 
                         reservation.paymentStatus === appliedFilterStatus;
    
    // Aplicar filtro da URL se existir
    if (filterParam === 'future') {
      const checkIn = new Date(reservation.checkIn);
      const hoje = new Date();
      return matchesName && matchesPhone && matchesCpf && matchesProperty && 
             matchesMonth && matchesStatus && checkIn > hoje;
    }
    
    return matchesName && matchesPhone && matchesCpf && matchesProperty && 
           matchesMonth && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'partial':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'partial':
        return 'Parcial';
      default:
        return status;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      const updatedReservations = reservations.filter(r => r.id !== id);
      setReservations(updatedReservations);
      localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
          <p className="text-gray-600">
            {filterParam === 'future' 
              ? 'Mostrando apenas reservas futuras' 
              : 'Gerencie todas as reservas do sistema'}
          </p>
        </div>
        <Link
          href="/admin/reservas/nova"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nova Reserva
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Buscar por nome */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buscar por telefone */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por telefone..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buscar por CPF */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por CPF..."
              value={searchCpf}
              onChange={(e) => setSearchCpf(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtrar por casa */}
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as casas</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          {/* Filtrar por mês */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os meses</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          {/* Filtrar por status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="partial">Parcial</option>
          </select>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => {
          const property = properties.find(p => p.id === reservation.propertyId);
          
          // USAR OS VALORES SALVOS NA RESERVA (não calcular em tempo real)
          const valorTotalReserva = reservation.totalValue || 0;
          const valorPagoCliente = reservation.paidValue || 0;
          const valorRestanteCliente = valorTotalReserva - valorPagoCliente;
          
          const valorRepasseProprietario = reservation.ownerTotalValue || 0;
          const valorPagoProprietario = reservation.ownerPaidValue || 0;
          const valorRestanteProprietario = valorRepasseProprietario - valorPagoProprietario;
          
          const isHighlighted = highlightedId === reservation.id;
          
          return (
            <div
              id={`reserva-${reservation.id}`}
              key={reservation.id}
              className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                isHighlighted ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Side - Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {reservation.clientName}
                        </h3>
                        <p className="text-gray-600">{property?.name || 'Casa não encontrada'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.paymentStatus)}`}>
                        {getStatusLabel(reservation.paymentStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{reservation.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{reservation.guests} hóspedes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(reservation.checkIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(reservation.checkOut)}
                        </span>
                      </div>
                    </div>

                    {reservation.extras.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {reservation.extras.map((extra, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                          >
                            Extra {index + 1}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/reservas/${reservation.id}/editar`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Valores do Cliente */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-blue-700" />
                    <h4 className="font-bold text-blue-900">Valores do Cliente</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Valor Total da Reserva</p>
                      <p className="text-lg font-bold text-blue-900">
                        R$ {valorTotalReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Total Recebido</p>
                      <p className="text-lg font-bold text-green-700">
                        R$ {valorPagoCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Valor Restante</p>
                      <p className="text-lg font-bold text-orange-700">
                        R$ {valorRestanteCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financeiro do Proprietário */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-purple-700" />
                    <h4 className="font-bold text-purple-900">Financeiro do Proprietário</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-purple-600 mb-1">Valor Total do Repasse</p>
                      <p className="text-lg font-bold text-purple-900">
                        R$ {valorRepasseProprietario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-purple-600 mb-1">Já Pago ao Proprietário</p>
                      <p className="text-lg font-bold text-green-700">
                        R$ {valorPagoProprietario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-purple-600 mb-1">Restante a Pagar</p>
                      <p className="text-lg font-bold text-orange-700">
                        R$ {valorRestanteProprietario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReservations.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600">Tente buscar com outros termos ou adicione uma nova reserva.</p>
        </div>
      )}
    </div>
  );
}

export default function ReservasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ReservasContent />
    </Suspense>
  );
}
