'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, Phone, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  clientPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  ownerTotalValue: number;
  ownerPaidValue: number;
}

export default function ProprietarioReservasPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);

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

    // Buscar casas e reservas do proprietário
    const savedProperties = localStorage.getItem('properties');
    const savedReservations = localStorage.getItem('reservations');

    if (savedProperties && savedReservations) {
      const properties = JSON.parse(savedProperties);
      const allReservations = JSON.parse(savedReservations);
      
      // Filtrar apenas casas do proprietário logado
      const ownerPropertyIds = properties
        .filter((p: any) => p.ownerId === ownerId)
        .map((p: any) => p.id);

      // Filtrar apenas reservas das casas do proprietário
      const ownerReservations = allReservations
        .filter((r: any) => ownerPropertyIds.includes(r.propertyId))
        .map((r: any) => {
          const property = properties.find((p: any) => p.id === r.propertyId);
          return {
            ...r,
            propertyName: property?.name || 'Casa não encontrada',
          };
        });

      setReservations(ownerReservations);
    }
  }, [router]);

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };
    
    const labels = {
      pending: 'Pendente',
      partial: 'Parcial',
      paid: 'Pago',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservas</h1>
        <p className="text-gray-600">
          Visualize todas as reservas das suas propriedades
        </p>
      </div>

      {/* Reservations List */}
      {reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const totalAmount = reservation.ownerTotalValue || 0;
            const paidAmount = reservation.ownerPaidValue || 0;
            const remainingAmount = totalAmount - paidAmount;

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">
                        {reservation.propertyName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{reservation.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{reservation.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Check-in: {formatDate(reservation.checkIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Check-out: {formatDate(reservation.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {reservation.guests} {reservation.guests === 1 ? 'hóspede' : 'hóspedes'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Financial */}
                  <div className="lg:w-80 bg-emerald-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status Pagamento:</span>
                      {getPaymentStatusBadge(reservation.paymentStatus)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total a receber:</span>
                        <span className="font-semibold text-gray-900">
                          R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Já recebido:</span>
                        <span className="font-semibold text-green-600">
                          R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200">
                        <span className="text-gray-600">Restante:</span>
                        <span className="font-bold text-orange-600">
                          R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600">
            Quando houver reservas nas suas propriedades, elas aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
