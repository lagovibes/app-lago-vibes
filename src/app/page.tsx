'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils-format';
import { MapPin, Users, Bed, Bath, Calendar, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Property } from '@/lib/types';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Verificar se estamos no browser
      if (typeof window === 'undefined') return;

      // Carregar casas do localStorage com tratamento de erro
      const storedProperties = localStorage.getItem('properties');
      if (storedProperties) {
        try {
          const allProperties = JSON.parse(storedProperties);
          // Mostrar apenas as 3 primeiras casas na home
          if (Array.isArray(allProperties)) {
            setProperties(allProperties.slice(0, 3));
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse das propriedades:', parseError);
          setProperties([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
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
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="px-4 py-8 sm:py-12 md:py-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight break-words max-w-5xl mx-auto">
                Casas de luxo no Lago de Furnas
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed break-words px-2">
                Casas premium com conforto, privacidade e experiências exclusivas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/casas"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Ver Todas as Casas
              </Link>
              <Link
                href="/disponibilidade"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Verificar Disponibilidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Casas em Destaque
          </h2>
          <p className="text-xl text-gray-600">
            Conheça algumas de nossas propriedades mais procuradas
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Carregando casas...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma casa disponível no momento.</p>
            <Link
              href="/casas"
              className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Explorar Casas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/casa/${property.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'}
                    alt={property.name || 'Casa'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {property.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{property.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-blue-500" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4 text-blue-500" />
                      <span>{property.bathrooms}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-900 font-semibold">
                      A partir de {formatCurrency(property.valorBase)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/casas"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Ver Todas as Casas
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para reservar sua próxima experiência?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e garanta as melhores datas para sua estadia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contato"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <Phone className="w-5 h-5 inline mr-2" />
              Falar com Especialista
            </Link>
            <Link
              href="/disponibilidade"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Verificar Disponibilidade
            </Link>
          </div>
        </div>
      </section>

   {/* Footer */}
<footer className="bg-gray-900 text-white py-12 mt-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* LOGO + TEXTO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">LV</span>
          </div>
          <span className="text-2xl font-bold">Lago Vibes</span>
        </div>
        <p className="text-gray-400 leading-6">
          As melhores casas de luxo no Lago de Furnas - MG
        </p>
      </div>

      {/* LINKS ÚTEIS */}
      <div>
        <h3 className="font-semibold mb-4">📌 Links Úteis</h3>
        <ul className="space-y-2 text-gray-300">
          <li>🏠 <Link href="/casas" className="hover:text-white">Todas as Casas</Link></li>
          <li>📆 <Link href="/disponibilidade" className="hover:text-white">Consultar Disponibilidade</Link></li>
          <li>📱 <Link href="/contato" className="hover:text-white">Contatos</Link></li>
          <li>🔐 <Link href="/login" className="hover:text-white">Área do Admin</Link></li>
        </ul>
      </div>

      {/* CONTATOS */}
      <div>
        <h3 className="font-semibold mb-4">📞 Contato</h3>
        <ul className="space-y-2 text-gray-300">

          <li>
            <a href="https://wa.me/message/2K2OFJXQOYH7K1" target="_blank" className="hover:text-green-300">
              WhatsApp — (31) 97334-6945
            </a>
          </li>

          <li>
            <a href="https://www.instagram.com/lago_vibes?igsh=dXV1aXd0YnZkbnIy&utm_source=qr" target="_blank" className="hover:text-pink-400">
              Instagram — @lago_vibes
            </a>
          </li>

          <li>Email: LagoVibes@hotmail.com</li>
        </ul>
      </div>
    </div>

    {/* DIREITOS */}
    <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
      <p>© 2024 Lago Vibes. Todos os direitos reservados.</p>
    </div>
  </div>
</footer>
</div>
</main> 
