import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [owner, setOwner] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if owner is already logged in
    const currentOwner = authService.getCurrentOwner();
    if (currentOwner) {
      setOwner(currentOwner.owner);
      setPharmacy(currentOwner.pharmacy);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setOwner(data.owner);
    setPharmacy(data.pharmacy);
    return data;
  };

  const logout = async () => {
    authService.logout();
    setOwner(null);
    setPharmacy(null);
  };

  const value = {
    owner,
    pharmacy,
    login,
    logout,
    isAuthenticated: !!owner,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

