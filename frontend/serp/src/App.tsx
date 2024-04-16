import { BrowserRouter, Route, Routes } from "react-router-dom";
import UploadPage from "./components/pages/UploadPage";
import ComparePage from "./components/pages/ComparePage";
import MergePage from "./components/pages/MergePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="UploadPage" element={<UploadPage />} />
        <Route path="ComparePage" element={<ComparePage />} />
        <Route path="MergePage" element={<MergePage />} />
      </Routes>
    </BrowserRouter>
  );
}