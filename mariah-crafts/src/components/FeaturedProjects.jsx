
import {
  ArrowUpRight,
  MonitorPlay,
  Gamepad2,
  Code2,
  Palette,
  LayoutDashboard,
} from "lucide-react";

const categoryStyles = {
  "UI/UX Lab": {
    icon: LayoutDashboard,
    color: "#ff4eab",
  },
  "UI/UX": {
    icon: LayoutDashboard,
    color: "#ff4eab",
  },
  "UI/UX Design": {
    icon: LayoutDashboard,
    color: "#ff4eab",
  },
  "Game Arcade": {
    icon: Gamepad2,
    color: "#b18aff",
  },
  "Game Design": {
    icon: Gamepad2,
    color: "#b18aff",
  },
  "Game Development": {
    icon: Gamepad2,
    color: "#b18aff",
  },
  "Web Experiments": {
    icon: Code2,
    color: "#68d2ff",
  },
  "Web Development": {
    icon: Code2,
    color: "#68d2ff",
  },
  "Graphic Design & Branding": {
    icon: Palette,
    color: "#ffadd9",
  },
  "Graphic Design": {
    icon: Palette,
    color: "#ffadd9",
  },
  Branding: {
    icon: Palette,
    color: "#ffadd9",
  },
};

const fallbackStyle = {
  icon: MonitorPlay,
  color: "#ff4eab",
};

export default function FeaturedProjects({
  projects = [],
  onOpenProject,
}) {
  // Only display projects that are both published and featured.
  const featuredProjects = projects.filter(
    (project) => project.published && project.featured
  );

  return (
    <section
      className="featured-section"
      id="featured"
      aria-labelledby="featured-heading"
    >
      <div className="featured-heading">
        <div>
          <p className="eyebrow">02 / SELECTED WORK</p>

          <h2 id="featured-heading">
            Featured Experiments
            <span className="pink"> ✳</span>
          </h2>

          <p>
            A rotating spotlight for my favorite creative
            and technical experiments.
          </p>
        </div>

        <a href="#portfolio" className="featured-view-all">
          Explore Categories
          <ArrowUpRight size={18} />
        </a>
      </div>

      {featuredProjects.length === 0 ? (
        <p style={{ padding: "20px 0" }}>
          Featured experiments are coming soon! ♡
        </p>
      ) : (
        <div className="featured-grid">
          {featuredProjects.map((project, index) => {
            const category =
              categoryStyles[project.category] || fallbackStyle;

            const Icon = category.icon;
            const accentColor =
              project.color || category.color;

            return (
              <button
                type="button"
                className={`featured-card ${
                  index === 0 ? "featured-card-large" : ""
                }`}
                key={project.id}
                style={{
                  "--featured-accent": accentColor,
                }}
                onClick={() => onOpenProject(project)}
                aria-label={`Preview ${project.title}`}
              >
                {/* TOP STATUS BAR */}
                <div className="featured-card-top">
                  <span className="featured-status">
                    FEATURED ✳
                  </span>

                  <ArrowUpRight size={21} />
                </div>

                {/* PROJECT ARTWORK */}
                <div className="featured-visual">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={`${project.title} cover`}
                      loading="lazy"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="featured-visual-inner">
                      <Icon
                        size={48}
                        strokeWidth={1.2}
                      />

                      <span>
                        MARIAH CRAFTS / EXPERIMENT
                      </span>
                    </div>
                  )}
                </div>

                {/* PROJECT INFORMATION */}
                <div className="featured-card-info">
                  <span className="featured-category">
                    {project.category}
                  </span>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>

                  <span className="featured-open">
                    Open Preview
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
