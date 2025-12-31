import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface WepinUser {
  status: "success" | "fail";
  userInfo?: {
    userId: string;
    email: string;
    provider: string;
    use2FA: boolean;
  };
  walletId?: string;
}

interface WepinAccount {
  network: string;
  address: string;
}

interface WepinContextType {
  isInitialized: boolean;
  isConnected: boolean;
  user: WepinUser | null;
  accounts: WepinAccount[];
  balance: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  openWallet: () => Promise<void>;
  getAccounts: () => Promise<WepinAccount[]>;
}

const WepinContext = createContext<WepinContextType | undefined>(undefined);

export const useWepin = () => {
  const context = useContext(WepinContext);
  if (!context) {
    throw new Error("useWepin must be used within a WepinProvider");
  }
  return context;
};

// Wepin SDK instance - loaded dynamically for CSR
let wepinSdk: any = null;

export const WepinProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<WepinUser | null>(null);
  const [accounts, setAccounts] = useState<WepinAccount[]>([]);
  const [balance, setBalance] = useState<string | null>(null);

  // Initialize Wepin SDK
  useEffect(() => {
    const initWepin = async () => {
      try {
        const appId = import.meta.env.VITE_WEPIN_APP_ID;
        const appKey = import.meta.env.VITE_WEPIN_APP_KEY;

        if (!appId || !appKey) {
          console.log("Wepin credentials not configured - wallet features disabled");
          return;
        }

        // Dynamic import for CSR compatibility
        const { WepinSDK } = await import("@wepin/sdk-js");
        
        wepinSdk = new WepinSDK({
          appId,
          appKey,
        });

        await wepinSdk.init({
          defaultLanguage: "en",
          defaultCurrency: "USD",
          loginProviders: ["google", "apple", "discord"],
        });

        setIsInitialized(true);

        // Check if user is already logged in
        const status = await wepinSdk.getStatus();
        if (status === "login") {
          const userInfo = await wepinSdk.loginWithUI();
          if (userInfo.status === "success") {
            setUser(userInfo);
            setIsConnected(true);
            await fetchAccounts();
          }
        }
      } catch (error) {
        console.error("Failed to initialize Wepin:", error);
      }
    };

    initWepin();

    return () => {
      if (wepinSdk) {
        wepinSdk.finalize?.();
      }
    };
  }, []);

  const fetchAccounts = useCallback(async () => {
    if (!wepinSdk) return [];
    
    try {
      const accountList = await wepinSdk.getAccounts();
      setAccounts(accountList || []);
      return accountList || [];
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      return [];
    }
  }, []);

  const connect = useCallback(async () => {
    if (!wepinSdk) {
      toast({
        title: "Wallet Not Available",
        description: "Wepin wallet is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userInfo = await wepinSdk.loginWithUI();
      
      if (userInfo.status === "success") {
        setUser(userInfo);
        setIsConnected(true);
        await fetchAccounts();
        
        toast({
          title: "Wallet Connected",
          description: `Connected as ${userInfo.userInfo?.email}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  }, [fetchAccounts]);

  const disconnect = useCallback(async () => {
    if (!wepinSdk) return;

    try {
      await wepinSdk.logout();
      setUser(null);
      setIsConnected(false);
      setAccounts([]);
      setBalance(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, []);

  const openWallet = useCallback(async () => {
    if (!wepinSdk || !isConnected) {
      toast({
        title: "Connect Wallet First",
        description: "Please connect your wallet to view it.",
      });
      return;
    }

    try {
      await wepinSdk.openWidget();
    } catch (error) {
      console.error("Failed to open wallet widget:", error);
    }
  }, [isConnected]);

  const getAccounts = useCallback(async () => {
    return fetchAccounts();
  }, [fetchAccounts]);

  return (
    <WepinContext.Provider
      value={{
        isInitialized,
        isConnected,
        user,
        accounts,
        balance,
        connect,
        disconnect,
        openWallet,
        getAccounts,
      }}
    >
      {children}
    </WepinContext.Provider>
  );
};
