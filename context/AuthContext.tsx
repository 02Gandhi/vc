import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole, CompanyProfile, ContractorProfile } from '../types';
import api, { MOCK_CONTRACTOR, MOCK_CLIENT } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  signup: (role: UserRole, profileData: CompanyProfile | ContractorProfile, accountData: { email: string }) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: User) => void;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // The application now starts without any user logged in by default.
    // Login state does not persist across page reloads.
    setLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const userToLogin = role === UserRole.Contractor ? MOCK_CONTRACTOR : MOCK_CLIENT;
    setUser(userToLogin);
  };
  
  const signup = async (role: UserRole, profileData: CompanyProfile | ContractorProfile, accountData: { email: string }) => {
    let newUser: User;
    if (role === UserRole.Client) {
        newUser = await api.signUpClient(profileData as CompanyProfile, accountData);
    } else {
        newUser = await api.signUpContractor(profileData as ContractorProfile, accountData);
    }
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);


  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading, isLoginModalOpen, openLoginModal, closeLoginModal }}>
      {!loading && children}
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