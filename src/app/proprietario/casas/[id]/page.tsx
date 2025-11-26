'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Home, MapPin, Users, Bed, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  location: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  amenities: string[];
  images: string[];
  status: 'available' | 'unavailable';
  ownerId: string;
}

export default function ProprietarioCasaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    // Verificar se está logado
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

    // Buscar casa específica
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
  }, [propertyId, router]);

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
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
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span>{property.location}</span>
        </div>
      </div>

      {/* Images Gallery */}
      {property.images && property.images.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {property.images.map((image, index) => (
              <div key={index} className="relative h-64 rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`${property.name} - Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Comodidades</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhes</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacidade</p>
                  <p className="font-semibold text-gray-900">{property.capacity} pessoas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quartos</p>
                  <p className="font-semibold text-gray-900">{property.bedrooms} quartos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Home className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Banheiros</p>
                  <p className="font-semibold text-gray-900">{property.bathrooms} banheiros</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ações</h2>
            <div className="space-y-3">
              <Link
                href={`/proprietario/casas/${property.id}/calendario`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Calendar className="w-5 h-5" />
                Gerenciar Calendário
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
