import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Terminal, Bot, BrainCircuit, Calendar, LayoutDashboard,
  Workflow, Database, Activity, Code, Clock, Zap, Menu,
  Copy, Check, X, FileText, GitBranch, Cpu, MessageSquare, Shield, Layers
} from "lucide-react";
import {
  SiGooglecalendar, SiGmail, SiGithub, SiLinear, SiDiscord,
  SiTelegram, SiStripe, SiFathom, SiTodoist, SiYoutube,
  SiInstagram, SiCanva, SiNotion, SiObsidian,
  SiFigma, SiWhatsapp, SiIntercom, SiHubspot
} from "react-icons/si";

import MainLogo from "@assets/logo.webp";
import EvoNexusLogo from "@assets/EVO_NEXUS.webp";
import printOverview from "@assets/print-overview.webp";
import printAgents from "@assets/print-agents.webp";
import printIntegrations from "@assets/print-integrations.webp";
import printCosts from "@assets/print-costs.webp";
import printChat from "@assets/print-chat.webp";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "pt-BR", label: "PT" },
  { code: "es", label: "ES" },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (lightboxImg) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImg]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(`npx @evoapi/evo-nexus`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const GITHUB_URL = "https://github.com/EvolutionAPI/evo-nexus";
  const DOCS_URL = "/docs";
  const DISCORD_URL = "https://discord.gg/evolution-api";
  const EVOLUTION_URL = "https://evolutionfoundation.com.br";

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary relative overflow-hidden font-sans">
      {/* Background — minimal gradient, no noise/grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-primary/3 to-transparent"></div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImg(null)}
            data-testid="lightbox-overlay"
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              onClick={() => setLightboxImg(null)}
              data-testid="lightbox-close"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImg}
              alt="Screenshot"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner */}
      <div className="fixed top-0 w-full z-[60] bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-3 text-sm font-medium">
          <span>{t("banner.text")}</span>
          <a
            href={EVOLUTION_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 font-bold hover:opacity-80 transition-opacity"
          >
            {t("banner.cta")}
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-transparent border-transparent'}`} style={{ top: '36px' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={EvoNexusLogo} alt="EvoNexus" className="h-8" />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" data-testid="link-github">{t("nav.github")}</a>
            <a href={DOCS_URL} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" data-testid="link-docs">{t("nav.docs")}</a>
            <div className="flex items-center gap-1 border border-border rounded-lg px-1 py-0.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${i18n.language === lang.code ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid={`lang-${lang.code}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(0,255,167,0.3)]"
              onClick={() => scrollTo("quickstart")}
              data-testid="button-get-started-nav"
            >
              {t("nav.getStarted")}
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>{t("nav.github")}</a>
                <a href={DOCS_URL} className="text-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>{t("nav.docs")}</a>
                <div className="flex items-center gap-1 border border-border rounded-lg px-1 py-0.5 w-fit">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setMobileMenuOpen(false); }}
                      className={`text-xs font-medium px-2 py-1 rounded transition-colors ${i18n.language === lang.code ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold w-full"
                  onClick={() => scrollTo("quickstart")}
                >
                  {t("nav.getStarted")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 pb-24 flex flex-col gap-32 pt-40">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>{t("hero.badge", { version: __APP_VERSION__ })}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto leading-tight mb-6 font-heading">
              {t("hero.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Social proof numbers */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { value: "17,000+", label: t("hero.stats.community") },
                { value: "38", label: t("hero.stats.agents") },
                { value: "175+", label: t("hero.stats.skills") },
                { value: "24", label: t("hero.stats.integrations") },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm">
                  <span className="font-bold text-primary">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 h-14 shadow-[0_0_20px_rgba(0,255,167,0.4)]"
                onClick={() => scrollTo("quickstart")}
                data-testid="button-get-started-hero"
              >
                {t("hero.cta")}
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-border hover:bg-muted text-foreground font-medium text-lg px-8 h-14" data-testid="button-github-hero" asChild>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <SiGithub className="w-5 h-5 mr-2" />
                  {t("hero.viewGithub")}
                </a>
              </Button>
            </div>

            {/* Discord CTA */}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-16"
            >
              <SiDiscord className="w-4 h-4" />
              {t("hero.discord")}
            </a>
          </FadeIn>

          <FadeIn delay={0.2} className="w-full max-w-3xl mx-auto text-left">
            <div className="rounded-xl overflow-hidden bg-[#0a0f18] border border-border shadow-2xl relative">
              <div className="absolute top-0 inset-x-0 h-8 bg-muted flex items-center px-4 gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="mx-auto text-xs text-muted-foreground font-mono">bash</div>
              </div>
              <div className="p-6 pt-12 font-mono text-sm leading-relaxed text-gray-300">
                <div className="flex gap-2"><span className="text-primary">$</span> <span>npx @evoapi/evo-nexus</span></div>
                <div className="text-emerald-400 mt-2">&#10003; Claude Code CLI detected</div>
                <div className="text-emerald-400">&#10003; Dependencies installed</div>
                <div className="text-emerald-400">&#10003; Dashboard built</div>
                <div className="text-blue-400 mt-2 font-bold">&#8594; Open http://localhost:8080</div>
                <div className="w-2 h-4 bg-primary animate-pulse mt-2"></div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Screenshots Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("screenshots.sectionTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("screenshots.sectionSubtitle")}</p>
              <p className="text-muted-foreground text-sm mt-2">{t("screenshots.sectionNote")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: t("screenshots.overview"), img: printOverview },
                { title: t("screenshots.multiAgents"), img: printAgents },
                { title: t("screenshots.integrationsTitle"), img: printIntegrations },
                { title: t("screenshots.costTracking"), img: printCosts },
                { title: t("screenshots.chatUI"), img: printChat },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-lg transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,255,167,0.1)] cursor-pointer"
                  onClick={() => setLightboxImg(item.img)}
                  data-testid={`screenshot-${i}`}
                >
                  <div className="overflow-hidden bg-muted/50 p-3">
                    <img src={item.img} alt={item.title} className="w-full h-auto rounded-lg border border-border/50 shadow-sm group-hover:scale-[1.02] transition-transform duration-300" />
                  </div>
                  <div className="p-4 bg-card border-t border-border flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{t("screenshots.clickToExpand")}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("features.sectionTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("features.sectionSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { icon: Bot, title: t("features.agents.title"), desc: t("features.agents.desc") },
                { icon: BrainCircuit, title: t("features.skills.title"), desc: t("features.skills.desc") },
                { icon: Clock, title: t("features.routines.title"), desc: t("features.routines.desc") },
                { icon: LayoutDashboard, title: t("features.dashboard.title"), desc: t("features.dashboard.desc") },
                { icon: Workflow, title: t("features.integrations.title"), desc: t("features.integrations.desc") },
                { icon: MessageSquare, title: t("features.channels.title"), desc: t("features.channels.desc") },
                { icon: Database, title: t("features.memory.title"), desc: t("features.memory.desc") },
                { icon: Activity, title: t("features.teams.title"), desc: t("features.teams.desc") },
                { icon: Zap, title: t("features.scheduled.title"), desc: t("features.scheduled.desc") },
                { icon: Code, title: t("features.openSource.title"), desc: t("features.openSource.desc") },
              ].map((feature, i) => (
                <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <feature.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Why EvoNexus? */}
        <section className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("why.sectionTitle")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">{t("why.sectionSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: t("why.markdownFirst.title"), desc: t("why.markdownFirst.desc") },
                { icon: BrainCircuit, title: t("why.skillsAsInstructions.title"), desc: t("why.skillsAsInstructions.desc") },
                { icon: Layers, title: t("why.multiProvider.title"), desc: t("why.multiProvider.desc") },
                { icon: Cpu, title: t("why.mcpIntegrations.title"), desc: t("why.mcpIntegrations.desc") },
                { icon: Terminal, title: t("why.slashCommands.title"), desc: t("why.slashCommands.desc") },
                { icon: Database, title: t("why.persistentMemory.title"), desc: t("why.persistentMemory.desc") },
              ].map((item, i) => (
                <div key={i} className="group relative p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(0,255,167,0.2)] transition-shadow">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-12 relative">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("howItWorks.sectionTitle")}</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-border z-0"></div>

              {[
                { step: 1, title: t("howItWorks.step1.title"), code: "npx @evoapi/evo-nexus", desc: t("howItWorks.step1.desc") },
                { step: 2, title: t("howItWorks.step2.title"), code: "make dashboard-app", desc: t("howItWorks.step2.desc") },
                { step: 3, title: t("howItWorks.step3.title"), code: t("howItWorks.step3.code"), desc: t("howItWorks.step3.desc") },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center text-center relative z-10">
                  <div className="w-24 h-24 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center text-3xl font-bold text-primary mb-6 shadow-[0_0_20px_rgba(0,255,167,0.2)]">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <div className="bg-muted px-3 py-1 rounded text-sm font-mono text-primary mb-3">
                    {item.code}
                  </div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Agents Showcase */}
        <section className="py-12 bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 mb-12">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("agents.sectionTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("agents.sectionSubtitle")}</p>
            </FadeIn>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Clawdia", cmd: "/clawdia-assistant", role: t("agents.clawdia.role"), desc: t("agents.clawdia.desc"), color: "text-primary", layer: "business" },
                  { name: "Flux", cmd: "/flux-finance", role: t("agents.flux.role"), desc: t("agents.flux.desc"), color: "text-primary", layer: "business" },
                  { name: "Atlas", cmd: "/atlas-project", role: t("agents.atlas.role"), desc: t("agents.atlas.desc"), color: "text-primary", layer: "business" },
                  { name: "Oracle", cmd: "/oracle", role: t("agents.oracle.role"), desc: t("agents.oracle.desc"), color: "text-primary", layer: "business" },
                  { name: "Pixel", cmd: "/pixel-social-media", role: t("agents.pixel.role"), desc: t("agents.pixel.desc"), color: "text-primary", layer: "business" },
                  { name: "Pulse", cmd: "/pulse-community", role: t("agents.pulse.role"), desc: t("agents.pulse.desc"), color: "text-primary", layer: "business" },
                  { name: "Apex", cmd: "/apex-architect", role: t("agents.apex.role"), desc: t("agents.apex.desc"), color: "text-blue-400", layer: "engineering" },
                  { name: "Bolt", cmd: "/bolt-executor", role: t("agents.bolt.role"), desc: t("agents.bolt.desc"), color: "text-blue-400", layer: "engineering" },
                ].map((agent, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors" data-testid={`agent-card-${agent.name.toLowerCase()}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-xl font-bold font-heading ${agent.color}`}>{agent.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded border shrink-0 ${agent.layer === 'business' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>{agent.role}</span>
                    </div>
                    <div className="font-mono text-primary text-xs mb-3 bg-primary/10 inline-block px-2 py-1 rounded">
                      {agent.cmd}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <a href="/docs/agents/overview" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/30 px-4 py-2 rounded-lg">
                  {t("agents.seeAll")}
                  <span className="text-primary">→</span>
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  19 engineering agents derived from{" "}
                  <a href="https://github.com/yeachan-heo/oh-my-claudecode" className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">oh-my-claudecode</a>
                  {" "}(MIT, by Yeachan Heo) + 2 native
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Integrations Bar */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-8">{t("integrations.label")}</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 opacity-60 hover:opacity-100 transition-all duration-500">
              <SiGooglecalendar className="w-7 h-7 hover:text-blue-500 transition-colors" title="Google Calendar" />
              <SiGmail className="w-7 h-7 hover:text-red-500 transition-colors" title="Gmail" />
              <SiGithub className="w-7 h-7 hover:text-white transition-colors" title="GitHub" />
              <SiLinear className="w-7 h-7 hover:text-purple-500 transition-colors" title="Linear" />
              <SiDiscord className="w-7 h-7 hover:text-indigo-400 transition-colors" title="Discord" />
              <SiTelegram className="w-7 h-7 hover:text-blue-400 transition-colors" title="Telegram" />
              <SiWhatsapp className="w-7 h-7 hover:text-green-500 transition-colors" title="WhatsApp" />
              <SiStripe className="w-7 h-7 hover:text-indigo-500 transition-colors" title="Stripe" />
              <SiTodoist className="w-7 h-7 hover:text-red-500 transition-colors" title="Todoist" />
              <SiYoutube className="w-7 h-7 hover:text-red-600 transition-colors" title="YouTube" />
              <SiInstagram className="w-7 h-7 hover:text-pink-500 transition-colors" title="Instagram" />
              <span title="LinkedIn"><Activity className="w-7 h-7 hover:text-blue-500 transition-colors" /></span>
              <SiFathom className="w-7 h-7 hover:text-blue-600 transition-colors" title="Fathom" />
              <SiCanva className="w-7 h-7 hover:text-blue-500 transition-colors" title="Canva" />
              <SiNotion className="w-7 h-7 hover:text-white transition-colors" title="Notion" />
              <SiFigma className="w-7 h-7 hover:text-purple-400 transition-colors" title="Figma" />
              <SiObsidian className="w-7 h-7 hover:text-purple-400 transition-colors" title="Obsidian" />
              <span title="Amplitude"><Activity className="w-7 h-7 hover:text-blue-400 transition-colors" /></span>
              <SiIntercom className="w-7 h-7 hover:text-blue-500 transition-colors" title="Intercom" />
              <SiHubspot className="w-7 h-7 hover:text-orange-500 transition-colors" title="HubSpot" />
              <span title="DocuSign"><FileText className="w-7 h-7 hover:text-yellow-500 transition-colors" /></span>
              <span title="Bling"><Workflow className="w-7 h-7 hover:text-blue-300 transition-colors" /></span>
              <span title="Asaas"><Zap className="w-7 h-7 hover:text-yellow-400 transition-colors" /></span>
            </div>
          </FadeIn>
        </section>

        {/* Social Proof — stats bar */}
        <section className="max-w-5xl mx-auto px-6 py-4">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 px-8 border border-border rounded-2xl bg-card/30">
              {[
                { value: "17,000+", label: t("socialProof.communityMembers") },
                { value: t("socialProof.production"), label: t("socialProof.since") },
                { value: "38", label: t("socialProof.agents") },
                { value: "175+", label: t("socialProof.skills") },
                { value: "MIT", label: t("socialProof.license") },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-primary">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                  {i < 4 && <span className="hidden sm:inline text-border ml-4">·</span>}
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Quick Start */}
        <section id="quickstart" className="max-w-4xl mx-auto px-6 w-full">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">{t("quickstart.sectionTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("quickstart.sectionSubtitle")}</p>
            </div>

            <div className="relative bg-[#0a0f18] rounded-xl border border-border overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 h-10 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">terminal</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 w-7"
                  onClick={copyCode}
                  data-testid="button-copy-code"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="p-6 md:p-8 font-mono text-base md:text-lg leading-loose">
                <div className="flex gap-3"><span className="text-primary select-none">$</span> <span className="text-gray-300"><span className="text-blue-400">npx</span> @evoapi/evo-nexus</span></div>
                <div className="mt-4 text-muted-foreground text-sm">{t("quickstart.comment")}</div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-10 h-14 shadow-[0_0_20px_rgba(0,255,167,0.4)]" data-testid="button-get-started-bottom" asChild>
                <a href={DOCS_URL}>
                  {t("quickstart.viewGuide")}
                </a>
              </Button>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-16 pb-8 relative">
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={MainLogo} alt="Evolution Foundation" className="h-8" />
              </div>
              <p className="text-muted-foreground text-sm">{t("footer.tagline")}</p>
            </div>

            <div className="flex flex-col md:items-center gap-4">
              <h4 className="font-bold mb-2">{t("footer.links")}</h4>
              <div className="flex flex-wrap gap-6">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-github">GitHub</a>
                <a href={DOCS_URL} className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-docs">{t("footer.documentation")}</a>
                <a href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contributing">{t("footer.contributing")}</a>
                <a href={`${GITHUB_URL}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-changelog">{t("footer.changelog")}</a>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-4 text-sm text-muted-foreground">
              <p>{t("footer.disclaimer")}</p>
              <div className="px-2 py-1 bg-muted rounded border border-border text-xs font-mono">
                MIT License
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
