import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas: apenas /admin/* e /proprietario/* (exceto as páginas de login raiz)
  const isAdminProtected = pathname.startsWith('/admin/') && pathname !== '/admin';
  const isProprietarioProtected = pathname.startsWith('/proprietario/') && pathname !== '/proprietario';
  
  const isProtectedRoute = isAdminProtected || isProprietarioProtected;

  // Se não for rota protegida, permite acesso público
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verifica autenticação
  const token = request.cookies.get('auth-token')?.value;

  // Se não tiver token, redireciona para login apropriado
  if (!token) {
    if (isAdminProtected) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (isProprietarioProtected) {
      return NextResponse.redirect(new URL('/proprietario', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
