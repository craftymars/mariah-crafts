
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Images,
  BriefcaseBusiness,
  Contact,
  FileUser,
  Settings,
  Monitor,
  Heart,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Circle,
  ArrowUpRight,
} from "lucide-react";

import ProjectManager from "./ProjectManager";
import CategoryManager from "./CategoryManager";
import MediaLibrary from "./MediaLibrary";
import ServiceManager from "./ServiceManager";
import SocialContactManager from "./SocialContactManager";
import ResumeManager from "./ResumeManager";
import SiteSettingsManager from "./SiteSettingsManager";
import OverviewDashboard from "./OverviewDashboard";
import CMSPixelBackground from "./CMSPixelBackground";

import "./dashboard.css";
import "./admin.css";

const modules = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    file: "dashboard.exe",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderKanban,
    file: "projects.exe",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Layers,
    file: "categories.exe",
  },
  {
    id: "media",
    label: "Media Library",
    icon: Images,
    file: "media.exe",
  },
  {
    id: "services",
    label: "Services",
    icon: BriefcaseBusiness,
    file: "services.exe",
  },
  {
    id: "contact",
    label: "Social & Contact",
    icon: Contact,
    file: "contact.exe",
  },
  {
    id: "resume",
    label: "Resume",
    icon: FileUser,
    file: "resume.exe",
  },
  {
    id: "settings",
    label: "Site Settings",
    icon: Settings,
    file: "settings.exe",
  },
];

export default function AdminDashboard() {
  const [activeModule, setActiveModule] =
    useState("overview");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const current =
    modules.find(
      (module) => module.id === activeModule
    ) ?? modules[0];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "cms-menu-open",
      mobileMenuOpen
    );

    return () => {
      document.body.classList.remove("cms-menu-open");
    };
  }, [mobileMenuOpen]);

  function openModule(id) {
    setActiveModule(id);
    setMobileMenuOpen(false);
  }

  function renderContent() {
    switch (activeModule) {
      case "overview":
        return (
          <OverviewDashboard
            modules={modules}
            onOpenModule={openModule}
          />
        );

      case "projects":
        return <ProjectManager />;

      case "categories":
        return <CategoryManager />;

      case "media":
        return <MediaLibrary />;

      case "services":
        return <ServiceManager />;

      case "contact":
        return <SocialContactManager />;

      case "resume":
        return <ResumeManager />;

      case "settings":
        return <SiteSettingsManager />;

      default:
        return null;
    }
  }

  return (
    <div
      className={`cms-shell cms-os-shell ${
        sidebarCollapsed ? "cms-is-collapsed" : ""
      }`}
    >
      {/* Animated pixel background */}
      <CMSPixelBackground />

      {/* Mobile navigation backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="cms-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}

      {/* Sidebar */}
      <aside
        id="cms-sidebar"
        className={`cms-sidebar cms-os-sidebar ${
          mobileMenuOpen ? "cms-mobile-open" : ""
        }`}
      >
        <div className="cms-brand cms-os-brand">
          <div className="cms-brand-icon">
            <Heart size={19} fill="currentColor" />
          </div>

          <div className="cms-brand-copy">
            <strong>mariah_crafts_os</strong>
            <span>PRIVATE CONTROL CENTER</span>
          </div>

          <button
            type="button"
            className="cms-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="cms-os-nav-heading">
          <span>WORKSPACE DIRECTORY</span>
          <span>08</span>
        </div>

        <nav
          className="cms-navigation cms-os-navigation"
          aria-label="CMS navigation"
        >
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;

            return (
              <button
                type="button"
                key={module.id}
                title={module.label}
                className={`cms-nav-item cms-os-nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => openModule(module.id)}
                aria-current={
                  isActive ? "page" : undefined
                }
              >
                <span className="cms-nav-icon">
                  <Icon size={18} />
                </span>

                <span className="cms-nav-label">
                  {module.label}
                </span>

                <ChevronRight
                  size={14}
                  className="cms-nav-chevron"
                />
              </button>
            );
          })}
        </nav>

        <div className="cms-os-sidebar-bottom">
          <div className="cms-sidebar-footer cms-os-status">
            <div className="cms-status-heading">
              <span className="cms-status-dot" />
              <span>♡ SYSTEM STATUS</span>
            </div>

            <strong>Interface Online</strong>
            <small>All modules available</small>
          </div>

          <button
            type="button"
            className="cms-collapse-button"
            onClick={() =>
              setSidebarCollapsed((previous) => !previous)
            }
            aria-label={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}

            <span>Collapse sidebar</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="cms-main cms-os-main">
        <div className="cms-os-windowbar">
          <div className="cms-os-window-left">
            <button
              type="button"
              className="cms-mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-controls="cms-sidebar"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>

            <span className="cms-os-window-icon">
              <Heart size={13} />
            </span>

            <span className="cms-os-window-title">
              mariah_crafts_os / {current.file}
            </span>
          </div>

          <div
            className="cms-os-window-controls"
            aria-hidden="true"
          >
            <span />
            <span />
            <span className="cms-os-window-close">
              <X size={11} />
            </span>
          </div>
        </div>

        <header className="cms-header cms-os-header">
          <div className="cms-header-copy">
            <div className="cms-os-breadcrumb">
              <span>HOME</span>
              <ChevronRight size={12} />
              <span>
                {current.label.toUpperCase()}
              </span>
            </div>

            <p className="cms-eyebrow">
              ♡ CREATIVE WORKSPACE
            </p>

            <h1>{current.label}</h1>

            <p className="cms-os-subtitle">
              Your private creative control center.
            </p>
          </div>

          <a
            href="/"
            className="cms-site-link cms-os-site-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Monitor size={17} />
            <span>View Website</span>
            <ArrowUpRight size={15} />
          </a>
        </header>

        <div
          className="cms-os-content"
          key={activeModule}
        >
          {renderContent()}
        </div>

        <footer className="cms-os-footer">
          <div>
            <Circle
              size={8}
              fill="currentColor"
              className="cms-footer-dot"
            />
            <span>PRIVATE WORKSPACE</span>
          </div>

          <span>MADE WITH ♡ BY MARIAH</span>
        </footer>
      </main>
    </div>
  );
}
