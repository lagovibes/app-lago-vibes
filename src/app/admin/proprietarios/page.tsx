'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, User, Mail, Phone, Edit, Trash2, Home } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  propertyIds: string[];
}

export default function ProprietariosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    // Carregar proprietários
    const savedOwners = localStorage.getItem('owners');
    if (savedOwners) {
      setOwners(JSON.parse(savedOwners));
    }

    // Carregar casas
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este proprietário? O vínculo com as casas será removido.')) {
      // Remover da lista de proprietários
      const updatedOwners = owners.filter(o => o.id !== id);
      setOwners(updatedOwners);
      localStorage.setItem('owners', JSON.stringify(updatedOwners));
      
      // Remover vínculo ownerId das casas dele (setar como null ou string vazia)
      const updatedProperties = properties.map(property => {
        if (property.ownerId === id) {
          return { ...property, ownerId: '' };
        }
        return property;
      });
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));
      
      // Remover sessão do proprietário se ele estiver logado
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        if (session.id === id && session.role === 'owner') {
          localStorage.removeItem('userSession');
          localStorage.removeItem('isOwnerLoggedIn');
          localStorage.removeItem('currentOwnerId');
          localStorage.removeItem('currentOwnerEmail');
        }
      }
      
      alert('Proprietário excluído com sucesso!');
    }
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOwnerProperties = (ownerId: string) => {
    return properties.filter(p => p.ownerId === ownerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proprietários</h1>
          <p className="text-gray-600">
            Gerencie os proprietários e suas casas vinculadas
          </p>
        </div>
        <Link
          href="/admin/proprietarios/novo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Novo Proprietário
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Proprietários</p>
              <p className="text-3xl font-bold text-gray-900">{owners.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Casas Vinculadas</p>
              <p className="text-3xl font-bold text-green-600">
                {properties.filter(p => p.ownerId && p.ownerId !== '').length}
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
              <p className="text-sm text-gray-600 mb-1">Média Casas/Proprietário</p>
              <p className="text-3xl font-bold text-purple-600">
                {owners.length > 0 
                  ? (properties.filter(p => p.ownerId && p.ownerId !== '').length / owners.length).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Home className="w-6 h-6 text-purple-600" />
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
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Owners List */}
      {filteredOwners.length > 0 ? (
        <div className="space-y-4">
          {filteredOwners.map((owner) => {
            const ownerProperties = getOwnerProperties(owner.id);
            return (
              <div
                key={owner.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Owner Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{owner.name}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{owner.phone}</span>
                      </div>
                    </div>

                    {/* Properties */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Casas Vinculadas ({ownerProperties.length})
                      </p>
                      {ownerProperties.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {ownerProperties.map((property) => (
                            <span
                              key={property.id}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              {property.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Nenhuma casa vinculada</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 lg:flex-col">
                    <Link
                      href={`/admin/proprietarios/${owner.id}/editar`}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(owner.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum proprietário encontrado</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Tente buscar com outros termos.'
              : 'Adicione o primeiro proprietário para começar.'}
          </p>
          {!searchTerm && (
            <Link
              href="/admin/proprietarios/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeiro Proprietário
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
