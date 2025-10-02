import React from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UploadPage from "./components/pages/UploadPage";
import MergePage from "./components/pages/MergePage";
import TopicInfoMstPage from "./components/pages/TopicInfoMstPage";
import { menuContext } from "./contexts/AppState";
import { MyAppBar } from "./components/MyAppBar";
import { MyDrawer } from "./components/MyDrawer";
import "./App.css";
import { Main } from "./components/Main";
import { SnackbarProvider } from "./components/parts/SnackbarProvider";
import SignInPage from "./components/pages/SignInPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalInstance";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpened, setIsOpened] = React.useState(false);

  return (
    <>
      <menuContext.Provider value={{ isOpened, setOpened: setIsOpened }}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <MyAppBar isAuthenticated={isAuthenticated} />
          {isAuthenticated && <MyDrawer open={isOpened} />}
          <Main open={isAuthenticated && isOpened}>
            <Toolbar />
          </Main>
        </Box>
      </menuContext.Provider>

      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/SignIn" element={<SignInPage />} />
        <Route path="/TopicInfoMstPage" element={<ProtectedRoute><TopicInfoMstPage /></ProtectedRoute>} />
        <Route path="/UploadPage" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/MergePage" element={<ProtectedRoute><MergePage /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <AuthProvider>
          <SnackbarProvider>
            <AppContent />
          </SnackbarProvider>
        </AuthProvider>
      </BrowserRouter>
    </MsalProvider>
  );
};

export default App;
