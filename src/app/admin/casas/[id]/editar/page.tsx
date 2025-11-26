'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Upload, Loader2 } from 'lucide-react';
import { mockExtras } from '@/lib/mock-data';

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
  valorBase: number;
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

export default function EditarCasaPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    suites: '',
    weekdayPrice: '',
    weekendPrice: '',
    holidayPrice: '',
    valorBase: '',
    ownerId: '',
    status: 'available',
    extras: [] as string[],
  });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Carregar proprietários do localStorage
    const savedOwners = localStorage.getItem('owners');
    if (savedOwners) {
      setOwners(JSON.parse(savedOwners));
    }

    // Carregar dados da casa do localStorage
    const savedProperties = localStorage.getItem('properties');
    if (savedProperties) {
      const properties: Property[] = JSON.parse(savedProperties);
      const property = properties.find(p => p.id === propertyId);
      
      if (property) {
        setFormData({
          name: property.name,
          description: property.description,
          location: property.location,
          capacity: property.capacity.toString(),
          bedrooms: property.bedrooms.toString(),
          bathrooms: property.bathrooms.toString(),
          suites: property.suites.toString(),
          weekdayPrice: property.weekdayPrice.toString(),
          weekendPrice: property.weekendPrice.toString(),
          holidayPrice: property.holidayPrice.toString(),
          valorBase: property.valorBase?.toString() || '',
          ownerId: property.ownerId || '',
          status: property.status,
          extras: property.extras,
        });
        setImages(property.images);
      }
    }
    setLoading(false);
  }, [propertyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProperty: Property = {
      id: propertyId,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      capacity: parseInt(formData.capacity),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      suites: parseInt(formData.suites),
      weekdayPrice: parseFloat(formData.weekdayPrice),
      weekendPrice: parseFloat(formData.weekendPrice),
      holidayPrice: parseFloat(formData.holidayPrice),
      valorBase: parseFloat(formData.valorBase),
      ownerId: formData.ownerId,
      status: formData.status as 'available' | 'unavailable',
      extras: formData.extras,
      images: images,
    };

    console.log('Salvando casa com proprietário:', formData.ownerId);

    // Salvar no localStorage
    const savedProperties = localStorage.getItem('properties');
    let properties: Property[] = savedProperties ? JSON.parse(savedProperties) : [];
    
    const index = properties.findIndex(p => p.id === propertyId);
    if (index !== -1) {
      properties[index] = updatedProperty;
    }
    
    localStorage.setItem('properties', JSON.stringify(properties));
    
    console.log('Casa salva com sucesso:', updatedProperty);
    
    alert('Casa atualizada com sucesso!');
    router.push('/admin/casas');
  };

  const toggleExtra = (extraId: string) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    Array.from(files).forEach(file => {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida`);
        return;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Tamanho máximo: 5MB`);
        return;
      }

      // Converter para base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImages(prev => [...prev, base64]);
      };
      reader.onerror = () => {
        alert(`Erro ao carregar ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    setUploading(false);
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/casas"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Casa</h1>
          <p className="text-gray-600">Atualize as informações da propriedade</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Casa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localização *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proprietário *
              </label>
              <select
                value={formData.ownerId}
                onChange={(e) => {
                  console.log('Proprietário selecionado:', e.target.value);
                  setFormData({ ...formData, ownerId: e.target.value });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um proprietário</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Disponível</option>
                <option value="unavailable">Indisponível</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capacidades */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Capacidades</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacidade *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quartos *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banheiros *
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suítes *
              </label>
              <input
                type="number"
                value={formData.suites}
                onChange={(e) => setFormData({ ...formData, suites: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Valores (R$)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Mínimo / A partir de *
              </label>
              <input
                type="number"
                value={formData.valorBase}
                onChange={(e) => setFormData({ ...formData, valorBase: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
                placeholder="Ex: 800.00"
              />
              <p className="text-xs text-gray-500 mt-1">Este valor será exibido na página pública como "A partir de R$ X"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dia de Semana *
              </label>
              <input
                type="number"
                value={formData.weekdayPrice}
                onChange={(e) => setFormData({ ...formData, weekdayPrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Segunda a quinta</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Final de Semana *
              </label>
              <input
                type="number"
                value={formData.weekendPrice}
                onChange={(e) => setFormData({ ...formData, weekendPrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Sexta a domingo</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feriado *
              </label>
              <input
                type="number"
                value={formData.holidayPrice}
                onChange={(e) => setFormData({ ...formData, holidayPrice: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Feriados e datas especiais</p>
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Fotos</h2>
          
          <div className="space-y-4">
            {/* Input oculto para seleção de arquivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Botão de upload */}
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 text-gray-700 hover:text-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Carregando...' : 'Clique para escolher fotos da galeria ou computador'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              📸 Você pode selecionar múltiplas imagens de uma vez. Tamanho máximo: 5MB por imagem.
            </p>

            {/* Preview das imagens */}
            {images.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {images.length} {images.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        title="Remover imagem"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        Foto {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Extras */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Extras Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockExtras.map(extra => (
              <label
                key={extra.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.extras.includes(extra.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.extras.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-gray-900">{extra.name}</p>
                  <p className="text-sm text-gray-600">R$ {extra.price} / {extra.unit}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Salvar Alterações
          </button>
          <Link
            href="/admin/casas"
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
