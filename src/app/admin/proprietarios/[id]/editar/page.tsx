'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, X } from 'lucide-react';
import Link from 'next/link';

export default function EditarProprietarioPage() {
  const router = useRouter();
  const params = useParams();
  const ownerId = params.id as string;
  
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    senha: '', // Usar 'senha' em vez de 'password'
    propertyIds: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar proprietário
    const savedOwners = localStorage.getItem('owners');
    if (savedOwners) {
      const owners = JSON.parse(savedOwners);
      const owner = owners.find((o: any) => o.id === ownerId);
      if (owner) {
        setFormData({
          name: owner.name || '',
          email: owner.email || '',
          phone: owner.phone || '',
          senha: owner.senha || '',
          propertyIds: owner.propertyIds || []
        });
      }
    }

    // Carregar casas
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }

    setIsLoading(false);
  }, [ownerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedOwners = localStorage.getItem('owners');
    if (savedOwners) {
      const owners = JSON.parse(savedOwners);
      const updatedOwners = owners.map((o: any) =>
        o.id === ownerId 
          ? { 
              ...o, 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              senha: formData.senha,
              propertyIds: formData.propertyIds // Garantir que propertyIds seja atualizado
            } 
          : o
      );
      localStorage.setItem('owners', JSON.stringify(updatedOwners));
      
      // Log para debug
      console.log('Proprietário atualizado:', {
        id: ownerId,
        name: formData.name,
        propertyIds: formData.propertyIds
      });
    }

    router.push('/admin/proprietarios');
  };

  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => {
      const isCurrentlySelected = prev.propertyIds.includes(propertyId);
      const newPropertyIds = isCurrentlySelected
        ? prev.propertyIds.filter(id => id !== propertyId)
        : [...prev.propertyIds, propertyId];
      
      console.log('Casa toggled:', propertyId, 'Selecionada:', !isCurrentlySelected);
      console.log('IDs atualizados:', newPropertyIds);
      
      return {
        ...prev,
        propertyIds: newPropertyIds
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Proprietário</h1>
          <p className="text-gray-600">Atualize as informações do proprietário</p>
        </div>
        <Link
          href="/admin/proprietarios"
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancelar
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha de Acesso *
              </label>
              <input
                type="text"
                value={formData.senha || ''}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres (senha será salva sem criptografia)</p>
            </div>
          </div>
        </div>

        {/* Casas Vinculadas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Casas Vinculadas</h2>
          
          {formData.propertyIds.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                {formData.propertyIds.length} casa(s) selecionada(s)
              </p>
            </div>
          )}
          
          {properties.length > 0 ? (
            <div className="space-y-3">
              {properties.map((property) => {
                const isSelected = formData.propertyIds.includes(property.id);
                return (
                  <label
                    key={property.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePropertyToggle(property.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        VINCULADA
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma casa cadastrada ainda.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Save className="w-5 h-5" />
            Salvar Alterações
          </button>
          <Link
            href="/admin/proprietarios"
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
