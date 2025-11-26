'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  DollarSign, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function ProprietarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isOwnerLoggedIn');
    const ownerId = localStorage.getItem('currentOwnerId');
    
    if (!isLoggedIn && pathname !== '/proprietario') {
      router.push('/proprietario');
    }

    // Buscar nome do proprietário
    if (ownerId) {
      const savedOwners = localStorage.getItem('owners');
      if (savedOwners) {
        const owners = JSON.parse(savedOwners);
        const owner = owners.find((o: any) => o.id === ownerId);
        if (owner) {
          setOwnerName(owner.name);
        }
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isOwnerLoggedIn');
    localStorage.removeItem('currentOwnerId');
    router.push('/proprietario');
  };

  // Se estiver na página de login, não mostra o layout
  if (pathname === '/proprietario') {
    return children;
  }

  const menuItems = [
    { href: '/proprietario/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/proprietario/casas', icon: Home, label: 'Minhas Casas' },
    { href: '/proprietario/reservas', icon: Calendar, label: 'Reservas' },
    { href: '/proprietario/financeiro', icon: DollarSign, label: 'Financeiro' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/proprietario/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">LV</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-gray-900">Lago Vibes</span>
                <span className="block text-xs text-gray-500">Proprietário</span>
              </div>
            </Link>
          </div>

          {/* Owner Info */}
          {ownerName && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-100">
              <p className="text-xs text-emerald-600 mb-1">Bem-vindo(a)</p>
              <p className="font-semibold text-gray-900">{ownerName}</p>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all mb-2"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Ver Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
