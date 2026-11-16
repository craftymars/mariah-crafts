
import {
  House,
  FolderHeart,
  Mail,
  Heart,
} from "lucide-react";

const shortcuts = [
  { id: "home", label: "Home", icon: House },
  {
    id: "portfolio",
    label: "Work",
    icon: FolderHeart,
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
  },
];

export default function PixelTaskbar({
  activePage,
  onNavigate,
}) {
  return (
    <nav
      className="pixel-taskbar"
      aria-label="Quick dashboard navigation"
    >
      <div className="taskbar-brand" aria-hidden="true">
        <Heart size={15} fill="currentColor" />
        <span>MARIAH_OS</span>
      </div>

      <div className="taskbar-shortcuts">
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`taskbar-shortcut ${
                activePage === item.id
                  ? "taskbar-shortcut-active"
                  : ""
              }`}
              onClick={() => onNavigate(item.id)}
              aria-label={`Open ${item.label}`}
              aria-current={
                activePage === item.id
                  ? "page"
                  : undefined
              }
              title={item.label}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="taskbar-status">
        <span className="taskbar-status-heart">♥</span>
        <div>
          <span>creative mode</span>
          <small>
            <span className="taskbar-online-dot" />
            online
          </small>
        </div>
      </div>
    </nav>
  );
}
