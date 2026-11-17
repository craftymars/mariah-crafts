
import { useEffect, useState } from "react";
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
  Folder,
  Image,
  Film,
  Cpu,
  Layers,
  BrainCircuit,
} from "lucide-react";

import { supabase } from "./lib/supabase";
import ProjectPreview from "./components/ProjectPreview";
import FeaturedProjects from "./components/FeaturedProjects";
import AboutPage from "./components/AboutPage";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import DashboardSidebar from "./components/DashboardSidebar";
import PixelTaskbar from "./components/PixelTaskbar";

import AdminQuickAccess from "./components/admin/AdminQuickAccess";

import useSiteSettings from "./hooks/useSiteSettings";
import "./App.css";

const categoryIcons = {
  folder: Folder,
  "layout-dashboard": LayoutDashboard,
  "gamepad-2": Gamepad2,
  "code-2": Code2,
  palette: Palette,
  sparkles: Sparkles,
  image: Image,
  film: Film,
  cpu: Cpu,
  layers: Layers,
  "brain-circuit": BrainCircuit,
};

const pages = {
  home: "Home",
  portfolio: "Portfolio",
  about: "About",
  services: "Services",
  contact: "Contact",
};

// Supports older category names already saved on projects.
const categoryAliases = {
  "ui-ux-lab": ["UI/UX", "UI/UX Design"],
  "game-arcade": ["Game Design", "Game Development"],
  "web-experiments": ["Web Development"],
  "graphic-design-branding": [
    "Graphic Design",
    "Branding",
    "Visual Design",
  ],
};

function matchesCategory(project, category) {
  const projectCategory = (project.category || "")
    .trim()
    .toLowerCase();

  const names = [
    category.name,
    category.slug,
    ...(categoryAliases[category.slug] || []),
  ];

  return names.some(
    (name) => name.toLowerCase() === projectCategory
  );
}

