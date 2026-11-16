
import {
  ArrowUpRight,
  MonitorPlay,
  Gamepad2,
  Code2,
} from "lucide-react";

import { featuredProjects } from "../data/featuredProjects";

const icons = {
  layout: MonitorPlay,
  game: Gamepad2,
  code: Code2,
};

export default function FeaturedProjects({ onOpenProject }) {
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

      <div className="featured-grid">
        {featuredProjects.map((project, index) => {
          const Icon = icons[project.icon] || MonitorPlay;

          return (
            <button
              type="button"
              className={`featured-card ${
                index === 0 ? "featured-card-large" : ""
              }`}
              key={project.id}
              style={{ "--featured-accent": project.accent }}
              onClick={() =>
                onOpenProject({
                  ...project,
                  color: project.accent,
                })
              }
              aria-label={`Preview ${project.title}`}
            >
              <div className="featured-card-top">
                <span className="featured-status">
                  {project.status}
                </span>
                <ArrowUpRight size={21} />
              </div>

              <div className="featured-visual">
                <div className="featured-visual-inner">
                  <Icon size={48} strokeWidth={1.2} />
                  <span>MARIAH CRAFTS / EXPERIMENT</span>
                </div>
              </div>

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
    </section>
  );
}
