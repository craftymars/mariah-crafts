
import { useEffect } from "react";
import {
  X,
  ArrowUpRight,
  FolderOpen,
  ExternalLink,
} from "lucide-react";

export default function ProjectPreview({
  project,
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    if (!project) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [project, onClose]);

  if (!project) return null;

  const projectSlug =
    project.slug ||
    project.title
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    "project";

  const projectColor =
    project.color || "#ff4eab";

  const coverImage =
    project.cover_image_url || project.image || null;

  const projectUrl = project.project_url || null;

  return (
    <div
      className="preview-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="preview-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        {/* WINDOW HEADER */}
        <div className="preview-header">
          <div className="preview-header-left">
            <span className="preview-dot" />

            <span className="preview-filename">
              {projectSlug}.exe
            </span>
          </div>

          <button
            type="button"
            className="preview-close"
            onClick={onClose}
            aria-label="Close project preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* PROJECT CONTENT */}
        <div className="preview-body">
          {/* COVER IMAGE OR FALLBACK */}
          <div
            className="preview-artwork"
            style={{
              "--project-color": projectColor,
              overflow: "hidden",
            }}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${project.title} project cover`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  minHeight: "220px",
                  maxHeight: "420px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <>
                <FolderOpen
                  size={52}
                  strokeWidth={1.4}
                />
                <span>PROJECT PREVIEW</span>
              </>
            )}
          </div>

          {/* PROJECT INFORMATION */}
          <p className="preview-category">
            {project.category || "Creative Project"}
          </p>

          <h2 id="preview-title">
            {project.title}
          </h2>

          {project.description && (
            <p className="preview-description">
              {project.description}
            </p>
          )}

          {/* PROJECT ACTIONS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {projectUrl && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-action"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                View Project
                <ExternalLink size={18} />
              </a>
            )}

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
    </div>
  );
}
