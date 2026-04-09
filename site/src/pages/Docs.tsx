import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { marked } from "marked";
import {
  BookOpen, ChevronRight, Search, FileText, Layout, Bot,
  Zap, Workflow, Plug, Globe, BookMarked, Menu, X, ArrowLeft,
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "getting-started": <BookOpen className="w-4 h-4" />,
  guides: <FileText className="w-4 h-4" />,
  dashboard: <Layout className="w-4 h-4" />,
  agents: <Bot className="w-4 h-4" />,
  skills: <Zap className="w-4 h-4" />,
  routines: <Workflow className="w-4 h-4" />,
  integrations: <Plug className="w-4 h-4" />,
  "real-world": <Globe className="w-4 h-4" />,
  reference: <BookMarked className="w-4 h-4" />,
};

interface DocChild {
  title: string;
  slug: string;
  path: string;
}
interface DocSection {
  title: string;
  slug: string;
  children: DocChild[];
}
interface DocsIndex {
  sections: DocSection[];
}

// Configure marked — use default renderer, style via CSS
marked.setOptions({ breaks: false, gfm: true });

// Fix image paths for docs
const renderer = new marked.Renderer();
renderer.image = ({ href, text }: { href: string; text: string }) => {
  const src = href.replace(/^(\.\.\/)?imgs\//, '/docs/imgs/');
  return `<img src="${src}" alt="${text}" class="rounded-lg max-w-full my-4" />`;
};
marked.use({ renderer });

export default function Docs() {
  const [index, setIndex] = useState<DocsIndex | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract slug from URL path directly (more reliable than useRoute with wildcards)
  const currentSlug = location.startsWith("/docs/") ? location.slice(6) : null;

  // Load index
  useEffect(() => {
    fetch("/docs-index.json")
      .then((r) => r.json())
      .then((data) => setIndex(data))
      .catch(() => setIndex({ sections: [] }));
  }, []);

  // Load content when slug changes
  useEffect(() => {
    if (!index) return;
    let docPath: string | null = null;

    if (currentSlug) {
      for (const section of index.sections) {
        const child = section.children.find((c) => c.slug === currentSlug);
        if (child) {
          docPath = child.path;
          break;
        }
      }
    }

    if (!docPath && index.sections.length > 0 && index.sections[0].children.length > 0) {
      docPath = index.sections[0].children[0].path;
      if (!currentSlug) {
        setLocation(`/docs/${index.sections[0].children[0].slug}`, { replace: true });
      }
    }

    if (docPath) {
      setLoading(true);
      fetch(`/docs/${docPath}`)
        .then((r) => r.text())
        .then((text) => {
          setContent(text);
          setLoading(false);
          contentRef.current?.scrollTo(0, 0);
        })
        .catch(() => {
          setContent("# Not Found\n\nThis page could not be loaded.");
          setLoading(false);
        });
    }
  }, [index, currentSlug, setLocation]);

  const filteredSections =
    index?.sections
      .map((s) => ({
        ...s,
        children: s.children.filter((c) =>
          c.title.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((s) => s.children.length > 0) ?? [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0d1117] border-r border-[#21262d] flex flex-col z-40 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[#21262d]">
          <a href="/" className="flex items-center gap-2 text-[#00FFA7] font-semibold text-sm mb-4 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </a>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00FFA7]" /> Documentation
          </h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
            <input
              type="search"
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#00FFA7]"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredSections.map((section) => (
            <div key={section.slug}>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider px-2 mb-1">
                {SECTION_ICONS[section.slug] || <FileText className="w-4 h-4" />}
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.children.map((child) => (
                  <li key={child.slug}>
                    <a
                      href={`/docs/${child.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(`/docs/${child.slug}`);
                        setSidebarOpen(false);
                      }}
                      className={`block px-3 py-1.5 rounded text-sm transition-colors ${
                        currentSlug === child.slug
                          ? "bg-[#00FFA7]/10 text-[#00FFA7] font-medium"
                          : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                      }`}
                    >
                      {child.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#21262d] text-xs text-[#484f58]">
          <a
            href="/docs/llms-full.txt"
            className="flex items-center gap-1 hover:text-[#00FFA7] transition-colors"
          >
            <FileText className="w-3 h-3" /> llms-full.txt
          </a>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <main ref={contentRef} className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-[#484f58] text-sm">Loading...</div>
            </div>
          ) : (
            <article
              className="docs-content max-w-none"
              dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
