import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

//#region AppProvider
export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SystemProvider>
      <SnackbarProvider>
        {children}
      </SnackbarProvider>
    </SystemProvider>
  );
};
//#endregion AppProvider

//#region Snackbar Context
type Severity = 'success' | 'info' | 'warning' | 'error';

interface SnackbarMessage {
  key: number;
  message: string;
  severity: Severity;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: Severity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = (message: string, severity: Severity = 'info') => {
    setSnackbars((prev) => [
      ...prev,
      { key: Date.now() + Math.random(), message, severity }
    ]);
  };

  const handleClose = (key: number) => {
    setSnackbars((prev) => prev.filter((s) => s.key !== key));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbars.map((snack, index) => (
        <Snackbar
          key={snack.key}
          open
          autoHideDuration={5000} // 自動非表示までの時間ms
          onClose={() => handleClose(snack.key)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: `${index * 70}px` }} // 積み上げ間隔
        >
          <Alert onClose={() => handleClose(snack.key)} severity={snack.severity} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

export enum SnackbarSeverity {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
//#endregion Snackbar Context

//#region System Context
type SystemContextType = {
  title: string;
  setTitle: (title: string) => void;
  system: eSystemType;
  setSystem: (val: eSystemType) => void;
};

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider = ({ children }: { children: ReactNode }) => {
  // localStorageからstateを読み込む（JSON形式で保存してる想定）
  const [title, setTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("systemState");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.title || "";
      }
      return "";
    } catch {
      return "";
    }
  });

  const [system, setSystem] = useState<eSystemType>(() => {
    try {
      const saved = localStorage.getItem("systemState");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.system && Object.values(eSystemType).includes(parsed.system)) {
          return parsed.system as eSystemType;
        }
      }
      return eSystemType.NONE;
    } catch {
      return eSystemType.NONE;
    }
  });

  // systemやtitleが変わったらlocalStorageに保存する
  React.useEffect(() => {
    const stateToSave = { title, system };
    localStorage.setItem("systemState", JSON.stringify(stateToSave));
  }, [title, system]);

  return (
    <SystemContext.Provider value={{ title, setTitle, system, setSystem }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystem must be used within a SystemProvider");
  }
  return context;
};

// システム区分消そうと思ったけどサイドメニューの表示・非表示制御に使えるのとめちゃくちゃ将来を見越して残しておきたい。主な理由は前者。
export enum eSystemType {
  NONE = '0',
  GETSUJI = '1',
}
//#endregion system context