import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useSnackbar, SnackbarSeverity } from '../parts/SnackbarProvider';

const signInPage = () => {
  const { signIn, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { showSnackbar } = useSnackbar();

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

  // URL直接遷移などに対応：ログアウトしてクリーンな状態に
  useEffect(() => {
    signOut();
  }, [signOut]);

  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading || isLoggingIn ? (
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