import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';
import { studentApi } from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapUser(session.user).then(setUser);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapUser(session.user).then(setUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapUser = async (sbUser: any): Promise<User> => {
    // Lógica para definir o papel (Role) do usuário
    let role = sbUser.user_metadata?.role;
    const email = sbUser.email || '';

    // Se não tiver role definida, aplicamos regras automáticas
    if (!role) {
      if (
        email === 'fornet069@gmail.com' || 
        email.includes('admin') ||         
        email.includes('prof') ||          
        email.includes('teacher')          
      ) {
        role = UserRole.TEACHER;
      } else {
        role = UserRole.STUDENT;
      }
    }

    const name = sbUser.user_metadata?.name || email.split('@')[0] || 'Usuário';
    
    // SINCRONIZAÇÃO AUTOMÁTICA:
    // Se for aluno, garante que ele exista na tabela pública de alunos
    if (role === UserRole.STUDENT) {
      // Chamamos sem await para não bloquear a UI de login
      studentApi.syncLoggedUser(name, email);
    }
    
    return {
      id: sbUser.id,
      name: name,
      email: email,
      role: role as UserRole,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    };
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};