import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthenticationResult,
} from "@azure/msal-browser";
import { msalInstance } from "../msalInstance";
import { signInRequest } from "../components/config/MsalConfig";
import { useNavigate } from "react-router-dom";

type User = { azure_ad_id: string; email: string; name: string } | null;

type AuthContextType = {
  user: User;
  setUser: (val: User) => void;
  signIn: () => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // msalインスタンス準備
        await msalInstance.initialize();

        // アカウント情報がある場合はアクティブユーザーにセット
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          msalInstance.setActiveAccount(account);

          // アカウントの再検証
          try {
            const response: AuthenticationResult = await msalInstance.acquireTokenSilent({
              ...signInRequest,
              account,
            });

            const idToken = response.idToken;
            const backendResponse = await fetch("http://localhost:5000/auth/callback", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id_token: idToken }),
            });

            const data = await backendResponse.json();
            if (backendResponse.ok && data.status === "ok") {
              // 検証OKの場合、ユーザー情報と認証情報をセット
              setUser({
                azure_ad_id: data.azure_ad_id,
                email: data.email,
                name: data.name,
              });
              setIsAuthenticated(true);
            } else {
              console.error("Backend auth failed", data.error || data);
              setUser(null);
            }
          } catch (error) {
            console.error("Token acquisition or backend call failed", error);
            setUser(null);
          }
        }
      } catch (e) {
        console.error("MSAL initialization failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const signIn = async () => {
    try {
      // msalインスタンス準備
      await msalInstance.initialize();

      // 認証ページをポップアップ
      const result: AuthenticationResult = await msalInstance.loginPopup(signInRequest);

      // id_tokenが取得できた場合、バックエンドでtokenの検証を行う
      if (result.idToken) {
        const response = await fetch("http://localhost:5000/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: result.idToken }),
        });

        const data = await response.json();
        if (response.ok && data.status === "ok") {
          // 検証結果がOKの場合、ユーザー情報と認証状態をセット
          setUser({
            azure_ad_id: data.azure_ad_id,
            email: data.email,
            name: data.name,
          });
          setIsAuthenticated(true);
        } else {
          console.error("Backend auth failed", data.error || data);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("signIn failed", error);
      setUser(null);
    }
    finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // msalインスタンス準備
      await msalInstance.initialize();

      // サインアウト後ユーザー情報、認証状態を破棄
      await msalInstance.logoutPopup();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('[AuthContext] Sign out failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signIn, signOut, isAuthenticated, setIsAuthenticated, isLoading }}>
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
