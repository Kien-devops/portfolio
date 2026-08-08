import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import mermaid from "mermaid";
import confetti from "canvas-confetti";
import { api } from "../services/api.js";
import { HandsonMetadata } from "../types/index.js";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function HandsonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [metadata, setMetadata] = useState<HandsonMetadata | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // List of all labs for Next/Prev lab navigation
  const [allLabs, setAllLabs] = useState<HandsonMetadata[]>([]);

  // Completed steps tracking (saved in localStorage)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Active section tracking via ScrollSpy
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Mobile Bottom Sheet Drawer State
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    });
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const [{ metadata: meta, content }, listRes] = await Promise.all([
          api.getHandsonDetail(slug),
          api.getHandsonList().catch(() => []),
        ]);

        setMetadata(meta);
        setMarkdownContent(content);
        setAllLabs(listRes);

        // Load step progress from localStorage
        const savedProgress = localStorage.getItem(`handson_progress_${slug}`);
        if (savedProgress) {
          try {
            setCompletedSteps(JSON.parse(savedProgress));
          } catch (e) {
            console.error("Failed to parse saved progress", e);
          }
        }
      } catch (err: any) {
        console.error("Error fetching handson detail:", err);
        setError("Bài lab bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ xuống.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Find next lab for bottom footer
  const currentLabIdx = useMemo(() => {
    return allLabs.findIndex((l) => l.slug === slug);
  }, [allLabs, slug]);

  const nextLab = useMemo(() => {
    if (currentLabIdx !== -1 && currentLabIdx < allLabs.length - 1) {
      return allLabs[currentLabIdx + 1];
    }
    return null;
  }, [allLabs, currentLabIdx]);

  // Parse Table of Contents and add IDs to Headings in Markdown
  const { htmlContent, toc, stepsList } = useMemo(() => {
    if (!markdownContent) return { htmlContent: "", toc: [], stepsList: [] };

    const tocItems: TocItem[] = [];
    const steps: { id: string; title: string }[] = [];

    const renderer = new marked.Renderer();
    let headingIndex = 0;

    renderer.heading = (arg1: any, arg2?: any) => {
      let text = "";
      let level = 2;

      if (typeof arg1 === "object" && arg1 !== null) {
        text = arg1.text || "";
        level = arg1.depth || 2;
      } else {
        text = String(arg1 || "");
        level = Number(arg2) || 2;
      }

      headingIndex++;
      const id = `step-heading-${headingIndex}`;
      const cleanText = text.replace(/<[^>]*>/g, "");

      tocItems.push({ id, text: cleanText, level });

      if (level === 2) {
        steps.push({ id, title: cleanText });
      }

      let headingStyle = "group relative scroll-mt-24 font-bold tracking-tight text-[#0f172a]";
      if (level === 1) {
        headingStyle += " text-2xl sm:text-3xl font-extrabold border-b border-[#e2e8f0] pb-4 mb-6 mt-4 flex items-center justify-between";
      } else if (level === 2) {
        headingStyle += " text-xl sm:text-2xl font-bold text-[#0f172a] mt-16 mb-6 pb-3 border-b border-[#e2e8f0] flex items-center justify-between";
      } else if (level === 3) {
        headingStyle += " text-base font-bold text-[#1e293b] mt-8 mb-3 border-b border-[#f1f5f9] pb-1.5 flex items-center justify-between";
      } else {
        headingStyle += " text-sm font-semibold mt-4 mb-2";
      }

      return `<h${level} id="${id}" class="${headingStyle}">
        <span>${text}</span>
        <a href="#${id}" class="ml-2 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity text-sm font-mono font-normal">#</a>
      </h${level}>`;
    };

    renderer.blockquote = (quote: any) => {
      const text = typeof quote === "object" ? quote.text || quote.tokens || "" : String(quote || "");
      const isImportant = text.includes("IMPORTANT") || text.includes("Chú ý") || text.includes("Lưu ý");
      const isExpected = text.includes("EXPECTED RESULT") || text.includes("Kết quả") || text.includes("Kiểm chứng");

      if (isImportant) {
        return `<div class="my-6 p-4 rounded-lg bg-amber-500/10 border-l-4 border-amber-500 border border-amber-500/20 text-amber-900 text-sm font-sans leading-relaxed shadow-xs flex items-start gap-3">
          <span class="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-amber-500 text-white shrink-0 mt-0.5">IMPORTANT</span>
          <div>${text}</div>
        </div>`;
      }

      if (isExpected) {
        return `<div class="my-6 p-4 rounded-lg bg-emerald-500/10 border-l-4 border-emerald-500 border border-emerald-500/20 text-emerald-950 text-sm font-sans leading-relaxed shadow-xs flex items-start gap-3">
          <span class="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-emerald-600 text-white shrink-0 mt-0.5">EXPECTED RESULT</span>
          <div>${text}</div>
        </div>`;
      }

      return `<blockquote class="border-l-4 border-l-[#2563eb] bg-[#f0f9ff] p-4 my-6 rounded-r-lg border-y border-r border-[#e0f2fe] text-[#0369a1] font-sans text-sm sm:text-base leading-relaxed shadow-2xs">${text}</blockquote>`;
    };

    const rawHtml = marked.parse(markdownContent, {
      renderer,
      gfm: true,
      breaks: false,
    }) as string;

    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ["target"],
    });

    return { htmlContent: sanitizedHtml, toc: tocItems, stepsList: steps };
  }, [markdownContent]);

  // ScrollSpy with IntersectionObserver to highlight active sidebar outline item
  useEffect(() => {
    if (!htmlContent) return;

    const headings = document.querySelectorAll("h1[id], h2[id], h3[id]");
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [htmlContent]);

  // Smooth scroll to target section and update URL hash
  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    setMobileDrawerOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState({}, "", `#${id}`);
    }
  };

  // Toggle step completion
  const toggleStep = (stepId: string) => {
    if (!slug) return;
    const updated = { ...completedSteps, [stepId]: !completedSteps[stepId] };
    setCompletedSteps(updated);
    localStorage.setItem(`handson_progress_${slug}`, JSON.stringify(updated));
  };

  // Mark all steps as complete & fire confetti
  const markAllComplete = () => {
    if (!slug || stepsList.length === 0) return;
    const allDone: Record<string, boolean> = {};
    stepsList.forEach((s) => {
      allDone[s.id] = true;
    });
    setCompletedSteps(allDone);
    localStorage.setItem(`handson_progress_${slug}`, JSON.stringify(allDone));

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Progress percentage
  const completedCount = useMemo(() => {
    return stepsList.filter((s) => completedSteps[s.id]).length;
  }, [stepsList, completedSteps]);

  const progressPercent = useMemo(() => {
    if (stepsList.length === 0) return 0;
    return Math.round((completedCount / stepsList.length) * 100);
  }, [completedCount, stepsList]);

  // Attach Code Copy listeners and Mermaid Diagram renderers after HTML render
  useEffect(() => {
    if (!htmlContent) return;

    // 1. Attach Copy buttons to regular code blocks
    const codeBlocks = document.querySelectorAll("pre code:not(.language-mermaid)");
    codeBlocks.forEach((codeBlock) => {
      const parent = codeBlock.parentElement;
      if (!parent || parent.querySelector(".copy-code-btn")) return;

      parent.classList.add("relative", "group");

      const copyBtn = document.createElement("button");
      copyBtn.className =
        "copy-code-btn absolute top-3 right-3 p-1.5 rounded bg-[#222222] text-[#cccccc] hover:text-white border border-[#444444] text-xs font-mono opacity-0 group-hover:opacity-100 transition-all flex items-center space-x-1 cursor-pointer z-10";
      copyBtn.innerHTML = `<span>Copy</span>`;

      copyBtn.onclick = () => {
        const codeText = codeBlock.textContent || "";
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.innerHTML = `<span class="text-emerald-400 font-semibold">Copied!</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<span>Copy</span>`;
          }, 2000);
        });
      };

      parent.appendChild(copyBtn);
    });

    // 2. Render Mermaid diagrams into visual SVGs in overflowing containers
    const mermaidNodes = document.querySelectorAll("pre code.language-mermaid");
    mermaidNodes.forEach(async (node, index) => {
      const parent = node.parentElement;
      if (!parent || parent.getAttribute("data-mermaid-done")) return;
      parent.setAttribute("data-mermaid-done", "true");

      const graphDefinition = node.textContent || "";
      const uniqueId = `mermaid-svg-${Date.now()}-${index}`;

      try {
        const { svg } = await mermaid.render(uniqueId, graphDefinition);
        const container = document.createElement("div");
        container.className =
          "mermaid-svg-wrapper my-10 p-6 sm:p-8 bg-[#fafafa] border border-[#e5e5e5] rounded-xl overflow-x-auto flex justify-center items-center shadow-xs w-full max-w-[960px] -mx-0 lg:-mx-12";
        container.innerHTML = svg;
        parent.replaceWith(container);
      } catch (err) {
        console.error("Mermaid diagram render error:", err);
      }
    });
  }, [htmlContent]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-mono bg-[#ffffff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        <p className="text-[#666666] text-sm">Đang tải tài liệu thực hành AWS...</p>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-4 font-mono bg-[#ffffff]">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded">
          <p>{error || "Không tìm thấy bài lab"}</p>
        </div>
        <Link
          to="/handson"
          className="inline-flex items-center space-x-2 px-4 py-2 border border-[#e5e5e5] text-[#111111] hover:text-[#2563eb] text-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách Hands-on</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ffffff] min-h-screen text-[#0f172a] font-sans pt-24 pb-20">
      
      {/* ------------------ COMPACT HERO HEADER (250-350px) ------------------ */}
      <header className="bg-[#f8fafc] border-b border-[#e2e8f0] py-8 sm:py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="space-y-4 max-w-4xl">
            
            {/* Top Tag & Back link */}
            <div className="flex items-center space-x-3 text-xs font-mono">
              <Link
                to="/handson"
                className="inline-flex items-center space-x-1.5 text-[#64748b] hover:text-[#2563eb] transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Hands-on Labs</span>
              </Link>
              <span className="text-[#cbd5e1]">/</span>
              <span className="bg-[#2563eb] text-white px-2.5 py-0.5 rounded font-semibold tracking-wide uppercase">
                {metadata.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
              {metadata.title}
            </h1>

            {/* Summary */}
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-3xl">
              {metadata.summary}
            </p>

            {/* Meta Badges Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-[#475569]">
              <div className="inline-flex items-center space-x-1.5 bg-white border border-[#e2e8f0] px-3 py-1 rounded-md shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{metadata.estimatedTime || "~20 min"}</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-white border border-[#e2e8f0] px-3 py-1 rounded-md shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{metadata.difficulty || "Intermediate"}</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-white border border-[#e2e8f0] px-3 py-1 rounded-md shadow-2xs">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>AWS Free Tier (&lt;$0.10)</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 bg-white border border-[#e2e8f0] px-3 py-1 rounded-md shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>AWS Certified DVA-C02</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ------------------ MAIN SINGLE-PAGE GRID ------------------ */}
      <div className="py-10">
        <div className="lab-layout items-start">

          {/* ------------------ DESKTOP STICKY OUTLINE SIDEBAR (220px) ------------------ */}
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 space-y-6 min-w-0">
            
            {/* Progress Card */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3 shadow-2xs font-sans">
              <div className="flex items-center justify-between text-xs font-mono font-semibold">
                <span className="text-[#475569]">LAB PROGRESS</span>
                <span className="text-[#2563eb] font-bold">{progressPercent}%</span>
              </div>

              <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2563eb] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="text-[11px] font-mono text-[#64748b]">
                {completedCount} / {stepsList.length} bước đã làm
              </div>
            </div>

            {/* Sticky Outline Nav */}
            {toc.length > 0 && (
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-5 space-y-3 font-sans shadow-2xs">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Nội dung bài Lab
                </h2>
                
                <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                  {toc.map((item) => {
                    const isStep = stepsList.some((s) => s.id === item.id);
                    const isDone = completedSteps[item.id];
                    const isActive = activeSectionId === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left py-1.5 px-2 rounded-md text-xs transition-all flex items-center justify-between group ${
                          isActive
                            ? "bg-[#eff6ff] text-[#2563eb] font-bold border-l-2 border-[#2563eb]"
                            : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
                        } ${item.level === 3 ? "pl-5 text-[11px]" : ""}`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full bg-[#2563eb] ring-4 ring-[#dbeafe] shrink-0"></span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] shrink-0 group-hover:bg-[#94a3b8]"></span>
                          )}
                          <span className="truncate">{item.text}</span>
                        </div>

                        {isStep && (
                          <input
                            type="checkbox"
                            checked={!!isDone}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleStep(item.id);
                            }}
                            className="w-3.5 h-3.5 rounded text-[#2563eb] focus:ring-[#2563eb] cursor-pointer shrink-0 ml-1"
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </aside>

          {/* ------------------ MAIN CONTINUOUS CONTENT COLUMN (820px) ------------------ */}
          <main className="min-w-0 space-y-12">
            
            {/* Markdown Content Block */}
            <article
              className="lab-content prose max-w-none leading-relaxed text-[#0f172a] font-sans
                prose-headings:font-bold prose-headings:text-[#0f172a] prose-headings:tracking-tight
                prose-p:text-base prose-p:text-[#334155] prose-p:leading-relaxed prose-p:my-4
                prose-code:text-[#2563eb] prose-code:font-mono prose-code:text-xs prose-code:bg-[#eff6ff] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#dbeafe] prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#0f172a] prose-pre:text-[#f8fafc] prose-pre:p-5 prose-pre:rounded-xl prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:shadow-xs
                prose-ul:list-disc prose-ul:pl-6 prose-ul:text-base prose-ul:text-[#334155] prose-ul:my-5 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-base prose-ol:text-[#334155] prose-ol:my-5 prose-ol:space-y-2
                prose-li:mb-2 prose-li:leading-relaxed
                prose-hr:my-12 prose-hr:border-t prose-hr:border-[#e2e8f0]
                prose-img:rounded-xl prose-img:border prose-img:border-[#e2e8f0] prose-img:shadow-sm prose-img:my-6
                prose-a:text-[#2563eb] prose-a:font-semibold prose-a:underline hover:prose-a:text-[#1d4ed8]"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* ------------------ END OF LAB CHECKPOINT & CLEANUP SECTION ------------------ */}
            <div className="border-t border-[#e2e8f0] pt-12 space-y-8">
              
              {/* Lab Complete Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6 sm:p-8 space-y-4 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#0f172a]">Chúc mừng bạn đã hoàn thành bài Lab!</h3>
                  <p className="text-sm text-[#64748b]">
                    Đã kiểm chứng đầy đủ cấu hình và kiến thức bài thi AWS DVA-C02.
                  </p>
                </div>

                <button
                  onClick={markAllComplete}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Đánh dấu hoàn thành toàn bộ Lab</span>
                </button>
              </div>

              {/* Cleanup Section Card */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <span>🧹 Dọn Dẹp Tài Nguyên AWS (Resource Cleanup)</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  Để tránh phát sinh chi phí ngoài ý muốn trên tài khoản AWS Free Tier của bạn, hãy đảm bảo thực hiện các bước dọn dẹp sau sau khi làm xong:
                </p>
                <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1 font-sans">
                  <li>Xóa S3 Bucket và các tệp mẫu đã tạo trong bài.</li>
                  <li>Disable và Delete CloudFront Distribution (nếu có).</li>
                  <li>Xóa các hàm Lambda, DynamoDB tables hoặc IAM Roles đã tạo giả lập.</li>
                </ul>
              </div>

              {/* Footer Bottom Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e2e8f0]">
                <Link
                  to="/handson"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-[#e2e8f0] text-[#0f172a] hover:text-[#2563eb] hover:border-[#2563eb] text-xs font-semibold rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Danh sách Hands-on Labs</span>
                </Link>

                {nextLab && (
                  <Link
                    to={`/handson/${nextLab.slug}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                  >
                    <span>Bài lab tiếp theo: {nextLab.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>

          </main>

        </div>
      </div>

      {/* ------------------ MOBILE BOTTOM STICKY BAR & DRAWER (< lg) ------------------ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e2e8f0] p-3 sm:p-4 shadow-lg flex items-center justify-between">
        
        {/* Step Indicator */}
        <div className="space-y-0.5 max-w-[70%]">
          <div className="text-[11px] font-mono text-[#64748b]">
            Tiến độ: <span className="text-[#2563eb] font-bold">{progressPercent}%</span> ({completedCount}/{stepsList.length})
          </div>
          <div className="text-xs font-bold text-[#0f172a] truncate">
            {activeSectionId ? (toc.find((t) => t.id === activeSectionId)?.text || metadata.title) : metadata.title}
          </div>
        </div>

        {/* Hamburger Toggle Button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>Mục lục</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-xs flex items-end justify-center lg:hidden">
          <div className="bg-white border-t border-[#e2e8f0] rounded-t-2xl max-h-[80vh] w-full p-6 space-y-4 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
            
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0f172a]">
                Mục lục bài Lab
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-[#64748b] hover:text-[#0f172a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1 text-sm font-sans">
              {toc.map((item) => {
                const isDone = completedSteps[item.id];
                const isActive = activeSectionId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#eff6ff] text-[#2563eb] font-bold"
                        : "text-[#475569] hover:bg-[#f8fafc]"
                    } ${item.level === 3 ? "pl-6 text-[11px]" : ""}`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#cbd5e1] shrink-0"></span>
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

          </div>
        </div>
      )}

    </div>
  );
}
