import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout.js";
import Home from "./pages/Home.js";
import BlogDetail from "./pages/BlogDetail.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Main Shell Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
        </Route>

        {/* 404 SPA fallback redirecting to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
