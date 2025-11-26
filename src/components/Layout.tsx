import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Users, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para notificações de chat
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const locationRef = useRef(location.pathname);

  // Atualiza a ref de localização sempre que mudar
  useEffect(() => {
    locationRef.current = location.pathname;
    // Se o usuário entrar no chat, limpa a notificação
    if (location.pathname === '/chat') {
      setHasUnreadMessages(false);
    }
  }, [location.pathname]);

  // Escuta mensagens do BroadcastChannel (mesmo canal do Chat.tsx)
  useEffect(() => {
    const channel = new BroadcastChannel('eduportal_chat_channel');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_MESSAGE') {
        // Só marca como não lido se o usuário NÃO estiver na página de chat
        if (locationRef.current !== '/chat') {
          setHasUnreadMessages(true);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Painel' },
    { to: '/materials', icon: <BookOpen size={20} />, label: 'Materiais' },
    { to: '/calendar', icon: <CalendarIcon size={20} />, label: 'Calendário' },
    { to: '/chat', icon: <MessageSquare size={20} />, label: 'Chat da Turma' },
  ];

  if (user?.role === UserRole.TEACHER) {
    navItems.push({ to: '/students', icon: <Users size={20} />, label: 'Alunos' });
  }

  const roleLabels = {
    [UserRole.TEACHER]: 'Professor',
    [UserRole.STUDENT]: 'Aluno'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EduPortal</span>
            <button 
              className="ml-auto lg:hidden text-gray-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 bg-gray-50">
             <div className="flex items-center space-x-3">
               <img 
                 src={user?.avatar || "https://picsum.photos/200"} 
                 alt={user?.name}
                 className="w-10 h-10 rounded-full border border-gray-200"
               />
               <div className="overflow-hidden">
                 <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                 <p className="text-xs text-gray-500 capitalize">{user?.role ? roleLabels[user.role] : ''}</p>
               </div>
             </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.to === '/chat' && hasUnreadMessages && (
                  <span className="absolute right-3 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" title="Novas mensagens"></span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
           <div className="flex items-center">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
               <span className="text-white font-bold">E</span>
             </div>
             <span className="font-bold text-gray-900">EduPortal</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 relative">
             <Menu size={24} />
             {hasUnreadMessages && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 transform -translate-y-1/4 translate-x-1/4"></span>
             )}
           </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;