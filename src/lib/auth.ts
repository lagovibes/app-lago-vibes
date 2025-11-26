// Sistema de autenticação com separação completa entre Admin e Proprietário

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin_master' | 'admin_limited' | 'owner';
  name?: string;
}

// Usuário ADMIN MASTER (acesso total)
const ADMIN_MASTER: User = {
  id: 'admin-master-1',
  email: 'alexandre.udak_ph22@hotmail.com',
  password: 'Xa914573',
  role: 'admin_master',
  name: 'Alexandre'
};

// Usuário demo (mantido para compatibilidade, mas como admin master)
const DEMO_USER: User = {
  id: 'demo-1',
  email: 'admin@lagovibes.com',
  password: 'admin123',
  role: 'admin_master',
  name: 'Demo Admin'
};

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Autentica APENAS administradores (MASTER e LIMITADO)
 * NÃO valida proprietários
 */
export function authenticateAdmin(email: string, password: string): AuthResult {
  // Verificar ADMIN MASTER principal
  if (email === ADMIN_MASTER.email && password === ADMIN_MASTER.password) {
    return { success: true, user: ADMIN_MASTER };
  }
  
  // Verificar demo (mantido para compatibilidade)
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    return { success: true, user: DEMO_USER };
  }
  
  // Verificar ADMIN LIMITADO no localStorage
  if (typeof window !== 'undefined') {
    try {
      const savedAdmins = localStorage.getItem('admins');
      
      if (savedAdmins) {
        const admins = JSON.parse(savedAdmins);
        
        const admin = admins.find((a: any) => 
          a.email === email && a.senha === password && a.role === 'admin_limited'
        );
        
        if (admin) {
          return {
            success: true,
            user: {
              id: admin.id,
              email: admin.email,
              password: admin.senha,
              role: 'admin_limited',
              name: admin.name
            }
          };
        }
      }
    } catch (error) {
      console.error('Erro ao verificar admins limitados:', error);
    }
  }
  
  return { success: false, error: 'Email ou senha incorretos para Administrador' };
}

/**
 * Autentica APENAS proprietários
 * NÃO valida administradores
 */
export function authenticateOwner(email: string, password: string): AuthResult {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Email ou senha incorretos para Proprietário' };
  }

  try {
    const savedOwners = localStorage.getItem('owners');
    
    if (!savedOwners) {
      return { success: false, error: 'Email ou senha incorretos para Proprietário' };
    }

    const owners = JSON.parse(savedOwners);
    
    // Buscar proprietário com email e senha exatos
    // CORREÇÃO: proprietários são salvos com 'senha', não 'password'
    const owner = owners.find((o: any) => 
      o.email === email && o.senha === password
    );
    
    if (owner) {
      return {
        success: true,
        user: {
          id: owner.id,
          email: owner.email,
          password: owner.senha,
          role: 'owner',
          name: owner.name
        }
      };
    }
    
    return { success: false, error: 'Email ou senha incorretos para Proprietário' };
  } catch (error) {
    console.error('Erro ao autenticar proprietário:', error);
    return { success: false, error: 'Email ou senha incorretos para Proprietário' };
  }
}

/**
 * Salva sessão do usuário de forma isolada
 */
export function saveUserSession(user: User): void {
  if (typeof window === 'undefined') return;

  // Limpar TODAS as sessões antigas antes de criar nova
  clearAllSessions();
  
  // Salvar sessão unificada
  const session = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('userSession', JSON.stringify(session));
  
  // Salvar sessão específica baseada no tipo
  if (user.role === 'admin_master' || user.role === 'admin_limited') {
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('currentAdminId', user.id);
    localStorage.setItem('currentAdminEmail', user.email);
    localStorage.setItem('currentAdminRole', user.role);
  } else if (user.role === 'owner') {
    localStorage.setItem('isOwnerLoggedIn', 'true');
    localStorage.setItem('currentOwnerId', user.id);
    localStorage.setItem('currentOwnerEmail', user.email);
  }
}

/**
 * Limpa TODAS as sessões (admin e proprietário)
 */
function clearAllSessions(): void {
  if (typeof window === 'undefined') return;

  // Limpar sessão unificada
  localStorage.removeItem('userSession');
  
  // Limpar sessões de admin
  localStorage.removeItem('isAdminLoggedIn');
  localStorage.removeItem('currentAdminId');
  localStorage.removeItem('currentAdminEmail');
  localStorage.removeItem('currentAdminRole');
  
  // Limpar sessões de proprietário
  localStorage.removeItem('isOwnerLoggedIn');
  localStorage.removeItem('currentOwnerId');
  localStorage.removeItem('currentOwnerEmail');
}

