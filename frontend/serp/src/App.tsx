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
import { Main } from "./components/Main";
import { SnackbarProvider } from "./components/parts/SnackbarProvider";
import Footer from "./components/parts/Footer";
import "./App.css";

const App: React.FC = () => {
  const [isOpened, setIsOpened] = React.useState(false);

  return (
    <BrowserRouter>
      <SnackbarProvider>
        <menuContext.Provider value={{ isOpened, setOpened: setIsOpened }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            
            {/* AppBar */}
            <MyAppBar />

            {/* コンテンツ全体 */}
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              {/* Drawer */}
              <MyDrawer open={isOpened} />

              {/* Main */}
              <Main open={isOpened}>
                <Toolbar />
                <Routes>
                  <Route path="/" element={<UploadPage />} />
                  <Route path="TopicInfoMstPage" element={<TopicInfoMstPage />} />
                  <Route path="UploadPage" element={<UploadPage />} />
                  <Route path="MergePage" element={<MergePage />} />
                </Routes>
              </Main>
            </Box>
            <Footer />
          </Box>
        </menuContext.Provider>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
