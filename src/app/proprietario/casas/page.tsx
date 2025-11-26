'use client';

import { useEffect, useState } from 'react';
import { Home, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Property {
  id: string;
  name: string;
  location: string;
  capacity: number;
  bedrooms: number;
  status: 'available' | 'unavailable';
  images: string[];
  ownerId: string;
}

export default function ProprietarioCasasPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);

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

    // Buscar casas do proprietário usando ownerId
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      const allProperties = JSON.parse(savedProperties);
      // Filtrar apenas casas onde ownerId corresponde ao ID do proprietário logado
      const ownerProperties = allProperties.filter((p: any) => p.ownerId === ownerId);
      setProperties(ownerProperties);
    }
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Casas</h1>
        <p className="text-gray-600">
          Visualize suas propriedades cadastradas
        </p>
      </div>

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
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

                {/* Actions */}
                <Link
                  href={`/proprietario/casas/${property.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma casa cadastrada</h3>
          <p className="text-gray-600">
            Entre em contato com o administrador para vincular casas à sua conta.
          </p>
        </div>
      )}
    </div>
  );
}
