import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  AuthenticationResult,
} from "@azure/msal-browser";
import { msalInstance } from "../msalInstance";
import { signInRequest } from "../components/config/MsalConfig";

type User = { azure_ad_id: string; email: string; name: string } | null;

type AuthContextType = {
  user: User;
  signIn: () => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const idToken = localStorage.getItem("id_token");
        if (idToken) {
          try {
            const res = await fetch("http://localhost:5000/auth/callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: idToken }),
            });
            const data = await res.json();
            if (data.status === "ok") {
              setUser({
                azure_ad_id: data.azure_ad_id,
                email: data.email,
                name: data.name,
              });
            } else {
              setUser(null);
              localStorage.removeItem("id_token");
            }
          } catch (e) {
            setUser(null);
            localStorage.removeItem("id_token");
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    restoreUser();
  }, []);
  
  const signIn = async () => {
    setIsLoading(true);
    try {
      const result: AuthenticationResult = await msalInstance.loginPopup(signInRequest);

      if (result.idToken) {
        // id_token認証
        const response = await fetch("http://localhost:5000/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: result.idToken }),
        });
        const data = await response.json();

        if (response.ok && data.status === "ok") {
          setUser({
            azure_ad_id: data.azure_ad_id,
            email: data.email,
            name: data.name,
          });
          localStorage.setItem("id_token", result.idToken);
        } else {
          console.error("Backend auth failed", data.error || data);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("signIn failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    msalInstance.logoutPopup();
    setUser(null);
    localStorage.removeItem("id_token");
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated, isLoading }}>
      {children}
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
