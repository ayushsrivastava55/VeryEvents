import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/services/api";

interface User {
  id: string;
  verychatId: string;
  displayName?: string;
  profileImage?: string;
  walletAddress?: string;
  kycVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  requestCode: (handleId: string) => Promise<{ error: string | null }>;
  login: (handleId: string, code: string, walletAddress?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Step 1: Request verification code via VeryChat
  const requestCode = async (handleId: string) => {
    try {
      await authApi.requestCode(handleId);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.response?.data?.error || error.message };
    }
  };

  // Step 2: Login with verification code
  const login = async (handleId: string, code: string, walletAddress?: string) => {
    try {
      const response = await authApi.login(handleId, code, walletAddress);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.response?.data?.error || error.message };
    }
  };

  const signOut = async () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      requestCode, 
      login, 
      signOut,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
