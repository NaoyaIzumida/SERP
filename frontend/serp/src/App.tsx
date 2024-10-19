import React from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UploadPage from "./components/pages/UploadPage";
import MergePage from "./components/pages/MergePage";
import { menuContext } from "./contexts/AppState";
import { MyAppBar } from "./components/MyAppBar";
import { MyDrawer } from "./components/MyDrawer";
import "./App.css";
import { Main } from "./components/Main";

const App: React.FC = () => {
  const [isOpened, setOpened] = React.useState(false);

  return (
    <BrowserRouter>
      <menuContext.Provider value={{ isOpened, setOpened }}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />

          {/* AppBar */}
          <MyAppBar />

          {/* Drawer */}
          <MyDrawer open={isOpened} />

          {/* Main */}
          <Main open={isOpened}>
            <Toolbar />
          </Main>

        </Box>
      </menuContext.Provider>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="UploadPage" element={<UploadPage />} />
        <Route path="MergePage" element={<MergePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;