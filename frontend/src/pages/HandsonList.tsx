import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Clock, Search, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { api } from "../services/api.js";
import { HandsonMetadata } from "../types/index.js";


export default function HandsonList() {
  const [labs, setLabs] = useState<HandsonMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const data = await api.getHandsonList();
        setLabs(data || []);
      } catch (err: any) {
        console.error("Error fetching handson labs:", err);
        setError("Không thể tải danh sách bài lab Hands-on. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  // Categories list
  const categories = ["All", ...Array.from(new Set(labs.map((l) => l.category)))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filtered labs
  const filteredLabs = labs.filter((lab) => {
    const matchesCategory = selectedCategory === "All" || lab.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || lab.difficulty === selectedDifficulty;
    const matchesSearch =
      searchQuery.trim() === "" ||
      lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Advanced":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-mono bg-[#ffffff]">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
        <p className="text-[#666666] text-sm">loading hands-on lab guides...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff] min-h-screen pt-28 pb-20">
      <div className="handson-container space-y-8">
        {/* Header Banner */}
        <div className="handson-header space-y-3 border-b border-[#e5e5e5] pb-8">
          <div className="flex items-center space-x-2 font-mono text-xs text-[#2563eb] font-semibold tracking-wider uppercase">
            <Terminal className="w-4 h-4" />
            <span>Interactive Hands-on Labs</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] font-sans">
            Hands-on Guides & Practical Tutorials
          </h1>

          <p className="text-[#666666] text-sm leading-relaxed font-sans">
            Tổng hợp các bài lab hướng dẫn chi tiết từng bước thực hành Cloud, AWS, DevOps, Docker và Infrastructure as Code. Làm theo các hướng dẫn Markdown trực tiếp trên trình duyệt của bạn.
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="space-y-4 bg-[#fafafa] p-6 border border-[#e5e5e5] rounded-lg mt-8">
          {/* Search Bar & Filters in Toolbar */}
          <div className="toolbar">
            <div className="search relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
              <input
                type="text"
                placeholder="Tìm kiếm bài lab theo tiêu đề, công nghệ, từ khóa (AWS, Docker, S3...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-[#e5e5e5] rounded text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#2563eb] font-sans min-w-0"
              />
            </div>
          </div>

          {/* Filter Badges: Category & Difficulty */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs pt-2 border-t border-[#eee]">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="font-mono text-[#666666] shrink-0">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded transition-all font-mono text-xs ${
                    selectedCategory === cat
                      ? "bg-[#2563eb] text-white font-semibold"
                      : "bg-[#ffffff] text-[#666666] border border-[#e5e5e5] hover:text-[#111111]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="font-mono text-[#666666] shrink-0">Difficulty:</span>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded transition-all font-mono text-xs ${
                    selectedDifficulty === diff
                      ? "bg-[#111111] text-white font-semibold"
                      : "bg-[#ffffff] text-[#666666] border border-[#e5e5e5] hover:text-[#111111]"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        {error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded font-mono text-center mt-8">
            {error}
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#e5e5e5] rounded-lg space-y-3 mt-8">
            <BookOpen className="w-8 h-8 text-[#999999] mx-auto" />
            <p className="text-[#666666] text-sm font-sans">
              Không tìm thấy bài lab nào phù hợp với bộ lọc hiện tại.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDifficulty("All");
              }}
              className="font-mono text-xs text-[#2563eb] underline hover:text-[#111111]"
            >
              Reset bộ lọc
            </button>
          </div>
        ) : (
          <div className="lab-grid mt-8">
            {filteredLabs.map((lab) => (
              <div
                key={lab.slug}
                className="lab-card group border border-[#e5e5e5] bg-[#ffffff] rounded-lg flex flex-col justify-between hover:border-[#2563eb]/50 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3 min-w-0">
                  {/* Top Metadata Badges */}
                  <div className="flex items-center justify-between font-mono text-xs min-w-0">
                    <span
                      className={`px-2.5 py-0.5 rounded border font-semibold shrink-0 ${getDifficultyBadge(
                        lab.difficulty
                      )}`}
                    >
                      {lab.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-[#666666] shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span>{lab.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-2.5 min-w-0 pt-1">
                    <h2 className="lab-title text-lg font-bold text-[#111111] group-hover:text-[#2563eb] transition-colors leading-snug font-sans">
                      {lab.title}
                    </h2>
                    <p className="lab-description text-xs leading-relaxed font-sans">
                      {lab.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Tags & Action */}
                <div className="pt-5 mt-5 border-t border-[#f0f0f0] space-y-4 min-w-0">
                  <div className="lab-tags font-mono text-[11px] text-[#666666]">
                    {lab.tags.map((tag) => (
                      <span
                        key={tag}
                        className="lab-tag bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/handson/${lab.slug}`}
                    className="w-full inline-flex items-center justify-center space-x-2 py-2 px-4 bg-[#111111] text-white hover:bg-[#2563eb] rounded font-mono text-xs font-semibold transition-colors group-hover:shadow-sm"
                  >
                    <span>Làm Theo Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
