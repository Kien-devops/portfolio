'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-8 mt-auto backdrop-blur-sm bg-black/10 z-10 relative">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-muted">
        <div>
          © {new Date().getFullYear()} Kien Devops. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Kien-devops"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/kien-vpc-peering/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
          <Link href="/pipeline" className="hover:text-foreground transition-colors">
            Pipeline Visualizer
          </Link>
        </div>
      </div>
    </footer>
  );
}
