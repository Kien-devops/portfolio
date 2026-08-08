import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout.js";
import AdminLayout from "./layouts/AdminLayout.js";
import Home from "./pages/Home.js";
import BlogDetail from "./pages/BlogDetail.js";
import HandsonList from "./pages/HandsonList.js";
import HandsonDetail from "./pages/HandsonDetail.js";
import AdminLogin from "./pages/AdminLogin.js";
import AdminDashboard from "./pages/AdminDashboard.js";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Main Shell Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="handson" element={<HandsonList />} />
          <Route path="handson/:slug" element={<HandsonDetail />} />
        </Route>


        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes with Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* 404 SPA fallback redirecting to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