/**
 * Remove sessão do usuário
 */
export function clearUserSession(role?: 'admin_master' | 'admin_limited' | 'owner'): void {
  if (typeof window === 'undefined') return;

  if (!role) {
    // Se não especificar role, limpar tudo
    clearAllSessions();
    return;
  }
  
  // Limpar sessão unificada
  localStorage.removeItem('userSession');
  
  // Limpar sessões específicas
  if (role === 'admin_master' || role === 'admin_limited') {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('currentAdminId');
    localStorage.removeItem('currentAdminEmail');
    localStorage.removeItem('currentAdminRole');
  } else if (role === 'owner') {
    localStorage.removeItem('isOwnerLoggedIn');
    localStorage.removeItem('currentOwnerId');
    localStorage.removeItem('currentOwnerEmail');
  }
}

/**
 * Verifica se usuário está autenticado
 */
export function isAuthenticated(role: 'admin' | 'owner'): boolean {
  if (typeof window === 'undefined') return false;
  
  const userSession = localStorage.getItem('userSession');
  if (!userSession) return false;
  
  try {
    const session = JSON.parse(userSession);
    
    if (role === 'admin') {
      return session.role === 'admin_master' || session.role === 'admin_limited';
    } else if (role === 'owner') {
      return session.role === 'owner';
    }
  } catch (error) {
    return false;
  }
  
  return false;
}

/**
 * Obtém role do admin atual
 */
export function getCurrentAdminRole(): 'admin_master' | 'admin_limited' | null {
  if (typeof window === 'undefined') return null;
  
  const userSession = localStorage.getItem('userSession');
  if (!userSession) return null;
  
  try {
    const session = JSON.parse(userSession);
    if (session.role === 'admin_master' || session.role === 'admin_limited') {
      return session.role;
    }
  } catch (error) {
    return null;
  }
  
  return null;
}

/**
 * Verifica se admin atual é MASTER
 */
export function isAdminMaster(): boolean {
  return getCurrentAdminRole() === 'admin_master';
}

/**
 * Verifica se admin atual é LIMITADO
 */
export function isAdminLimited(): boolean {
  return getCurrentAdminRole() === 'admin_limited';
}

/**
 * Obtém redirecionamento baseado na role
 */
export function getRedirectPath(role: 'admin_master' | 'admin_limited' | 'owner'): string {
  if (role === 'admin_master' || role === 'admin_limited') {
    return '/admin/dashboard';
  }
  return '/proprietario/dashboard';
}

/**
 * Obtém caminho de login baseado na role
 */
export function getLoginPath(role: 'admin' | 'owner'): string {
  return '/';
}

/**
 * Verifica permissões do admin
 */
export interface AdminPermissions {
  canCreateAdmins: boolean;
  canCreateOwners: boolean;
  canEditEverything: boolean;
  canDeleteUsers: boolean;
  canAccessFullFinancial: boolean;
  canEditAdvancedSettings: boolean;
  canCreateReservations: boolean;
  canEditReservations: boolean;
  canViewAllHouses: boolean;
  canViewAllReservations: boolean;
}

export function getAdminPermissions(): AdminPermissions {
  const role = getCurrentAdminRole();
  
  if (role === 'admin_master') {
    return {
      canCreateAdmins: true,
      canCreateOwners: true,
      canEditEverything: true,
      canDeleteUsers: true,
      canAccessFullFinancial: true,
      canEditAdvancedSettings: true,
      canCreateReservations: true,
      canEditReservations: true,
      canViewAllHouses: true,
      canViewAllReservations: true
    };
  }
  
  if (role === 'admin_limited') {
    return {
      canCreateAdmins: false,
      canCreateOwners: false,
      canEditEverything: false,
      canDeleteUsers: false,
      canAccessFullFinancial: false,
      canEditAdvancedSettings: false,
      canCreateReservations: true,
      canEditReservations: true,
      canViewAllHouses: true,
      canViewAllReservations: true
    };
  }
  
  // Sem permissões se não for admin
  return {
    canCreateAdmins: false,
    canCreateOwners: false,
    canEditEverything: false,
    canDeleteUsers: false,
    canAccessFullFinancial: false,
    canEditAdvancedSettings: false,
    canCreateReservations: false,
    canEditReservations: false,
    canViewAllHouses: false,
    canViewAllReservations: false
  };
}

/**
 * Obtém sessão atual do usuário
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userSession = localStorage.getItem('userSession');
  if (!userSession) return null;
  
  try {
    const session = JSON.parse(userSession);
    return {
      id: session.id,
      email: session.email,
      password: '', // Não retornar senha
      role: session.role,
      name: session.name
    };
  } catch (error) {
    return null;
  }
}
