'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Replaced forbidden window.addEventListener('scroll') with Motion's useScroll
  const { scrollY } = useScroll();
  const navBg = useTransform(
    scrollY,
    [0, 60],
    [
      theme === 'dark' ? 'rgba(5,10,16,0)' : 'rgba(255,255,255,0)',
      theme === 'dark' ? 'rgba(5,10,16,0.85)' : 'rgba(255,255,255,0.7)'
    ]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    [
      theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      theme === 'dark' ? 'rgba(34,211,238,0.12)' : 'rgba(14,165,233,0.15)'
    ]
  );


  const navItems = [
    { name: 'About',      href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Skills',     href: '#skills' },
    { name: 'Projects',   href: '#projects' },
    { name: 'Blogs',      href: '#blogs' },
    { name: 'Study',      href: '/study' },
    { name: 'Vouchers',   href: '/exam-vouchers' },
    { name: 'Contact',    href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (pathname === '/') {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/' + href);
      }
    } else {
      e.preventDefault();
      setMobileMenuOpen(false);
      router.push(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-4">
      <motion.div
        className="max-w-5xl mx-auto"
        style={{
          background: navBg,
          borderColor: navBorder,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '9999px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <nav className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-base tracking-tight hover:opacity-85 transition-opacity">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span>Kien Devops</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-text-muted hover:text-foreground transition-colors relative group py-1"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/8 text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-accent" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/8 text-foreground transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-20 left-4 right-4 rounded-2xl border border-card-border p-5 flex flex-col gap-1 shadow-2xl z-40"
            style={{
              background: theme === 'dark' ? 'rgba(5,10,16,0.95)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}

          >
            {navItems.map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="text-base font-medium text-text-muted hover:text-foreground transition-colors py-2.5 border-b border-white/5 last:border-0 flex justify-between items-center"
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
