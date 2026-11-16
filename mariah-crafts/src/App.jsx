
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  Gamepad2,
  Code2,
  Palette,
  FolderOpen,
  Heart,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

import { projects } from "./data/projects";
import ProjectPreview from "./components/ProjectPreview";
import FeaturedProjects from "./components/FeaturedProjects";
import AboutPage from "./components/AboutPage";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import DashboardSidebar from "./components/DashboardSidebar";
import PixelTaskbar from "./components/PixelTaskbar";
import "./App.css";

const projectIcons = {
  layout: LayoutDashboard,
  game: Gamepad2,
  code: Code2,
  palette: Palette,
};

const pages = {
  home: "Home",
  portfolio: "Portfolio",
  about: "About",
  services: "Services",
  contact: "Contact",
};

function App() {
  const [activePage, setActivePage] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    if (!activeProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  function navigateTo(page) {
    if (!pages[page]) return;

    setActivePage(page);
    setMobileMenuOpen(false);
    setActiveProject(null);

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div
      className={`site-shell dashboard-layout ${
        sidebarCollapsed ? "layout-collapsed" : ""
      }`}
    >
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((previous) => !previous)}
        activePage={activePage}
        onNavigate={navigateTo}
      />

      {/* MOBILE TOP BAR */}
      <header className="dashboard-mobile-header">
        <span>MARIAH CRAFTS ✳</span>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <nav className="dashboard-mobile-menu">
          {Object.entries(pages).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={activePage === id ? "mobile-page-active" : ""}
              onClick={() => navigateTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* DASHBOARD WORKSPACE */}
      <main className="dashboard-workspace">

{/* GLOBAL OS DECORATIONS */}
<div className="os-decorations" aria-hidden="true">
  <span className="os-deco os-deco-1">♡</span>
  <span className="os-deco os-deco-2">✦</span>
  <span className="os-deco os-deco-3">♥</span>
  <span className="os-deco os-deco-4">✧</span>
  <span className="os-deco os-deco-5">♡</span>
  <span className="os-deco os-deco-6">✦</span>
</div>

        <div className="workspace-topbar">
          <div className="workspace-breadcrumb">
            <span>MARIAH_CRAFTS</span>
            <span>/</span>
            <strong>{pages[activePage]}</strong>
          </div>

          <div className="workspace-status">
            <span className="sidebar-status-dot" />
            SYSTEM ONLINE
          </div>
        </div>

        <div
          key={activePage}
          className="workspace-page"
        >
          {activePage === "home" && (
            <section className="home-workspace">
              
{/* FLOATING PIXEL HEARTS */}
<div className="pixel-heart-field" aria-hidden="true">
  <span>♥</span>
  <span>♥</span>
  <span>♥</span>
  <span>♥</span>
  <span>♥</span>
  <span>♥</span>
</div>


              <div className="os-window welcome-window">
                <div className="os-window-header">
                  <span>
                    <Heart size={16} />

                    welcome.exe
                  </span>
                  <span className="window-controls">
                    <span>−</span>
                    <span>□</span>
                    <span>×</span>
                  </span>
                </div>

                <div className="welcome-content">
                  <p className="eyebrow">
                    ✳ CREATIVE TECHNOLOGIST
                  </p>

                  <h1>
                    Welcome to my
                    <span className="pink"> creative universe.</span>
                  </h1>

                  <p>
                    Art, code, design, games, and everything
                    in between. Explore my digital workspace
                    and see what I've been creating.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigateTo("portfolio")}
                  >
                    Explore My Work
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>

              <div className="home-shortcuts">
                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() => navigateTo("portfolio")}
                >
                  <FolderOpen size={30} />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() => navigateTo("about")}
                >
                  <Palette size={30} />
                  <span>About Me</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() => navigateTo("services")}
                >
                  <Code2 size={30} />
                  <span>Services</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() => navigateTo("contact")}
                >
                  <Sparkles size={30} />
                  <span>Connect</span>
                </button>
              </div>

              <div className="os-window home-info-window">
                <div className="os-window-header">
                  <span>✳ creative.status</span>
                  <span className="window-controls">♡</span>
                </div>

                <div className="home-info-content">
                  <p>Currently exploring:</p>
                  <div className="home-tags">
                    <span>Game Development</span>
                    <span>UI/UX</span>
                    <span>Creative Coding</span>
                    <span>AI Solutions</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === "portfolio" && (
            <div className="portfolio-workspace">
              <section className="dashboard-section" id="portfolio">
                <div className="section-heading">
                  <p className="eyebrow">
                    01 / EXPLORE MY UNIVERSE
                  </p>

                  <h2>
                    Creative Dashboard
                    <span className="pink"> ✳</span>
                  </h2>

                  <p>
                    A collection of design, development,
                    and interactive experiments.
                    Pick a window to explore.
                  </p>
                </div>

                <div className="dashboard-grid">
                  {projects.map((project) => {
                    const Icon =
                      projectIcons[project.icon] || LayoutDashboard;

                    return (
                      <button
                        type="button"
                        key={project.id}
                        className="dashboard-card"
                        style={{
                          "--accent": project.color || "#ff4eab",
                        }}
                        onClick={() => setActiveProject(project)}
                      >
                        <div className="dashboard-card-top">
                          <span className="card-label">
                            {project.category}
                          </span>
                          <ArrowUpRight size={20} />
                        </div>

                        <div className="dashboard-card-icon">
                          <Icon size={36} strokeWidth={1.5} />
                        </div>

                        <div className="dashboard-card-bottom">
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                          <span className="card-explore">
                            Open Preview ↗
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <FeaturedProjects
                onOpenProject={setActiveProject}
              />
            </div>
          )}
{activePage === "about" && (
  <AboutPage onNavigate={navigateTo} />
)}
{activePage === "services" && (
  <ServicesSection onNavigate={navigateTo} />
)}

          {activePage === "contact" && <ContactSection />}
        </div>
      </main>

<PixelTaskbar
  activePage={activePage}
  onNavigate={navigateTo}
/>

      <footer className="site-footer dashboard-footer">
        <span>© {new Date().getFullYear()} Mariah Crafts</span>
        <span>Design. Code. Create.</span>
      </footer>

   
<ProjectPreview
  project={activeProject}
  onClose={() => setActiveProject(null)}
  onNavigate={navigateTo}
/>

    </div>
  );
}

export default App;
