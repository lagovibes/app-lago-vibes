import Link from 'next/link';
import { ArrowLeft, MessageCircle, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export default function ContatoPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-lg text-gray-600">
            Estamos prontos para ajudar você a encontrar a casa perfeita
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp */}
          <a
            href="https://wa.me/message/2K2OFJXQOYH7K1"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 group"
          >
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 mb-4">
              Atendimento rápido e personalizado
            </p>
            <p className="text-xl font-semibold text-green-600">
              (31) 97334-6945
            </p>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/lago_vibes?igsh=dXV1aXd0YnZkbnIy&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 group"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Instagram className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Instagram</h3>
            <p className="text-gray-600 mb-4">
              Veja fotos e novidades
            </p>
            <p className="text-xl font-semibold text-pink-600">
              @lago_vibes
            </p>
          </a>

          {/* Phone */}
          <a
            href="tel:+5531973346945"
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 group"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Telefone</h3>
            <p className="text-gray-600 mb-4">
              Ligue para nós
            </p>
            <p className="text-xl font-semibold text-blue-600">
              (31) 97334-6945
            </p>
          </a>

          {/* Email */}
          <a
            href="mailto:lagovibes@hotmail.com"
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 group"
          >
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">E-mail</h3>
            <p className="text-gray-600 mb-4">
              Envie sua mensagem
            </p>
            <p className="text-xl font-semibold text-cyan-600">
              lagovibes@hotmail.com
            </p>
          </a>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nossa Localização</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Lago de Furnas – Formiga, MG
          </p>
          <div className="bg-gray-100 rounded-xl p-6">
            <p className="text-gray-700 font-medium mb-2">Horário de Atendimento</p>
            <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
            <p className="text-gray-600">Sábado: 9h às 14h</p>
            <p className="text-gray-600">Domingo: Plantão via WhatsApp</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Ver Casas Disponíveis
          </Link>
        </div>
      </div>
    </div>
  );
}
