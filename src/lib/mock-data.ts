// Dados mockados para demonstração

import { Property, Owner, Reservation, Extra } from './types';

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Casa do Lago Vista',
    description: 'Linda casa com vista privilegiada para o lago. Perfeita para famílias e grupos de amigos. Ambiente aconchegante com toda infraestrutura necessária para momentos inesquecíveis.',
    location: 'Lago Sul, Brasília - DF',
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    suites: 2,
    weekdayPrice: 800,
    weekendPrice: 1200,
    holidayPrice: 1500,
    valorBase: 800, // Valor Mínimo / A partir de
    startingPrice: 800, // Preço inicial para exibição pública (deprecated)
    whatsappNumber: '61999999999', // Número do WhatsApp
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    ],
    videos: [],
    latitude: -15.8267,
    longitude: -47.9218,
    status: 'available',
    ownerId: '1',
    extras: ['1', '2', '3'],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Mansão Paraíso',
    description: 'Mansão luxuosa com piscina, churrasqueira e deck completo. Ideal para eventos e celebrações especiais. Espaço amplo e confortável.',
    location: 'Lago Norte, Brasília - DF',
    capacity: 12,
    bedrooms: 6,
    bathrooms: 5,
    suites: 4,
    weekdayPrice: 1500,
    weekendPrice: 2200,
    holidayPrice: 2800,
    valorBase: 1500, // Valor Mínimo / A partir de
    startingPrice: 1500, // Preço inicial para exibição pública (deprecated)
    whatsappNumber: '61999999999', // Número do WhatsApp
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    ],
    status: 'available',
    ownerId: '2',
    extras: ['1', '2', '3', '4'],
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Chalé Tranquilidade',
    description: 'Chalé aconchegante perfeito para casais ou pequenas famílias. Ambiente rústico e charmoso com toda comodidade moderna.',
    location: 'Lago Oeste, Brasília - DF',
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    suites: 1,
    weekdayPrice: 500,
    weekendPrice: 750,
    holidayPrice: 950,
    valorBase: 500, // Valor Mínimo / A partir de
    startingPrice: 500, // Preço inicial para exibição pública (deprecated)
    whatsappNumber: '61999999999', // Número do WhatsApp
    images: [
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    ],
    status: 'available',
    ownerId: '1',
    extras: ['3', '4'],
    createdAt: '2024-01-03',
  },
];

export const mockOwners: Owner[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '(61) 99999-1111',
    percentage: 70,
    properties: ['1', '3'],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '(61) 99999-2222',
    percentage: 75,
    properties: ['2'],
    createdAt: '2024-01-02',
  },
];

export const mockReservations: Reservation[] = [
  {
    id: '1',
    propertyId: '1',
    clientName: 'Carlos Oliveira',
    clientCpf: '123.456.789-00',
    clientPhone: '(61) 98888-1111',
    clientEmail: 'carlos@email.com',
    checkIn: '2024-06-15',
    checkOut: '2024-06-17',
    guests: 6,
    totalValue: 2400,
    extras: [
      { extraId: '1', quantity: 1, price: 500 },
      { extraId: '3', quantity: 2, price: 100 },
    ],
    paymentStatus: 'paid',
    createdAt: '2024-05-20',
  },
  {
    id: '2',
    propertyId: '2',
    clientName: 'Ana Paula',
    clientCpf: '987.654.321-00',
    clientPhone: '(61) 98888-2222',
    checkIn: '2024-07-01',
    checkOut: '2024-07-05',
    guests: 10,
    totalValue: 8800,
    extras: [
      { extraId: '1', quantity: 2, price: 1000 },
      { extraId: '2', quantity: 2, price: 600 },
    ],
    paymentStatus: 'pending',
    createdAt: '2024-06-10',
  },
];

export const mockExtras: Extra[] = [
  {
    id: '1',
    name: 'Lancha',
    description: 'Lancha para passeios no lago',
    price: 500,
    unit: 'diária',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Jet Ski',
    description: 'Jet ski para diversão',
    price: 300,
    unit: 'diária',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Gelo',
    description: 'Gelo para churrascos',
    price: 50,
    unit: 'saco',
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Churrasqueira Premium',
    description: 'Churrasqueira profissional com utensílios',
    price: 150,
    unit: 'diária',
    createdAt: '2024-01-01',
  },
];
