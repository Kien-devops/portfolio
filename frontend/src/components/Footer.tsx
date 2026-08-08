export default function Footer() {
  return (
    <footer className="bg-[#ffffff] text-[#111111] border-t border-[#e5e5e5] py-12 text-xs font-mono">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="font-bold text-sm text-[#111111]">NGUYỄN TRUNG KIÊN</div>
          <div className="text-[#666666]">DevOps & Cloud Engineer</div>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/Kien-devops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#111111] hover:text-[#2563eb] transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href="https://linkedin.com/in/trungkien-devops"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#111111] hover:text-[#2563eb] transition-colors"
          >
            LinkedIn ↗
          </a>
          <a
            href="mailto:kien07493@gmail.com"
            className="text-[#111111] hover:text-[#2563eb] transition-colors"
          >
            Email ↗
          </a>
        </div>

        <div className="text-[#8a8a8a]">
          <span>© 2026 Kien Nguyen</span>
        </div>
      </div>
    </footer>
  );
}
