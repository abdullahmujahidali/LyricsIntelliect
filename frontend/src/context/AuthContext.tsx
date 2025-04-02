import { userService } from "@/services/user";
import { AuthTokens } from "@/types/auth";
import { User } from "@/types/user";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getStoredAuth, removeStoredAuth, setStoredAuth } from "../lib/storage";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Failed to fetch user data:", error);

      // Don't immediately log out - the axios interceptor will
      // handle token refresh if needed
      if (!(error instanceof Error && error.message.includes("401"))) {
        removeStoredAuth();
        setIsAuthenticated(false);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.accessToken) {
      fetchUserData().catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [fetchUserData]);

  const login = async (access: string, refresh: string): Promise<void> => {
    const tokens: AuthTokens = { accessToken: access, refreshToken: refresh };
    setStoredAuth(tokens);
    await fetchUserData();
  };

  const logout = (): void => {
    removeStoredAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
