import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useSnackbar, SnackbarSeverity } from '../parts/SnackbarProvider';
import { msalInstance } from '../../msalInstance';

const signInPage = () => {
  const { signIn, setIsAuthenticated, setUser} = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // 手動でログインページに来た場合にセッション破棄
    const logoutIfLoggedIn = async () => {
      // アカウント情報を取得し、アカウントが存在する場合は破棄する
      await msalInstance.initialize();
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup();
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    logoutIfLoggedIn();
  }, []);

  const handlesignIn = async () => {
    setIsLoggingIn(true);
    try {
      await signIn();
      navigate('/UploadPage');
    } catch (err) {
      showSnackbar('サインインに失敗しました。', SnackbarSeverity.ERROR);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoggingIn ? (
        <CircularProgress />
      ) : (
        <Button
          variant="contained"
          onClick={handlesignIn}
          sx={{
            textTransform: 'none',
            fontSize: '1.50rem'
          }}
        >
          Microsoftでサインイン
        </Button>
      )}
    </Box>
  );
};

export default signInPage;