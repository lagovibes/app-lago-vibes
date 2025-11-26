'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, DollarSign, User, Home, Sparkles, Trash2 } from 'lucide-react';
import { ExtraService } from '@/lib/types';
import { mockExtras } from '@/lib/mock-data';

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

export default function EditarExtraPage() {
  const router = useRouter();
  const params = useParams();
  const extraId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    reservationId: '',
    clientName: '',
    extraType: '',
    serviceDate: '',
    serviceTime: '',
    totalValue: 0,
    paidValue: 0,
    providerTotalValue: 0,
    providerPaidValue: 0,
    paymentStatus: 'pending',
  });

  useEffect(() => {
    loadData();
  }, [extraId]);

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

    // Carregar serviço extra
    const storedExtraServices = localStorage.getItem('extraServices');
    if (storedExtraServices) {
      const extraServices: ExtraService[] = JSON.parse(storedExtraServices);
      const extraService = extraServices.find(e => e.id === extraId);
      
      if (extraService) {
        setFormData({
          propertyId: extraService.propertyId,
          reservationId: extraService.reservationId,
          clientName: extraService.clientName,
          extraType: extraService.extraType,
          serviceDate: extraService.serviceDate,
          serviceTime: extraService.serviceTime || '',
          totalValue: extraService.totalValue,
          paidValue: extraService.paidValue,
          providerTotalValue: extraService.providerTotalValue,
          providerPaidValue: extraService.providerPaidValue,
          paymentStatus: extraService.paymentStatus,
        });
      }
    }
    
    setLoading(false);
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Casa não encontrada';
  };

  const getReservationsForProperty = (propertyId: string) => {
    return reservations.filter(r => r.propertyId === propertyId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentStatus = 
      formData.paidValue === 0 ? 'pending' :
      formData.paidValue >= formData.totalValue ? 'paid' : 'partial';

    const updatedExtraService: ExtraService = {
      id: extraId,
      reservationId: formData.reservationId,
      propertyId: formData.propertyId,
      clientName: formData.clientName,
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

    // Salvar no localStorage
    const storedExtraServices = localStorage.getItem('extraServices');
    const extraServices = storedExtraServices ? JSON.parse(storedExtraServices) : [];
    const index = extraServices.findIndex((e: ExtraService) => e.id === extraId);
    
    if (index !== -1) {
      extraServices[index] = updatedExtraService;
      localStorage.setItem('extraServices', JSON.stringify(extraServices));
      alert('Serviço extra atualizado com sucesso!');
      router.push('/admin/extras');
    }
  };

  const handleDelete = () => {
    if (!confirm('Tem certeza que deseja excluir este serviço extra?')) {
      return;
    }

    const storedExtraServices = localStorage.getItem('extraServices');
    if (storedExtraServices) {
      const extraServices: ExtraService[] = JSON.parse(storedExtraServices);
      const updatedServices = extraServices.filter(e => e.id !== extraId);
      localStorage.setItem('extraServices', JSON.stringify(updatedServices));
      alert('Serviço extra excluído com sucesso!');
      router.push('/admin/extras');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/extras"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Serviço Extra</h1>
            <p className="text-gray-600">Atualize as informações do serviço</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Excluir
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Casa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Casa *
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, reservationId: '' })}
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
                    clientName: reservation ? reservation.clientName : '',
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

            {/* Cliente (readonly) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={formData.clientName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
          </div>
        </div>

        {/* Pagamento do Cliente */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">💰 Pagamento do Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Pendente
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-bold text-gray-900">
                R$ {(formData.totalValue - formData.paidValue).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status do Pagamento
            </label>
            <div>
              {formData.paidValue === 0 && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                  Pendente
                </span>
              )}
              {formData.paidValue > 0 && formData.paidValue < formData.totalValue && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                  Parcial
                </span>
              )}
              {formData.paidValue >= formData.totalValue && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  Pago
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Repasse do Prestador */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-6">🤝 Repasse do Prestador</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Repasse Total (R$)
              </label>
              <input
                type="number"
                value={formData.providerTotalValue}
                onChange={(e) => setFormData({ ...formData, providerTotalValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Repasse Pago (R$)
              </label>
              <input
                type="number"
                value={formData.providerPaidValue}
                onChange={(e) => setFormData({ ...formData, providerPaidValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Repasse Pendente
              </label>
              <div className="px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-lg font-bold text-purple-900">
                R$ {(formData.providerTotalValue - formData.providerPaidValue).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Salvar Alterações
          </button>
          <Link
            href="/admin/extras"
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
