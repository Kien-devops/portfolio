import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 border-t border-white/10 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-6 relative z-10">
        <div className="flex space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-link-button p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-link-button p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="mailto:contact@example.com"
            className="liquid-link-button p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>

        <button
          onClick={scrollToTop}
          className="liquid-button-secondary group p-3 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </footer>
  );
}
