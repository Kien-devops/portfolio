import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout, getAdminEmail } from "../services/auth.js";
import { LogOut, LayoutDashboard, ExternalLink, Shield } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const email = getAdminEmail();

  if (!authenticated) {
    console.warn("Unauthorized access attempt. Redirecting to admin login.");
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-indigo-400" />
            <Link to="/admin/dashboard" className="text-lg font-bold tracking-tight font-display text-slate-100 flex items-center space-x-2">
              <span>Admin Console</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-normal">v1.0</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <span className="hidden sm:inline text-xs text-slate-400">
              Signed in as: <strong className="text-indigo-300 font-medium">{email}</strong>
            </span>
            
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
              <ThemeToggle />
              <Link
                to="/"
                target="_blank"
                className="p-2 rounded-full border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
                title="View Website"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                title="Sign Out"
                id="admin-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 mb-6">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight font-display">Dashboard Management</h1>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
}
