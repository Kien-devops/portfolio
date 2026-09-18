import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle.js";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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

  const navLinks: { name: string; id: string; isRoute?: boolean; route?: string }[] = [
    { name: "About", id: "about" },
    { name: "Work", id: "projects" },
    { name: "Certifications", id: "experience" },
    { name: "Stack", id: "stack" },
    { name: "Blogs", id: "blog" },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 border-b border-[#e5e5e5] bg-[#ffffff]/92 backdrop-blur-md h-[68px] flex items-center ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto w-full px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => handleNavClick("home")}
          className="font-mono text-base font-bold tracking-wider text-[#111111] hover:text-[#2563eb] transition-colors"
        >
          KIEN.DEV
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7 font-sans text-sm">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.id}
                to={link.route || "/"}
                className="text-[#666666] hover:text-[#111111] font-semibold transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            )
          )}

          <a
            href="https://github.com/Kien-devops"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#111111] hover:text-[#2563eb] transition-colors"
          >
            GitHub ↗
          </a>

          <div className="flex items-center space-x-3 border-l border-[#e5e5e5] pl-5">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#666666] hover:text-[#111111]"
            aria-label="Toggle Menu"
            id="mobile-menu-btn"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-[68px] left-0 right-0 bg-[#ffffff] border-b border-[#e5e5e5] px-6 py-6 flex flex-col space-y-4 font-sans text-sm shadow-md">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.id}
                to={link.route || "/"}
                onClick={() => setIsOpen(false)}
                className="text-[#2563eb] font-semibold text-left transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-[#666666] hover:text-[#111111] text-left transition-colors"
              >
                {link.name}
              </button>
            )
          )}

          <a
            href="https://github.com/Kien-devops"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#2563eb] text-left"
          >
            GitHub ↗
          </a>
        </div>
      )}
    </header>
  );
}
