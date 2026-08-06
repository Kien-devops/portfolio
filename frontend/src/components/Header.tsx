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
          ? "py-3"
          : "py-5"
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center transition-all duration-300 ${
        isScrolled ? "liquid-nav rounded-full py-2" : "py-0"
      }`}>
        {/* Logo */}
        <Link
          to="/"
          onClick={() => handleNavClick("home")}
          className="text-2xl font-bold font-display tracking-tight bg-gradient-to-r from-sky-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          K.DevOps
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {link.name}
            </button>
          ))}
          
          <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
            <ThemeToggle />
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="liquid-link-button flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-all"
                id="admin-dashboard-link"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 transition-colors"
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
            className="liquid-link-button p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Toggle Menu"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 liquid-card px-6 py-8 flex flex-col space-y-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-lg font-medium text-left text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="border-t border-white/10 pt-6 flex flex-col space-y-4">
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="liquid-button flex items-center justify-center space-x-2 px-4 py-2.5 text-white font-semibold text-sm transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsOpen(false)}
                className="liquid-button-secondary text-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors py-2"
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
