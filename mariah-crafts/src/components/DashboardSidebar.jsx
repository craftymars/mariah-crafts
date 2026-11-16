
import {
  House,
  LayoutDashboard,
  UserRound,
  Wrench,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navigationItems = [
  {
    id: "home",
    label: "Home",
    icon: House,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: LayoutDashboard,
  },
  {
    id: "about",
    label: "About",
    icon: UserRound,
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
  },
];

export default function DashboardSidebar({
  collapsed = false,
  onToggle,
  activePage = "home",
  onNavigate,
}) {
  return (
    <aside
      className={`dashboard-sidebar ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      aria-label="Mariah Crafts dashboard"
    >
      {/* BRAND HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img
            src="/favicon.png"
            alt=""
            className="sidebar-logo"
          />

          {!collapsed && (
            <span className="sidebar-brand-name">
              MARIAH CRAFTS
            </span>
          )}
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      {!collapsed && (
        <p className="sidebar-label">
          WORKSPACE
        </p>
      )}

      <nav
        className="sidebar-navigation"
        aria-label="Dashboard navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`}
              onClick={() => onNavigate?.(item.id)}
              aria-current={
                isActive ? "page" : undefined
              }
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* SIDEBAR FOOTER */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span className="sidebar-status-dot" />
          <span>Creative Mode: ON</span>
        </div>
      )}
    </aside>
  );
}

