import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center relative z-10">
        {/* Brand */}
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <Link
            to="/"
            onClick={scrollToTop}
            className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent"
          >
            Antigravity.
          </Link>
          <p className="text-xs text-slate-500 mt-2">
            © {new Date().getFullYear()} Personal Portfolio. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-600 mt-1">
            Built using AWS Serverless Architecture
          </p>
        </div>

        {/* Social Links */}
        <div className="flex space-x-6 mb-6 md:mb-0">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full border border-slate-800/80 bg-slate-900/20 text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition-all"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full border border-slate-800/80 bg-slate-900/20 text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition-all"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="mailto:contact@example.com"
            className="p-2.5 rounded-full border border-slate-800/80 bg-slate-900/20 text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition-all"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="group p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-all focus:outline-none"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </footer>
  );
}
