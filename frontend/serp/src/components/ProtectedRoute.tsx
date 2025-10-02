import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, isLoading } = useAuth();

  // localStorageからの復元が終わっていない場合
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // ユーザ情報がない場合
  if (!user) {
    return <Navigate to="/SignIn" replace />;
  }

  return children;
};

export default ProtectedRoute;