export default function App() {

const siteSettings = useSiteSettings();
  const [activePage, setActivePage] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [projectsError, setProjectsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPortfolio() {
      const [projectResult, categoryResult] = await Promise.all([
        supabase
          .from("portfolio_projects")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("portfolio_categories")
          .select("*")
          .eq("archived", false)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

      if (!active) return;

      if (projectResult.error) {
        console.error("Project loading error:", projectResult.error);
        setProjectsError("Projects could not be loaded.");
      } else {
        setProjects(projectResult.data ?? []);
        setProjectsError("");
      }

      if (categoryResult.error) {
        console.error("Category loading error:", categoryResult.error);
        setCategoriesError("Categories could not be loaded.");
      } else {
        setCategories(categoryResult.data ?? []);
        setCategoriesError("");
      }

      setProjectsLoading(false);
      setCategoriesLoading(false);
    }

    loadPortfolio().catch((error) => {
      console.error("Portfolio loading failed:", error);

      if (active) {
        setProjectsError("Projects could not be loaded.");
        setCategoriesError("Categories could not be loaded.");
        setProjectsLoading(false);
        setCategoriesLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

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
    setSelectedCategory(null);

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openCategory(category) {
    setSelectedCategory(category);
    setActiveProject(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeCategory() {
    setSelectedCategory(null);
  }

  const categoryProjects = selectedCategory
    ? projects.filter((project) =>
        matchesCategory(project, selectedCategory)
      )
    : [];

  const featuredProjects = projects.map((project) => {
    const category = categories.find((item) =>
      matchesCategory(project, item)
    );

    return {
      ...project,
      color: category?.color || "#FF4EAB",
      icon: category?.icon || "folder",
    };
  });

  function renderCategoryCard(category) {
    const Icon = categoryIcons[category.icon] || Folder;

    return (
      <button
        type="button"
        key={category.id}
        className="dashboard-card"
        style={{
          "--accent": category.color || "#FF4EAB",
        }}
        onClick={() => openCategory(category)}
      >
        <div className="dashboard-card-top">
          <span className="card-label">
            {category.name.toUpperCase()}
          </span>

          <ArrowUpRight size={20} />
        </div>

        <div className="dashboard-card-icon">
          <Icon size={36} strokeWidth={1.5} />
        </div>

        <div className="dashboard-card-bottom">
          <h3>{category.name}</h3>

          <p>{category.description}</p>

          <span className="card-explore">
            Explore Category ↗
          </span>
        </div>
      </button>
    );
  }

  function renderProjectCard(project) {
    const Icon =
      categoryIcons[selectedCategory?.icon] || FolderOpen;

    return (
      <button
        type="button"
        key={project.id}
        className="dashboard-card"
        style={{
          "--accent": selectedCategory?.color || "#FF4EAB",
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
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt=""
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                maxHeight: 180,
                objectFit: "contain",
              }}
            />
          ) : (
            <Icon size={36} strokeWidth={1.5} />
          )}
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
  }

  return (
    <div
      className={`site-shell dashboard-layout ${
        sidebarCollapsed ? "layout-collapsed" : ""
      }`}
    >
      {/* DESKTOP SIDEBAR */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((previous) => !previous)
        }
        activePage={activePage}
        onNavigate={navigateTo}
      />

      {/* MOBILE TOP BAR */}
      <header className="dashboard-mobile-header">
        <span>MARIAH CRAFTS ✳</span>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((previous) => !previous)
          }
          aria-label={
            mobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>
      </header>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <nav className="dashboard-mobile-menu">
          {Object.entries(pages).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                activePage === id
                  ? "mobile-page-active"
                  : ""
              }
              onClick={() => navigateTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* MAIN OS WORKSPACE */}
      <main className="dashboard-workspace">
        {/* GLOBAL DECORATIONS */}
        <div
          className="os-decorations"
          aria-hidden="true"
        >
          <span className="os-deco os-deco-1">♡</span>
          <span className="os-deco os-deco-2">✦</span>
          <span className="os-deco os-deco-3">♥</span>
          <span className="os-deco os-deco-4">✧</span>
          <span className="os-deco os-deco-5">♡</span>
          <span className="os-deco os-deco-6">✦</span>
        </div>

        {/* WORKSPACE TOP BAR */}
        <div className="workspace-topbar">
          <div className="workspace-breadcrumb">
            <span>MARIAH_CRAFTS</span>
            <span>/</span>
            <strong>
              {pages[activePage]}
              {activePage === "portfolio" &&
                selectedCategory &&
                ` / ${selectedCategory.name}`}
            </strong>
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
          {/* HOME PAGE */}
          {activePage === "home" && (
            <section className="home-workspace">
              <div
                className="pixel-heart-field"
                aria-hidden="true"
              >
                <span>♥</span>
                <span>♥</span>
                <span>♥</span>
                <span>♥</span>
                <span>♥</span>
                <span>♥</span>
              </div>

              {/* WELCOME WINDOW */}
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
                    <span className="pink">
                      {" "}creative universe.
                    </span>
                  </h1>

                  <p>
                    Art, code, design, games, and everything
                    in between. Explore my digital workspace
                    and see what I've been creating.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      navigateTo("portfolio")
                    }
                  >
                    Explore My Work
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>

              {/* HOME SHORTCUTS */}
              <div className="home-shortcuts">
                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() =>
                    navigateTo("portfolio")
                  }
                >
                  <FolderOpen size={30} />
                  <span>Projects</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() =>
                    navigateTo("about")
                  }
                >
                  <Palette size={30} />
                  <span>About Me</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() =>
                    navigateTo("services")
                  }
                >
                  <Code2 size={30} />
                  <span>Services</span>
                </button>

                <button
                  type="button"
                  className="home-shortcut"
                  onClick={() =>
                    navigateTo("contact")
                  }
                >
                  <Sparkles size={30} />
                  <span>Connect</span>
                </button>
              </div>

              {/* CREATIVE STATUS */}
              <div className="os-window home-info-window">
                <div className="os-window-header">
                  <span>✳ creative.status</span>

                  <span className="window-controls">
                    ♡
                  </span>
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

          {/* PORTFOLIO PAGE */}
          {activePage === "portfolio" && (
            <div className="portfolio-workspace">
              <section
                className="dashboard-section"
                id="portfolio"
              >
                <div className="section-heading">
                  <p className="eyebrow">
                    01 / EXPLORE MY UNIVERSE
                  </p>

                  <h2>
                    {selectedCategory
                      ? selectedCategory.name
                      : "Creative Dashboard"}

                    <span className="pink"> ✳</span>
                  </h2>

                  <p>
                    {selectedCategory
                      ? selectedCategory.description
                      : "A collection of design, development, and interactive experiments. Pick a window to explore."}
                  </p>
                </div>

                {/* CATEGORY OVERVIEW */}
                {!selectedCategory && (
                  <>
                    {categoriesLoading && (
                      <p>Loading categories... ♡</p>
                    )}

                    {categoriesError && (
                      <p role="alert">
                        {categoriesError}
                      </p>
                    )}

                    {!categoriesLoading &&
                      !categoriesError &&
                      categories.length === 0 && (
                        <p>
                          New creative categories are coming soon! ♡
                        </p>
                      )}

                    {!categoriesLoading &&
                      !categoriesError &&
                      categories.length > 0 && (
                        <div className="dashboard-grid">
                          {categories.map(renderCategoryCard)}
                        </div>
                      )}
                  </>
                )}

                {/* SELECTED CATEGORY */}
                {selectedCategory && (
                  <div className="category-explorer">
                    <button
                      type="button"
                      onClick={closeCategory}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: selectedCategory.color,
                        cursor: "pointer",
                        padding: "0 0 20px",
                        font: "inherit",
                      }}
                    >
                      ← Back to Categories
                    </button>

                    {projectsLoading && (
                      <p>Loading projects... ♡</p>
                    )}

                    {projectsError && (
                      <p role="alert">
                        {projectsError}
                      </p>
                    )}

                    {!projectsLoading &&
                      !projectsError &&
                      categoryProjects.length === 0 && (
                        <p>
                          No published projects in this
                          category yet. ♡
                        </p>
                      )}

                    {!projectsLoading &&
                      !projectsError &&
                      categoryProjects.length > 0 && (
                        <div className="dashboard-grid">
                          {categoryProjects.map(renderProjectCard)}
                        </div>
                      )}
                  </div>
                )}
              </section>

              {/* FEATURED EXPERIMENTS */}
              {!selectedCategory &&
                !projectsLoading &&
                !categoriesLoading &&
                !projectsError &&
                !categoriesError && (
                  <FeaturedProjects
                    projects={featuredProjects}
                    onOpenProject={setActiveProject}
                  />
                )}
            </div>
          )}

          {/* ABOUT PAGE */}
          {activePage === "about" && (
            <AboutPage onNavigate={navigateTo} />
          )}

          {/* SERVICES PAGE */}
          {activePage === "services" && (
            <ServicesSection
              onNavigate={navigateTo}
            />
          )}

          {/* CONTACT PAGE */}
          {activePage === "contact" && (
            <ContactSection />
          )}
        </div>
      </main>

      {/* TASKBAR */}
      <PixelTaskbar
        activePage={activePage}
        onNavigate={navigateTo}
      />

{/* FOOTER */}
<footer className="site-footer dashboard-footer">
  <span>
    © {new Date().getFullYear()}{" "}
    {siteSettings.footer_name}
  </span>

  <span>{siteSettings.footer_tagline}</span>
</footer>

      {/* PROJECT PREVIEW WINDOW */}
      <ProjectPreview
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onNavigate={navigateTo}
      />

      {/* PRIVATE ADMIN QUICK ACCESS */}
      <AdminQuickAccess />

    </div>
  );
}

  

