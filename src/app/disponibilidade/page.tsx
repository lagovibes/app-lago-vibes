'use client';

import { Suspense } from 'react';
import DisponibilidadeContent from './DisponibilidadeContent';

export default function DisponibilidadePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando disponibilidade...</p>
        </div>
      </div>
    }>
      <DisponibilidadeContent />
    </Suspense>
  );
}
