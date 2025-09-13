import React, { createContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    return { ...parsed, id: parsed._id || parsed.id };
  });

  const login = async (email?: string) => {
    // If JWT exists, fetch user from backend
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      const res = await fetch('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        const userObj = { ...data, id: data._id || data.id };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return;
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('jwt');
        throw new Error('Invalid JWT');
      }
    }
    // Fallback: demo credentials
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = {
      id: '1',
      email: email || '',
      name: 'Demo User',
      role: 'admin'
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};