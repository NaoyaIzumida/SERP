import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

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

// 列挙体：メッセージ重要度
export enum SnackbarSeverity {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
  }