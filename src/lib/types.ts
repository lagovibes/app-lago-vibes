// Tipos do sistema Lago Vibes

export interface Property {
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
  valorBase: number; // Valor Mínimo / A partir de (obrigatório para exibição pública)
  startingPrice?: number; // Preço inicial para exibição pública (opcional - deprecated)
  whatsappNumber?: string; // Número do WhatsApp para contato (opcional)
  images: string[];
  videos?: string[];
  latitude?: number;
  longitude?: number;
  status: 'available' | 'unavailable';
  ownerId: string;
  extras: string[];
  createdAt: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  percentage: number;
  properties: string[];
  createdAt: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  clientEmail?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalValue: number;
  extras: ReservationExtra[];
  paymentStatus: 'paid' | 'pending' | 'partial';
  createdAt: string;
}

export interface ReservationExtra {
  extraId: string;
  quantity: number;
  price: number;
}

export interface Extra {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  createdAt: string;
}

// Novo tipo para serviços extras agendados
export interface ExtraService {
  id: string;
  reservationId: string;
  propertyId: string;
  clientName: string;
  extraType: string; // Nome do tipo de extra (Lancha, Jet Ski, Gelo, etc)
  serviceDate: string; // Data do serviço (apenas um dia)
  serviceTime?: string; // Horário do serviço
  totalValue: number;
  paidValue: number;
  providerTotalValue: number; // Repasse total do prestador
  providerPaidValue: number; // Repasse pago ao prestador
  paymentStatus: 'paid' | 'pending' | 'partial';
  createdAt: string;
}
