
import { useEffect } from "react";
import { X, ArrowUpRight, FolderOpen } from "lucide-react";

export default function ProjectPreview({
  project,
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    if (!project) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="preview-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="preview-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        <div className="preview-header">
          <div className="preview-header-left">
            <span className="preview-dot" />
            <span className="preview-filename">
              {project.id}.exe
            </span>
          </div>

          <button
            className="preview-close"
            onClick={onClose}
            aria-label="Close project preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="preview-body">
          <div
            className="preview-artwork"
            style={{ "--project-color": project.color }}
          >
            <FolderOpen size={52} strokeWidth={1.4} />
            <span>PROJECT PREVIEW</span>
          </div>

          <p className="preview-category">{project.category}</p>
          <h2 id="preview-title">{project.title}</h2>
          <p className="preview-description">{project.description}</p>

<button
  type="button"
  className="preview-action"
  onClick={() => {
    onClose();
    onNavigate("contact");
  }}
>
  Inquire About Similar Work
  <ArrowUpRight size={18} />
</button>

        </div>
      </div>
    </div>
  );
}
