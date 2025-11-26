'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Home, Calendar, DollarSign, TrendingUp, Edit, Save, X } from 'lucide-react';
import { mockOwners, mockProperties, mockReservations } from '@/lib/mock-data';

interface Owner {
  id: string;
  name: string;
  phone: string;
  percentage: number;
}

export default function ProprietarioDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    percentage: 0
  });

  useEffect(() => {
    // Carregar proprietário do localStorage ou mock
    const storedOwners = localStorage.getItem('owners');
    let foundOwner: Owner | undefined;
    
    if (storedOwners) {
      const owners: Owner[] = JSON.parse(storedOwners);
      foundOwner = owners.find(o => o.id === id);
    }
    
    if (!foundOwner) {
      foundOwner = mockOwners.find(o => o.id === id);
    }
    
    if (foundOwner) {
      setOwner(foundOwner);
      setEditForm({
        name: foundOwner.name,
        phone: foundOwner.phone,
        percentage: foundOwner.percentage
      });
    }
  }, [id]);
  
  if (!owner) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Proprietário não encontrado</h2>
      </div>
    );
  }

  const ownerProperties = mockProperties.filter(p => p.ownerId === owner.id);
  const ownerReservations = mockReservations.filter(r => 
    ownerProperties.some(p => p.id === r.propertyId)
  );

  const totalReservations = ownerReservations.length;
  const totalRevenue = ownerReservations.reduce((sum, r) => sum + r.totalValue, 0);
  const ownerShare = totalRevenue * (owner.percentage / 100);

  const handleSaveEdit = () => {
    // Atualizar proprietário no localStorage
    const storedOwners = localStorage.getItem('owners');
    let owners: Owner[] = storedOwners ? JSON.parse(storedOwners) : mockOwners;
    
    const updatedOwners = owners.map(o => 
      o.id === id 
        ? { ...o, name: editForm.name, phone: editForm.phone, percentage: editForm.percentage }
        : o
    );
    
    localStorage.setItem('owners', JSON.stringify(updatedOwners));
    
    setOwner({
      id,
      name: editForm.name,
      phone: editForm.phone,
      percentage: editForm.percentage
    });
    
    setIsEditing(false);
    alert('Proprietário atualizado com sucesso!');
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: owner.name,
      phone: owner.phone,
      percentage: owner.percentage
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/proprietarios"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{owner.name}</h1>
          <p className="text-gray-600">Detalhes completos do proprietário</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Edit className="w-5 h-5" />
            Editar Proprietário
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isEditing ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Informações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Percentual de Repasse (%) *
                </label>
                <input
                  type="number"
                  value={editForm.percentage}
                  onChange={(e) => setEditForm({ ...editForm, percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{owner.name}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{owner.phone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Casas</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{ownerProperties.length}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Reservas</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{totalReservations}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Receita Total</span>
                </div>
                <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Repasse ({owner.percentage}%)</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">R$ {ownerShare.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Properties */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Propriedades</h2>
        
        {ownerProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerProperties.map(property => (
              <Link
                key={property.id}
                href={`/admin/casas/${property.id}`}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="relative h-32 bg-gray-200 rounded-lg mb-3">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacidade:</span>
                  <span className="font-semibold text-gray-900">{property.capacity} pessoas</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Nenhuma propriedade vinculada</p>
        )}
      </div>

      {/* Reservations */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reservas Recentes</h2>
        
        {ownerReservations.length > 0 ? (
          <div className="space-y-4">
            {ownerReservations.map(reservation => {
              const property = mockProperties.find(p => p.id === reservation.propertyId);
              const ownerValue = reservation.totalValue * (owner.percentage / 100);
              
              return (
                <Link
                  key={reservation.id}
                  href={`/admin/reservas/${reservation.id}/editar`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{reservation.clientName}</p>
                    <p className="text-sm text-gray-600">{property?.name}</p>
                    <p className="text-sm text-gray-600" suppressHydrationWarning>
                      {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 text-left md:text-right">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="font-semibold text-gray-900">R$ {reservation.totalValue.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-green-600 font-medium">
                      Repasse: R$ {ownerValue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </Link>
              );
            })}\n          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Nenhuma reserva encontrada</p>
        )}
      </div>
    </div>
  );
}
