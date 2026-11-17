
import { useCallback, useEffect, useState } from "react";
import {
  FolderKanban,
  Layers,
  Images,
  BriefcaseBusiness,
  RefreshCw,
  Clock3,
  ArrowUpRight,
  CheckCircle2,
  FileEdit,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const BUCKET = "portfolio-images";

const initialStats = {
  projects: 0,
  publishedProjects: 0,
  drafts: 0,
  categories: 0,
  media: 0,
  services: 0,
  publishedServices: 0,
};

const numberFormat = new Intl.NumberFormat();

async function countRows(table, filters = []) {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  for (const [column, value] of filters) {
    query = query.eq(column, value);
  }

  const { count, error } = await query;

  if (error) throw error;

  return count ?? 0;
}

async function countMediaFiles(folder = "") {
  let total = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, {
        limit,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) throw error;

    const entries = data ?? [];

    for (const entry of entries) {
      const path = folder
        ? `${folder}/${entry.name}`
        : entry.name;

      if (entry.id == null) {
        total += await countMediaFiles(path);
      } else {
        total += 1;
      }
    }

    if (entries.length < limit) break;

    offset += limit;
  }

  return total;
}

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OverviewDashboard({
  onOpenModule,
  modules = [],
}) {
  const [stats, setStats] = useState(initialStats);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const results = await Promise.allSettled([
        countRows("portfolio_projects"),
        countRows("portfolio_projects", [
          ["published", true],
        ]),
        countRows("portfolio_categories", [
          ["archived", false],
        ]),
        countRows("portfolio_services"),
        countRows("portfolio_services", [
          ["published", true],
        ]),
        countMediaFiles(),
        supabase
          .from("portfolio_projects")
          .select(
            "id, title, category, published, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const failures = [];

      const readCount = (index, name) => {
        const result = results[index];

        if (result.status === "rejected") {
          failures.push(name);
          return null;
        }

        return result.value;
      };

      const totalProjects = readCount(0, "Projects");
      const publishedProjects = readCount(
        1,
        "Published projects"
      );
      const activeCategories = readCount(
        2,
        "Categories"
      );
      const totalServices = readCount(3, "Services");
      const publishedServices = readCount(
        4,
        "Published services"
      );
      const mediaCount = readCount(5, "Media Library");

      const recentResult = results[6];

      if (recentResult.status === "fulfilled") {
        if (recentResult.value.error) {
          failures.push("Recent projects");
        } else {
          setRecentProjects(recentResult.value.data ?? []);
        }
      } else {
        failures.push("Recent projects");
      }

      setStats({
        projects: totalProjects,
        publishedProjects,
        drafts:
          totalProjects !== null &&
          publishedProjects !== null
            ? Math.max(
                totalProjects - publishedProjects,
                0
              )
            : null,
        categories: activeCategories,
        media: mediaCount,
        services: totalServices,
        publishedServices,
      });

      if (failures.length) {
        setError(
          `Some information could not be loaded: ${failures.join(", ")}. Check your Supabase permissions and table columns.`
        );
      }
    } catch (err) {
      setError(
        err.message || "Could not load dashboard statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  const cards = [
    {
      label: "Total Projects",
      value: stats.projects,
      detail:
        stats.publishedProjects === null ||
        stats.drafts === null
          ? "Publication details unavailable"
          : `${stats.publishedProjects} published · ${stats.drafts} drafts`,
      icon: FolderKanban,
      module: "projects",
    },
    {
      label: "Active Categories",
      value: stats.categories,
      detail: "Available portfolio categories",
      icon: Layers,
      module: "categories",
    },
    {
      label: "Media Files",
      value: stats.media,
      detail: "Files in your media bucket",
      icon: Images,
      module: "media",
    },
    {
      label: "Services",
      value: stats.services,
      detail:
        stats.publishedServices === null
          ? "Publication details unavailable"
          : `${stats.publishedServices} published services`,
      icon: BriefcaseBusiness,
      module: "services",
    },
  ];

  return (
    <div className="cms-overview">
      <section className="cms-welcome">
        <span>✦ WELCOME BACK</span>

        <h2>
          Your creative universe, one dashboard.
        </h2>

        <p>
          Keep track of your portfolio, creative
          projects, and services from one private
          workspace.
        </p>

        <button
          type="button"
          className="cms-refresh-button"
          onClick={() => loadDashboard(false)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "cms-spin" : ""}
          />
          {refreshing
            ? "Refreshing..."
            : "Refresh Dashboard"}
        </button>
      </section>

      {error && (
        <div className="cms-overview-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="cms-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              type="button"
              key={card.label}
              className="cms-stat cms-stat-interactive"
              onClick={() => onOpenModule(card.module)}
            >
              <div className="cms-stat-top">
                <span>{card.label}</span>
                <Icon size={19} />
              </div>

              <strong className="cms-stat-number">
                {loading
                  ? "..."
                  : card.value === null
                    ? "—"
                    : numberFormat.format(card.value)}
              </strong>

              <small>{card.detail}</small>
            </button>
          );
        })}
      </section>

      <section className="cms-overview-details">
        <div className="cms-overview-panel">
          <div className="cms-overview-panel-heading">
            <div>
              <span className="cms-eyebrow">
                ♡ CREATIVE ACTIVITY
              </span>
              <h2>Recent Projects</h2>
            </div>

            <Clock3 size={20} />
          </div>

          {loading ? (
            <p className="cms-muted">
              Loading recent projects...
            </p>
          ) : recentProjects.length === 0 ? (
            <p className="cms-muted">
              No projects yet. Your latest work
              will appear here! ♡
            </p>
          ) : (
            <div className="cms-recent-list">
              {recentProjects.map((project) => (
                <button
                  type="button"
                  className="cms-recent-project"
                  key={project.id}
                  onClick={() =>
                    onOpenModule("projects")
                  }
                >
                  <div className="cms-recent-project-icon">
                    <FolderKanban size={18} />
                  </div>

                  <div className="cms-recent-project-info">
                    <strong>{project.title}</strong>
                    <span>
                      {project.category || "Uncategorized"}
                      {" · "}
                      {formatDate(project.created_at)}
                    </span>
                  </div>

                  <span
                    className={
                      project.published
                        ? "cms-status-published"
                        : "cms-status-draft"
                    }
                  >
                    {project.published ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <FileEdit size={13} />
                    )}

                    {project.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cms-overview-panel">
          <div className="cms-overview-panel-heading">
            <div>
              <span className="cms-eyebrow">
                ♡ WORKSPACE SHORTCUTS
              </span>
              <h2>Quick Access</h2>
            </div>

            <ArrowUpRight size={20} />
          </div>

          <div className="cms-overview-shortcuts">
            {modules
              .filter((module) => module.id !== "overview")
              .map((module) => {
                const Icon = module.icon;

                return (
                  <button
                    type="button"
                    key={module.id}
                    className="cms-overview-shortcut"
                    onClick={() =>
                      onOpenModule(module.id)
                    }
                  >
                    <Icon size={19} />
                    <span>{module.label}</span>
                    <ArrowUpRight size={15} />
                  </button>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
