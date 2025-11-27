'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, DollarSign, User, Home, Sparkles } from 'lucide-react';
import { ExtraService } from '@/lib/types';
import { mockExtras } from '@/lib/mock-data';
import { mockBoats } from '@/lib/mock-data'; // Embarcações cadastradas
import { useRouter } from 'next/navigation';

interface Property {
  id: string;
  name: string;
  location: string;
}

interface Reservation {
  id: string;
  propertyId: string;
  clientName: string;
  checkIn: string;
  checkOut: string;
}

export default function ExtrasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // EMBARCAÇÕES (Lanchas / Jets)
const [boats, setBoats] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    reservationId: '',
    extraType: '',
    serviceDate: '',
    serviceTime: '',
    totalValue: 0,
    paidValue: 0,
    providerTotalValue: 0,
    providerPaidValue: 0,
  });

  // CARREGA EMBARCAÇÕES AUTOMATICAMENTE
useEffect(() => {
    setBoats(mockBoats); // vem do cadastro de embarcações
}, []);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Carregar casas
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
    }

    // Carregar reservas
    const storedReservations = localStorage.getItem('reservations');
    if (storedReservations) {
      setReservations(JSON.parse(storedReservations));
    }

    // Carregar serviços extras
    const storedExtraServices = localStorage.getItem('extraServices');
    if (storedExtraServices) {
      setExtraServices(JSON.parse(storedExtraServices));
    }
  };

  const filteredExtraServices = extraServices.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    const propertyName = properties.find(p => p.id === service.propertyId)?.name || '';
    
    return (
      (service.clientName || '').toLowerCase().includes(searchLower) ||
      (service.extraType || '').toLowerCase().includes(searchLower) ||
      propertyName.toLowerCase().includes(searchLower)
    );
  });

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Casa não encontrada';
  };

  const getReservationsForProperty = (propertyId: string) => {
    return reservations.filter(r => r.propertyId === propertyId);
  };

  const getClientName = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    return reservation ? reservation.clientName : '';
  };

  // Obter os limites de data baseado na reserva selecionada
  const getDateLimits = () => {
    if (!formData.reservationId) {
      return { min: '', max: '' };
    }

    const reservation = reservations.find(r => r.id === formData.reservationId);
    if (!reservation) {
      return { min: '', max: '' };
    }

    return {
      min: reservation.checkIn,
      max: reservation.checkOut,
    };
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
    };
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      partial: 'Parcial',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reservation = reservations.find(r => r.id === formData.reservationId);
    if (!reservation) {
      alert('Reserva não encontrada!');
      return;
    }

    // Validar se a data está dentro do período da reserva
    const serviceDate = new Date(formData.serviceDate);
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (serviceDate < checkIn || serviceDate > checkOut) {
      alert('A data do serviço deve estar dentro do período da reserva!');
      return;
    }

    const paymentStatus = 
      formData.paidValue === 0 ? 'pending' :
      formData.paidValue >= formData.totalValue ? 'paid' : 'partial';

    const newExtraService: ExtraService = {
      id: Date.now().toString(),
      reservationId: formData.reservationId,
      propertyId: formData.propertyId,
      clientName: reservation.clientName,
      extraType: formData.extraType,
      serviceDate: formData.serviceDate,
      serviceTime: formData.serviceTime,
      totalValue: formData.totalValue,
      paidValue: formData.paidValue,
      providerTotalValue: formData.providerTotalValue,
      providerPaidValue: formData.providerPaidValue,
      paymentStatus,
      createdAt: new Date().toISOString(),
    };

    const updatedServices = [...extraServices, newExtraService];
    setExtraServices(updatedServices);
    localStorage.setItem('extraServices', JSON.stringify(updatedServices));

    alert('Extra cadastrado com sucesso!');
    setShowForm(false);
    setFormData({
      propertyId: '',
      reservationId: '',
      extraType: '',
      serviceDate: '',
      serviceTime: '',
      totalValue: 0,
      paidValue: 0,
      providerTotalValue: 0,
      providerPaidValue: 0,
    });
  };

  const handleExtraClick = (extraService: ExtraService) => {
    // Navegar para tela de edição do extra
    router.push(`/admin/extras/${extraService.id}/editar`);
  };

  const dateLimits = getDateLimits();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Serviços Extras</h1>
          <p className="text-gray-600">Gerencie todos os serviços adicionais agendados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço Extra
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Cadastrar Novo Serviço Extra</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Casa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Casa *
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, reservationId: '', serviceDate: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma casa</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
{/* Passeio (Lancha / Jet Ski) */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Tipo de Passeio *
  </label>
  <select
    value={formData.extraType}
    onChange={(e) => setFormData({ ...formData, extraType: e.target.value })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value="">Selecione</option>
    <option value="Lancha">Lancha</option>
    <option value="Jet Ski">Jet Ski</option>
  </select>
</div>

{/* Selecionar Embarcação */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Escolha a Embarcação *
  </label>

  <select
    value={formData.boatId || ""}
    onChange={(e) => {
      const selected = boats.find(b => b.id === e.target.value);
      setFormData({
        ...formData,
        boatId: e.target.value,
        capacity: selected?.capacity || "",
        totalValue: selected?.price || 0
      });
    }}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value="">Selecionar...</option>

    {boats.map((boat) => (
      <option key={boat.id} value={boat.id}>
        {boat.name} — {boat.capacity} pessoas — R$ {boat.price}
      </option>
    ))}
  </select>
</div>
    
{/* Capacidade */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Capacidade de Pessoas *
  </label>
  <input
    type="number"
    placeholder="Ex: 10 pessoas"
    value={formData.capacity || ""}
    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    required
  />
</div>

{/* Nome do Proprietário */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Proprietário da Embarcação *
  </label>
  <input
    type="text"
    placeholder="Nome do dono"
    value={formData.providerName || ""}
    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    required
  />
</div>
              {/* Reserva */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reserva *
                </label>
                <select
                  value={formData.reservationId}
                  onChange={(e) => {
                    const reservation = reservations.find(r => r.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      reservationId: e.target.value,
                      serviceDate: '', // Limpar data ao trocar reserva
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.propertyId}
                >
                  <option value="">Selecione uma reserva</option>
                  {getReservationsForProperty(formData.propertyId).map(reservation => (
                    <option key={reservation.id} value={reservation.id}>
                      {reservation.clientName} - {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} a {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Extra */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Extra *
                </label>
                <select
                  value={formData.extraType}
                  onChange={(e) => setFormData({ ...formData, extraType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {mockExtras.map(extra => (
                    <option key={extra.id} value={extra.name}>
                      {extra.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data do Serviço */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data do Serviço *
                </label>
                <input
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                  min={dateLimits.min}
                  max={dateLimits.max}
                  disabled={!formData.reservationId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
                {formData.reservationId && (
                  <p className="text-xs text-gray-600 mt-1">
                    Período disponível: {new Date(dateLimits.min).toLocaleDateString('pt-BR')} a {new Date(dateLimits.max).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Horário */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={formData.serviceTime}
                  onChange={(e) => setFormData({ ...formData, serviceTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Valor Total */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Valor Pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  value={formData.paidValue}
                  onChange={(e) => setFormData({ ...formData, paidValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Repasse Total do Prestador */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Repasse Total do Prestador (R$)
                </label>
                <input
                  type="number"
                  value={formData.providerTotalValue}
                  onChange={(e) => setFormData({ ...formData, providerTotalValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Repasse Pago ao Prestador */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Repasse Pago ao Prestador (R$)
                </label>
                <input
                  type="number"
                  value={formData.providerPaidValue}
                  onChange={(e) => setFormData({ ...formData, providerPaidValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Cadastrar Serviço
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, tipo de extra ou casa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Extras Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExtraServices.map((service) => (
          <div
            key={service.id}
            onClick={() => handleExtraClick(service)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{service.extraType}</h3>
                  <p className="text-sm text-gray-600">{getPropertyName(service.propertyId)}</p>
                </div>
              </div>
              {getPaymentStatusBadge(service.paymentStatus)}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Cliente</p>
                  <p className="text-sm font-semibold text-gray-900">{service.clientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Data</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(service.serviceDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {service.serviceTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Horário</p>
                    <p className="text-sm font-semibold text-gray-900">{service.serviceTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Info */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {/* Valores do Cliente */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">💰 Valores do Cliente</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-bold text-gray-900">R$ {service.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pago</p>
                    <p className="font-bold text-green-600">R$ {service.paidValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pendente</p>
                    <p className="font-bold text-red-600">R$ {(service.totalValue - service.paidValue).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Repasse do Prestador */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">🤝 Repasse do Prestador</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-bold text-gray-900">R$ {service.providerTotalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pago</p>
                    <p className="font-bold text-green-600">R$ {service.providerPaidValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pendente</p>
                    <p className="font-bold text-red-600">R$ {(service.providerTotalValue - service.providerPaidValue).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExtraServices.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum serviço extra encontrado</h3>
          <p className="text-gray-600">Cadastre um novo serviço extra para começar.</p>
        </div>
      )}
    </div>
  );
}
