import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShieldAlert } from "lucide-react";
import ThemeToggle from "./ThemeToggle.js";
import { isAuthenticated } from "../services/auth.js";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = isAuthenticated();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "About", id: "about" },
    { name: "Skills", id: "skills" },
    { name: "Experience", id: "experience" },
    { name: "Education", id: "education" },
    { name: "Projects", id: "projects" },
    { name: "Blog", id: "blog" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50 py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => handleNavClick("home")}
          className="text-2xl font-bold font-display tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          Antigravity.
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-sm font-medium text-slate-400 hover:text-indigo-400 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
            >
              {link.name}
            </button>
          ))}
          
          <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
            <ThemeToggle />
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                id="admin-dashboard-link"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                id="admin-login-link"
              >
                Admin
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Actions */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-400 hover:text-slate-100"
            aria-label="Toggle Menu"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-lg border-b border-slate-900 shadow-xl px-6 py-8 flex flex-col space-y-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-lg font-medium text-left text-slate-300 hover:text-indigo-400 transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="border-t border-slate-900 pt-6 flex flex-col space-y-4">
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="text-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors py-2 border border-slate-800 rounded-lg hover:border-slate-700"
              >
                Sign In As Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
