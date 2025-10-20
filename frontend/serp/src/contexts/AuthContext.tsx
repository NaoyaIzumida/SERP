import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthenticationResult
} from "@azure/msal-browser";
import { msalInstance } from "../msalInstance";
import { signInRequest } from "../components/config/MsalConfig";
import { useNavigate } from "react-router-dom";

type User = { message: string, azure_ad_id: string; email: string; display_name: string } | null;

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

  const disposeAuth = () => {
    setUser(null);
    setIsAuthenticated(false)
    navigate('/');
  }

  useEffect(() => {
    const initializeUser = async () => {
      try {
        await msalInstance.initialize();

        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          msalInstance.setActiveAccount(account);

          try {
            // APIスコープのアクセストークン取得を試みる
            const tokenRequest = {
              scopes: ["api://b96bf6d0-b9b0-4888-a294-83018fd7786d/access_as_user"],
              account,
            };

            let response;
            try {
              response = await msalInstance.acquireTokenSilent(tokenRequest);
            } catch {
              // silent取得できなければpopupで取得
              response = await msalInstance.acquireTokenPopup(tokenRequest);
            }

            const accessToken = response.accessToken;

            // バックエンドにaccess_token送信して検証
            const backendResponse = await fetch("http://localhost:5000/auth/callback", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
            });

            const data = await backendResponse.json();
            if (backendResponse.ok && data.status === "ok") {
              setUser({
                message: data.message,
                azure_ad_id: data.azure_ad_id,
                email: data.email,
                display_name: data.display_name,
              });
              setIsAuthenticated(true);
            } else {
              console.error("Backend auth failed", data.error || data);
              disposeAuth();
            }
          } catch (error) {
            console.error("Token acquisition or backend call failed", error);
            disposeAuth();
          }
        }
      } catch (e) {
        console.error("MSAL initialization failed", e);
        disposeAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);


  const signIn = async () => {
    setIsLoading(true);

    try {
      // msal インスタンス初期化
      await msalInstance.initialize();

      // 認証ページをポップアップで表示
      const result: AuthenticationResult = await msalInstance.loginPopup(signInRequest);

      console.log("ログイン成功:", result.account);

      // APIトークンのスコープを設定
      const apiTokenRequest = {
        scopes: ["api://b96bf6d0-b9b0-4888-a294-83018fd7786d/access_as_user"],
        account: result.account
      };

      // api_token取得
      const apiTokenResult = await msalInstance.acquireTokenSilent(apiTokenRequest).catch(async () => {
        // silent失敗時はpopupで取得
        return await msalInstance.acquireTokenPopup(apiTokenRequest);
      });

      // console.log("Access Token:", tokenResult.accessToken);

      // バックエンドにアクセストークンを送信して検証
      const response = await fetch("http://localhost:5000/auth/callback", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiTokenResult.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.status === "ok") {
        // 認証成功
        setUser({
          message: data.message,
          azure_ad_id: data.azure_ad_id,
          email: data.email,
          display_name: data.display_name,
        });
        setIsAuthenticated(true);
      } else {
        console.error("Backend auth failed", data.error || data);
        setUser(null);
      }

    } catch (error) {
      console.error("signIn failed", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // msalインスタンス準備
      await msalInstance.initialize();

      // サインアウト後ユーザー情報、認証状態を破棄
      await msalInstance.logoutPopup();
      disposeAuth();
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
