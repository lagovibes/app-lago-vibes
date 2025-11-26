'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { formatCurrency, getWhatsAppLink } from '@/lib/utils-format';
import { MapPin, Users, Bed, Bath, Sparkles, ArrowLeft, MessageCircle, Calendar } from 'lucide-react';
import type { Property, Extra } from '@/lib/types';

// Adicionar configuração para evitar erros de prefetch
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyExtras, setPropertyExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadProperty = () => {
      try {
        const storedProperties = localStorage.getItem('properties');
        const storedExtras = localStorage.getItem('extras');
        
        if (storedProperties) {
          const properties: Property[] = JSON.parse(storedProperties);
          const foundProperty = properties.find(p => p.id === id);
          
          if (foundProperty) {
            // Aplicar valores padrão para campos opcionais
            const propertyWithDefaults: Property = {
              ...foundProperty,
              images: foundProperty.images && foundProperty.images.length > 0 
                ? foundProperty.images 
                : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
              description: foundProperty.description || 'Casa disponível para locação. Entre em contato para mais informações.',
              valorBase: foundProperty.valorBase || 0,
              whatsappNumber: foundProperty.whatsappNumber || '61999999999',
              extras: foundProperty.extras || []
            };
            
            setProperty(propertyWithDefaults);
            
            // Carregar extras se existirem
            if (storedExtras && propertyWithDefaults.extras.length > 0) {
              const extras: Extra[] = JSON.parse(storedExtras);
              const filteredExtras = extras.filter(extra => 
                propertyWithDefaults.extras.includes(extra.id)
              );
              setPropertyExtras(filteredExtras);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar propriedade:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando propriedade...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    notFound();
  }

  const whatsappMessage = `Olá! Gostaria de saber mais sobre a ${property.name}`;
  const whatsappLink = getWhatsAppLink(property.whatsappNumber || '61999999999', whatsappMessage);
  const displayPrice = property.valorBase;

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
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-96 md:h-[600px] rounded-2xl overflow-hidden">
            <Image
              src={property.images[0]}
              alt={property.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-44 md:h-[290px] rounded-2xl overflow-hidden">
                <Image
                  src={image}
                  alt={`${property.name} - ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {/* Preencher com imagem padrão se não houver 5 imagens */}
            {property.images.length < 5 && Array.from({ length: 5 - property.images.length }).map((_, index) => (
              <div key={`default-${index}`} className="relative h-44 md:h-[290px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"
                  alt={`${property.name} - imagem ${property.images.length + index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Location */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {property.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.capacity}</p>
                  <p className="text-sm text-gray-600">Hóspedes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bed className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">Quartos</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bath className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">Banheiros</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.suites}</p>
                  <p className="text-sm text-gray-600">Suítes</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre a propriedade</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Pricing - Apenas "A partir de" */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 shadow-lg text-white">
              <div className="text-center">
                <p className="text-lg mb-2 opacity-90">Diárias a partir de</p>
                <p className="text-5xl font-bold mb-4">{formatCurrency(displayPrice)}</p>
                <p className="text-sm opacity-80">
                  Entre em contato pelo WhatsApp para consultar valores e disponibilidade
                </p>
              </div>
            </div>

            {/* Extras */}
            {propertyExtras.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Extras Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyExtras.map((extra) => (
                    <div key={extra.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-1">{extra.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{extra.description}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        Consulte valores pelo WhatsApp
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Localização</h2>
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mapa interativo aqui</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-24">
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-600 mb-2">A partir de</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(displayPrice)}
                  <span className="text-lg text-gray-600 font-normal">/dia</span>
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/disponibilidade?propertyId=${property.id}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  <Calendar className="w-5 h-5" />
                  Consultar Disponibilidade
                </Link>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar disponibilidade e reservas pelo WhatsApp
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Resposta rápida • Atendimento personalizado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
