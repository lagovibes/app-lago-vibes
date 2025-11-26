'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils-format';
import { MapPin, Users, Bed, Bath } from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para a coleção Casas
interface Casa {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  valorBase: number;
  images: string[];
}

export default function CasasPage() {
  const [casas, setCasas] = useState<Casa[]>([]);

  useEffect(() => {
    // Carregar casas da coleção "properties" (onde o admin salva)
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      const properties = JSON.parse(storedProperties);
      setCasas(properties);
    }
  }, []);

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
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/casas" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Casas
              </Link>
              <Link href="/disponibilidade" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Disponibilidade
              </Link>
              <Link href="/contato" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Contato
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Encontre sua casa dos sonhos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              à beira do lago
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Casas incríveis para suas férias, eventos e momentos especiais em Brasília
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {casas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma casa cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {casas.map((casa) => (
              <Link
                key={casa.id}
                href={`/casa/${casa.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={casa.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'}
                    alt={casa.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {casa.name}
                  </h3>
                  
                  {casa.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{casa.location}</span>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {casa.description}
                  </p>

                  {/* Features */}
                  {(casa.capacity || casa.bedrooms || casa.bathrooms) && (
                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                      {casa.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{casa.capacity}</span>
                        </div>
                      )}
                      {casa.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-blue-500" />
                          <span>{casa.bedrooms}</span>
                        </div>
                      )}
                      {casa.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4 text-blue-500" />
                          <span>{casa.bathrooms}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {casa.valorBase && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-900 font-semibold">
                        A partir de {formatCurrency(casa.valorBase)}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LV</span>
                </div>
                <span className="text-2xl font-bold">Lago Vibes</span>
              </div>
              <p className="text-gray-400">
                As melhores casas para suas férias em Brasília
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/casas" className="hover:text-white transition-colors">Casas</Link></li>
                <li><Link href="/disponibilidade" className="hover:text-white transition-colors">Disponibilidade</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li>WhatsApp: (61) 99999-9999</li>
                <li>Instagram: @lagovibes</li>
                <li>Email: contato@lagovibes.com</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Lago Vibes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
