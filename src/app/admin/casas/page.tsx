'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Home, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { mockProperties } from '@/lib/mock-data';

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
  status: 'available' | 'unavailable';
  extras: string[];
  images: string[];
}

interface Owner {
  id: string;
  name: string;
  email: string;
}

export default function CasasPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    // Carregar proprietários do localStorage
    const savedOwners = localStorage.getItem('owners');
    if (savedOwners) {
      setOwners(JSON.parse(savedOwners));
    }

    // Carregar casas do localStorage ou usar dados mock
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    } else {
      // Inicializar com dados mock
      localStorage.setItem('properties', JSON.stringify(mockProperties));
      setProperties(mockProperties);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta casa?')) {
      const updatedProperties = properties.filter(p => p.id !== id);
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Aplicar filtro da URL se existir
    if (filterParam === 'available') {
      return matchesSearch && property.status === 'available';
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Casas</h1>
          <p className="text-gray-600">
            {filterParam === 'available' 
              ? 'Mostrando apenas casas disponíveis' 
              : 'Gerencie todas as propriedades cadastradas'}
          </p>
        </div>
        <Link
          href="/admin/casas/nova"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nova Casa
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Casas</p>
              <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disponíveis</p>
              <p className="text-3xl font-bold text-green-600">
                {properties.filter(p => p.status === 'available').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Indisponíveis</p>
              <p className="text-3xl font-bold text-red-600">
                {properties.filter(p => p.status === 'unavailable').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Home className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => {
          const owner = owners.find(o => o.id === property.ownerId);
          return (
            <div
              key={property.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'available'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {property.status === 'available' ? 'Disponível' : 'Indisponível'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{property.capacity} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    <span>{property.bedrooms} quartos</span>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Proprietário</p>
                  <p className="font-semibold text-gray-900">{owner?.name || 'Não definido'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Semana</p>
                    <p className="font-semibold text-gray-900">R$ {property.weekdayPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fim de Semana</p>
                    <p className="font-semibold text-gray-900">R$ {property.weekendPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Feriado</p>
                    <p className="font-semibold text-gray-900">R$ {property.holidayPrice}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/casas/${property.id}/editar`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma casa encontrada</h3>
          <p className="text-gray-600 mb-6">Tente buscar com outros termos ou adicione uma nova casa.</p>
          <Link
            href="/admin/casas/nova"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeira Casa
          </Link>
        </div>
      )}
    </div>
  );
}
