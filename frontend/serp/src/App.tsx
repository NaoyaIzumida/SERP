import { BrowserRouter, Route, Routes } from "react-router-dom";
import UploadPage from "./components/pages/UploadPage";
import MergePage from "./components/pages/MergePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="UploadPage" element={<UploadPage />} />
        <Route path="MergePage" element={<MergePage />} />
      </Routes>
    </BrowserRouter>
  );
}