'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { applyPhoneMask } from '@/lib/phone-mask';
import { applyCurrencyMask, extractCurrencyValue, formatCurrency } from '@/lib/currency-mask';

interface Property {
  id: string;
  name: string;
  location: string;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  ownerPercentage?: number;
}

interface ExtraService {
  id: string;
  extraType: string;
  serviceDate: string;
  serviceTime: string;
  totalValue: number;
  paidValue: number;
  providerTotalValue: number;
  providerPaidValue: number;
}
export default function NovaReservaPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NovaReservaInner />
    </Suspense>
  );
}
  function NovaReservaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    clientName: '',
    clientCpf: '',
    clientPhone: '',
    clientEmail: '',
    checkIn: '',
    checkInTime: '14:00',
    checkOut: '',
    checkOutTime: '12:00',
    guests: '',
    paymentStatus: 'pending',
    totalValue: 0,
    paidValue: 0,
    ownerTotalValue: 0,
    ownerPaidValue: 0,
  });

  // Estados para valores formatados
  const [displayValues, setDisplayValues] = useState({
    totalValue: 'R$ 0,00',
    paidValue: 'R$ 0,00',
    ownerTotalValue: 'R$ 0,00',
    ownerPaidValue: 'R$ 0,00',
  });

  const [extras, setExtras] = useState<ExtraService[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    // Carregar casas do localStorage
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
    }

    // Preencher dados da URL (quando vem do calendário)
    const propertyId = searchParams.get('propertyId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (propertyId || checkIn || checkOut) {
      setFormData(prev => ({
        ...prev,
        propertyId: propertyId || prev.propertyId,
        checkIn: checkIn || prev.checkIn,
        checkOut: checkOut || prev.checkOut,
      }));
    }
  }, [searchParams]);

  const calculateTotalValue = () => {
    if (!formData.propertyId || !formData.checkIn || !formData.checkOut) {
      return 0;
    }

    const property = properties.find(p => p.id === formData.propertyId);
    if (!property) return 0;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Calcular valor base (usando preço de dia de semana como padrão)
    let baseValue = nights * property.weekdayPrice;

    return baseValue;
  };

  const calculateOwnerValue = () => {
    const property = properties.find(p => p.id === formData.propertyId);
    if (!property) return 0;

    const ownerPercentage = property.ownerPercentage || 70; // Padrão 70%
    const totalValue = formData.totalValue || calculateTotalValue();
    return (totalValue * ownerPercentage) / 100;
  };

  // Atualizar valores automaticamente quando mudar casa, datas
  useEffect(() => {
    const newTotalValue = calculateTotalValue();
    const newOwnerTotalValue = calculateOwnerValue();
    
    setFormData(prev => ({
      ...prev,
      totalValue: newTotalValue,
      ownerTotalValue: newOwnerTotalValue
    }));

    setDisplayValues(prev => ({
      ...prev,
      totalValue: formatCurrency(newTotalValue),
      ownerTotalValue: formatCurrency(newOwnerTotalValue)
    }));
  }, [formData.propertyId, formData.checkIn, formData.checkOut, properties]);

  // Calcular valores restantes (SEMPRE usando valores numéricos do formData)
  const calculateRemainingValue = () => {
    const total = formData.totalValue || 0;
    const paid = formData.paidValue || 0;
    return Math.max(0, total - paid);
  };

  const calculateOwnerRemainingValue = () => {
    const total = formData.ownerTotalValue || 0;
    const paid = formData.ownerPaidValue || 0;
    return Math.max(0, total - paid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const confirmReservation = () => {
    // Criar nova reserva
    const reservationId = Date.now().toString();
    const newReservation = {
      id: reservationId,
      propertyId: formData.propertyId,
      clientName: formData.clientName,
      clientCpf: formData.clientCpf,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      checkIn: formData.checkIn,
      checkInTime: formData.checkInTime,
      checkOut: formData.checkOut,
      checkOutTime: formData.checkOutTime,
      guests: parseInt(formData.guests),
      totalValue: formData.totalValue,
      paidValue: formData.paidValue,
      ownerTotalValue: formData.ownerTotalValue,
      ownerPaidValue: formData.ownerPaidValue,
      extras: [],
      paymentStatus: formData.paymentStatus,
      createdAt: new Date().toISOString(),
    };

    // Salvar reserva no localStorage
    const storedReservations = localStorage.getItem('reservations');
    const reservations = storedReservations ? JSON.parse(storedReservations) : [];
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Salvar extras vinculados à reserva
    if (extras.length > 0) {
      const storedExtras = localStorage.getItem('extraServices');
      const allExtras = storedExtras ? JSON.parse(storedExtras) : [];
      
      const extrasWithReservation = extras.map(extra => ({
        ...extra,
        reservationId: reservationId,
        paymentStatus: extra.paidValue >= extra.totalValue ? 'paid' : 
                      extra.paidValue > 0 ? 'partial' : 'pending'
      }));
      
      allExtras.push(...extrasWithReservation);
      localStorage.setItem('extraServices', JSON.stringify(allExtras));
    }

    alert('Reserva criada com sucesso!');
    router.push('/admin/reservas');
  };

  const addExtra = () => {
    const newExtra: ExtraService = {
      id: Date.now().toString(),
      extraType: '',
      serviceDate: formData.checkIn || '',
      serviceTime: '',
      totalValue: 0,
      paidValue: 0,
      providerTotalValue: 0,
      providerPaidValue: 0,
    };
    setExtras([...extras, newExtra]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (index: number, field: keyof ExtraService, value: any) => {
    const updatedExtras = [...extras];
    updatedExtras[index] = {
      ...updatedExtras[index],
      [field]: value
    };
    setExtras(updatedExtras);
  };

  const selectedProperty = properties.find(p => p.id === formData.propertyId);
  const ownerPercentage = selectedProperty?.ownerPercentage || 70;

  // Resumo Modal
  if (showSummary) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSummary(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Resumo da Reserva</h1>
            <p className="text-gray-600">Confira todos os dados antes de confirmar</p>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
          {/* Dados do Cliente */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">👤 Dados do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-bold text-gray-900">{formData.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="font-bold text-gray-900">{formData.clientCpf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-bold text-gray-900">{formData.clientPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-bold text-gray-900">{formData.clientEmail || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Dados da Reserva */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">🏠 Dados da Reserva</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Casa</p>
                <p className="font-bold text-gray-900">{selectedProperty?.name} - {selectedProperty?.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Hóspedes</p>
                <p className="font-bold text-gray-900">{formData.guests} pessoa(s)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-bold text-gray-900">
                  {new Date(formData.checkIn).toLocaleDateString('pt-BR')} às {formData.checkInTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-bold text-gray-900">
                  {new Date(formData.checkOut).toLocaleDateString('pt-BR')} às {formData.checkOutTime}
                </p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">💰 Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-bold text-2xl text-blue-600">{displayValues.totalValue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status do Pagamento</p>
                <p className="font-bold text-gray-900">
                  {formData.paymentStatus === 'paid' ? '✅ Pago' : 
                   formData.paymentStatus === 'partial' ? '⏳ Parcial' : '⏰ Pendente'}
                </p>
              </div>
            </div>
          </div>

          {/* Extras */}
          {extras.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-purple-200 pb-2">✨ Extras Adicionados</h2>
              <div className="space-y-4">
                {extras.map((extra, index) => {
                  const clientRemaining = Math.max(0, extra.totalValue - extra.paidValue);
                  return (
                    <div key={extra.id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-purple-900">{extra.extraType}</h3>
                        <span className="text-sm text-gray-600">
                          {new Date(extra.serviceDate).toLocaleDateString('pt-BR')} 
                          {extra.serviceTime && ` às ${extra.serviceTime}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Valor Total</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(extra.totalValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Já Pago</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(extra.paidValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Falta Pagar</p>
                          <p className="font-bold text-red-600">
                            {formatCurrency(clientRemaining)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={confirmReservation}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg"
            >
              ✅ Confirmar e Criar Reserva
            </button>
            <button
              onClick={() => setShowSummary(false)}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              ← Voltar e Editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/reservas"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Reserva</h1>
          <p className="text-gray-600">Cadastre uma nova reserva no sistema</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Casa */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Casa</h2>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selecione a Casa *
            </label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma casa</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.location}
                </option>
              ))}
            </select>
            {properties.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                Nenhuma casa cadastrada. <Link href="/admin/casas/nova" className="underline font-semibold">Cadastre uma casa primeiro</Link>.
              </p>
            )}
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Dados do Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formData.clientCpf}
                onChange={(e) => setFormData({ ...formData, clientCpf: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: applyPhoneMask(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(XX) XXXXX-XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Datas e Hóspedes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Datas e Hóspedes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-in *
              </label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horário Check-in *
              </label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-out *
              </label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horário Check-out *
              </label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Hóspedes *
              </label>
              <input
                type="number"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Extras - NOVO SISTEMA COMPLETO */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-purple-900">✨ Extras / Serviços</h2>
            <button
              type="button"
              onClick={addExtra}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar Extra
            </button>
          </div>
          
          {extras.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">Nenhum extra adicionado</p>
              <p className="text-sm text-gray-500 mt-2">Clique em "Adicionar Extra" para incluir serviços como Lancha, Jet Ski, etc.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {extras.map((extra, index) => {
                const clientRemaining = Math.max(0, extra.totalValue - extra.paidValue);
                const providerRemaining = Math.max(0, extra.providerTotalValue - extra.providerPaidValue);
                const companyValue = Math.max(0, extra.totalValue - extra.providerTotalValue);

                return (
                  <div key={extra.id} className="bg-white rounded-xl p-6 shadow-md">
                    {/* Header do Extra */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Extra #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeExtra(index)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Campos do Extra */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Tipo de Serviço */}
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          1️⃣ Tipo de Serviço *
                        </label>
                        <select
                          value={extra.extraType}
                          onChange={(e) => updateExtra(index, 'extraType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Selecione o serviço</option>
                          <option value="Lancha">Lancha</option>
                          <option value="Jet Ski">Jet Ski</option>
                          <option value="Churrasqueira Premium">Churrasqueira Premium</option>
                          <option value="Chef Particular">Chef Particular</option>
                          <option value="Decoração">Decoração</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      {/* Data do Serviço */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          2️⃣ Data do Serviço *
                        </label>
                        <input
                          type="date"
                          value={extra.serviceDate}
                          onChange={(e) => updateExtra(index, 'serviceDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Horário do Serviço */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          3️⃣ Horário do Serviço
                        </label>
                        <input
                          type="time"
                          value={extra.serviceTime}
                          onChange={(e) => updateExtra(index, 'serviceTime', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Valores do Cliente */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-blue-900 mb-3">💰 Valores do Cliente</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            4️⃣ Valor Total *
                          </label>
                          <input
                            type="text"
                            value={applyCurrencyMask((extra.totalValue * 100).toString())}
                            onChange={(e) => {
                              const numericValue = extractCurrencyValue(e.target.value);
                              updateExtra(index, 'totalValue', numericValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="R$ 0,00"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            5️⃣ Já Pago
                          </label>
                          <input
                            type="text"
                            value={applyCurrencyMask((extra.paidValue * 100).toString())}
                            onChange={(e) => {
                              const numericValue = extractCurrencyValue(e.target.value);
                              updateExtra(index, 'paidValue', numericValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="R$ 0,00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            6️⃣ Falta Pagar
                          </label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-red-600">
                            {formatCurrency(clientRemaining)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valores do Proprietário/Parceiro */}
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-green-900 mb-3">🤝 Repasse ao Proprietário/Parceiro</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            7️⃣ Total do Repasse *
                          </label>
                          <input
                            type="text"
                            value={applyCurrencyMask((extra.providerTotalValue * 100).toString())}
                            onChange={(e) => {
                              const numericValue = extractCurrencyValue(e.target.value);
                              updateExtra(index, 'providerTotalValue', numericValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="R$ 0,00"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            8️⃣ Já Repassado
                          </label>
                          <input
                            type="text"
                            value={applyCurrencyMask((extra.providerPaidValue * 100).toString())}
                            onChange={(e) => {
                              const numericValue = extractCurrencyValue(e.target.value);
                              updateExtra(index, 'providerPaidValue', numericValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="R$ 0,00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            9️⃣ Falta Repassar
                          </label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-orange-600">
                            {formatCurrency(providerRemaining)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valor da Empresa */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm font-bold text-purple-900 mb-2">🏢 Valor da Empresa</p>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          🔟 Lucro da Empresa (Total - Repasse)
                        </label>
                        <div className="px-3 py-2 bg-white border-2 border-purple-300 rounded-lg text-lg font-bold text-purple-900">
                          {formatCurrency(companyValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagamento */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pagamento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status do Pagamento *
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pendente</option>
                <option value="partial">Parcial</option>
                <option value="paid">Pago</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Total da Reserva *
              </label>
              <input
                type="text"
                value={displayValues.totalValue}
                onChange={(e) => {
                  const numericValue = extractCurrencyValue(e.target.value);
                  const newOwnerTotalValue = (numericValue * ownerPercentage) / 100;
                  setFormData({ 
                    ...formData, 
                    totalValue: numericValue,
                    ownerTotalValue: newOwnerTotalValue
                  });
                  setDisplayValues({
                    ...displayValues,
                    totalValue: e.target.value,
                    ownerTotalValue: formatCurrency(newOwnerTotalValue)
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Já Pago
              </label>
              <input
                type="text"
                value={displayValues.paidValue}
                onChange={(e) => {
                  const numericValue = extractCurrencyValue(e.target.value);
                  setFormData({ ...formData, paidValue: numericValue });
                  setDisplayValues({
                    ...displayValues,
                    paidValue: e.target.value
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Restante a Pagar
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-lg font-bold text-gray-900">
                {formatCurrency(calculateRemainingValue())}
              </div>
            </div>
          </div>
        </div>

        {/* Financeiro do Proprietário */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-6">💰 Financeiro do Proprietário</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Valor Total do Repasse ({ownerPercentage}%)
              </label>
              <input
                type="text"
                value={displayValues.ownerTotalValue}
                onChange={(e) => {
                  const numericValue = extractCurrencyValue(e.target.value);
                  setFormData({ ...formData, ownerTotalValue: numericValue });
                  setDisplayValues({
                    ...displayValues,
                    ownerTotalValue: e.target.value
                  });
                }}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Valor Já Pago ao Proprietário
              </label>
              <input
                type="text"
                value={displayValues.ownerPaidValue}
                onChange={(e) => {
                  const numericValue = extractCurrencyValue(e.target.value);
                  setFormData({ ...formData, ownerPaidValue: numericValue });
                  setDisplayValues({
                    ...displayValues,
                    ownerPaidValue: e.target.value
                  });
                }}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Valor Restante a Pagar ao Proprietário
              </label>
              <div className="px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-2xl font-bold text-purple-900">
                {formatCurrency(calculateOwnerRemainingValue())}
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
            📋 Ver Resumo e Confirmar
          </button>
          <Link
            href="/admin/reservas"
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
