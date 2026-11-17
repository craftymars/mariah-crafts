
import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud, Images, Search, Copy, Trash2, RefreshCw,
  ExternalLink, X, ShieldAlert, Folder, FolderOpen,
  MoveRight, ArrowUpDown, Image as ImageIcon,
  CheckSquare, Square, Info,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import "./media-library.css";

const BUCKET = "portfolio-images";
const MAX_SIZE = 20 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

const FOLDERS = [
  // Main Library
  { id: "all", label: "All Assets" },

  // Portfolio & Personal
  { id: "covers", label: "Project Covers" },
  { id: "profile", label: "Profile Photos" },

  // Graphic Design & Creative Arts
  { id: "branding", label: "Graphic Design & Branding" },
  { id: "illustrations", label: "Illustrations & Digital Art" },
  { id: "motion-art", label: "Motion Graphics & Animation" },
  { id: "photography", label: "Photography & Photo Editing" },
  { id: "video-editing", label: "Video Editing" },

  // UI/UX & Web Development
  { id: "ui-ux", label: "UI/UX Design" },
  { id: "web-design", label: "Web Design & Development" },
  { id: "mobile-apps", label: "Mobile App Design" },

  // Game Design & Development
  { id: "game-assets", label: "Game Art & Assets" },
  { id: "game-ui", label: "Game UI & HUDs" },
  { id: "pixel-art", label: "Pixel Art & Sprites" },
  { id: "game-development", label: "Game Development" },

  // AI & Intelligent Systems
  { id: "ai-automation", label: "AI & Automation" },
  { id: "machine-learning", label: "Machine Learning & Data" },

  // Software & Cloud Engineering
  { id: "programming", label: "Programming & Software" },
  { id: "devops", label: "DevOps & Cloud" },
  { id: "databases", label: "Databases & Backend" },

  // IT & Cybersecurity
  { id: "it-systems", label: "IT Support & Systems" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "networking", label: "Networking & Infrastructure" },
  { id: "hardware", label: "Computer Hardware" },

  // Engineering & Technology
  { id: "embedded-systems", label: "Embedded Systems" },
  { id: "robotics", label: "Robotics & Automation" },
  { id: "electronics", label: "Electronics & Engineering" },

  // Content Creation & Marketing
  { id: "social-media", label: "Social Media Content" },
  { id: "streaming", label: "Streaming & Creator Assets" },
  { id: "marketing", label: "Marketing & Promotional" },

  // General Storage
  { id: "library", label: "General Uploads" },
];

const DESTINATIONS = FOLDERS.filter(
  (folder) => folder.id !== "all"
);

const ext = (name) =>
  name.split(".").pop()?.toLowerCase() || "";

const imageFile = (name) =>
  ["png", "jpg", "jpeg", "webp"].includes(ext(name));

const sizeText = (bytes = 0) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;

const dateText = (date) =>
  date ? new Date(date).toLocaleDateString() : "Unknown";

const urlFor = (path) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

const pathFolder = (path) =>
  path.includes("/") ? path.split("/")[0] : "root";

const folderName = (id) =>
  FOLDERS.find((folder) => folder.id === id)?.label ||
  (id === "root" ? "Root" : id);

const sameUrl = (a, b) =>
  !!a && !!b && a.split("?")[0] === b.split("?")[0];

async function listAll(folder = "") {
  const result = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) throw error;

    const entries = data || [];

    for (const item of entries) {
      const path = folder
        ? `${folder}/${item.name}`
        : item.name;

      if (item.id == null) {
        result.push(...await listAll(path));
      } else if (imageFile(item.name)) {
        result.push({
          name: item.name,
          path,
          url: urlFor(path),
          size: item.metadata?.size || 0,
          created_at: item.created_at,
          extension: ext(item.name),
          folder: pathFolder(path),
        });
      }
    }

    if (entries.length < limit) break;
    offset += limit;
  }

  return result;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [aboutUrl, setAboutUrl] = useState("");

  const [folder, setFolder] = useState("all");
  const [destination, setDestination] = useState("library");
  const [moveDestination, setMoveDestination] = useState("library");

  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("all");
  const [sort, setSort] = useState("newest");

  const [selectedPaths, setSelectedPaths] = useState([]);
  const [inspected, setInspected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [assets, projectResult, settingsResult] =
        await Promise.all([
          listAll(),
          supabase
            .from("portfolio_projects")
            .select("id,title,cover_image_url"),
          supabase
            .from("portfolio_site_settings")
            .select("value")
            .eq("key", "about_photo_url")
            .maybeSingle(),
        ]);

      if (projectResult.error) throw projectResult.error;
      if (settingsResult.error) throw settingsResult.error;

      setFiles(assets);
      setProjects(projectResult.data || []);
      setAboutUrl(settingsResult.data?.value || "");

      setSelectedPaths((old) =>
        old.filter((path) =>
          assets.some((item) => item.path === path)
        )
      );

      setInspected((old) =>
        old
          ? assets.find((item) => item.path === old.path) || null
          : null
      );
    } catch (err) {
      setError(
        err.message || "Unable to load the media library."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const usage = (
    file,
    currentProjects = projects,
    currentAboutUrl = aboutUrl
  ) => {
    const used = currentProjects
      .filter((project) =>
        sameUrl(project.cover_image_url, file.url)
      )
      .map((project) => `Project: ${project.title}`);

    if (sameUrl(currentAboutUrl, file.url)) {
      used.push("Published About Me photo");
    }

    return used;
  };

  async function getFreshUsage() {
    const [p, s] = await Promise.all([
      supabase
        .from("portfolio_projects")
        .select("id,title,cover_image_url"),
      supabase
        .from("portfolio_site_settings")
        .select("value")
        .eq("key", "about_photo_url")
        .maybeSingle(),
    ]);

    if (p.error) throw p.error;
    if (s.error) throw s.error;

    setProjects(p.data || []);
    setAboutUrl(s.data?.value || "");

    return {
      currentProjects: p.data || [],
      currentAboutUrl: s.data?.value || "",
    };
  }

  async function uploadFiles(fileList) {
    const incoming = Array.from(fileList || []);
    if (!incoming.length || busy) return;

    const bad = incoming.find(
      (file) =>
        !TYPES.includes(file.type) || file.size > MAX_SIZE
    );

    if (bad) {
      setError(
        `Unsupported or oversized file: ${bad.name}. Use PNG, JPG, or WEBP up to 20 MB.`
      );
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    let count = 0;
    const failures = [];

    try {
      for (const file of incoming) {
        const safeName =
          file.name
            .replace(/\.[^.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 45) || "asset";

        const suffix =
          file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
              ? "webp"
              : "jpg";

        const path =
          `${destination}/${crypto.randomUUID()}-${safeName}.${suffix}`;

        const { error: uploadError } =
          await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) {
          failures.push(
            `${file.name}: ${uploadError.message}`
          );
        } else {
          count++;
        }
      }

      await refresh();

      if (count) {
        setMessage(
          `${count} image${count === 1 ? "" : "s"} uploaded to ${folderName(destination)} ♡`
        );
      }

      if (failures.length) {
        setError(failures.join(" | "));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function copyText(value, success) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(success);
      setError("");
    } catch {
      setError(
        "Clipboard access failed. Try copying from an opened image URL."
      );
    }
  }

  async function performBulk(action, items) {
    if (!items.length || busy) return;

    setError("");
    setMessage("");

    if (action === "copy") {
      await copyText(
        items.map((item) => item.url).join("\n"),
        `${items.length} URL${items.length === 1 ? "" : "s"} copied ♡`
      );
      return;
    }

    if (
      action === "move" &&
      items.some((item) => item.folder === moveDestination)
    ) {
      setError(
        "Select images from a different folder before moving them."
      );
      return;
    }

    if (
      action === "delete" &&
      !window.confirm(
        `Permanently delete ${items.length} image(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    if (
      action === "move" &&
      !window.confirm(
        `Move ${items.length} image(s) to ${folderName(moveDestination)}? Their URLs will change.`
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const fresh = await getFreshUsage();

      const blocked = items.filter(
        (item) =>
          usage(
            item,
            fresh.currentProjects,
            fresh.currentAboutUrl
          ).length
      );

      if (blocked.length) {
        throw new Error(
          `Action cancelled. Protected image(s): ${blocked
            .map((item) => item.name)
            .join(", ")}. Change their website assignments first.`
        );
      }

      let completed = 0;
      const failures = [];

      for (const item of items) {
        try {
          if (action === "delete") {
            const { data, error: removeError } =
              await supabase.storage
                .from(BUCKET)
                .remove([item.path]);

            if (removeError) throw removeError;

            if (!data?.length) {
              throw new Error("Deletion not confirmed");
            }
          } else {
            const newPath =
              `${moveDestination}/${item.name}`;

            const { error: moveError } =
              await supabase.storage
                .from(BUCKET)
                .move(item.path, newPath);

            if (moveError) throw moveError;
          }

          completed++;
        } catch (err) {
          failures.push(
            `${item.name}: ${err.message}`
          );
        }
      }

      setSelectedPaths([]);
      setInspected(null);

      await refresh();

      if (completed) {
        setMessage(
          `${completed} image${completed === 1 ? "" : "s"} ${
            action === "delete" ? "deleted" : "moved"
          } ♡`
        );
      }

      if (failures.length) {
        setError(failures.join(" | "));
      }
    } catch (err) {
      setError(err.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  const visible = files
    .filter((file) => {
      const matchesFolder =
        folder === "all" || file.folder === folder;

      const matchesFormat =
        format === "all" ||
        (format === "jpg"
          ? ["jpg", "jpeg"].includes(file.extension)
          : file.extension === format);

      const needle = search.trim().toLowerCase();

      return (
        matchesFolder &&
        matchesFormat &&
        (!needle ||
          `${file.name} ${file.path}`
            .toLowerCase()
            .includes(needle))
      );
    })
    .sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      if (sort === "largest") return b.size - a.size;
      if (sort === "smallest") return a.size - b.size;

      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    });

  const selectedFiles = files.filter((file) =>
    selectedPaths.includes(file.path)
  );

  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((file) =>
      selectedPaths.includes(file.path)
    );

  const totalBytes = files.reduce(
    (sum, file) => sum + file.size,
    0
  );

  const toggle = (path) =>
    setSelectedPaths((old) =>
      old.includes(path)
        ? old.filter((p) => p !== path)
        : [...old, path]
    );

  return (
    <div className="ml-layout">
      <section className="ml-panel ml-intro">
        <div className="ml-heading">
          <div>
            <span className="ml-eyebrow">
              ♡ CREATIVE CONTROL CENTER
            </span>
            <h2>Asset Manager</h2>
            <p>
              Upload, organize, inspect, and reuse
              your creative files.
            </p>
          </div>

          <button
            className="ml-btn"
            type="button"
            onClick={refresh}
            disabled={loading || busy}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="ml-stats">
          <div className="ml-stat">
            <Images size={20} />
            <span>Images</span>
            <strong>{files.length}</strong>
          </div>

          <div className="ml-stat">
            <ImageIcon size={20} />
            <span>Total storage</span>
            <strong>{sizeText(totalBytes)}</strong>
          </div>

          <div className="ml-stat">
            <ShieldAlert size={20} />
            <span>Protected</span>
            <strong>
              {files.filter((file) => usage(file).length).length}
            </strong>
          </div>
        </div>

        <div className="ml-upload-row">
          <label className="ml-field">
            Upload destination
            <select
              value={destination}
              onChange={(e) =>
                setDestination(e.target.value)
              }
              disabled={busy}
            >
              {DESTINATIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            hidden
            onChange={(e) =>
              uploadFiles(e.target.files)
            }
          />

          <button
            className="ml-btn ml-primary"
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud size={17} />
            {busy ? "Working..." : "Choose Images"}
          </button>
        </div>

        <div
          className={`ml-dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(e.dataTransfer.files);
          }}
        >
          <UploadCloud size={30} />
          <strong>Drop images here ♡</strong>
          <span>
            PNG, JPG, WEBP · 20 MB each · Uploads to{" "}
            {folderName(destination)}
          </span>
        </div>

        {error && (
          <p className="ml-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="ml-success" role="status">
            {message}
          </p>
        )}
      </section>

      <div className="ml-workspace">
        <aside className="ml-panel ml-folders">
          <span className="ml-eyebrow">
            ♡ COLLECTIONS
          </span>

          {FOLDERS.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`ml-folder ${
                folder === f.id ? "active" : ""
              }`}
              onClick={() => {
                setFolder(f.id);
                setSelectedPaths([]);
              }}
            >
              {folder === f.id ? (
                <FolderOpen size={17} />
              ) : (
                <Folder size={17} />
              )}
              <span>{f.label}</span>
              <small>
                {f.id === "all"
                  ? files.length
                  : files.filter(
                      (item) => item.folder === f.id
                    ).length}
              </small>
            </button>
          ))}

          {files.some((file) => file.folder === "root") && (
            <button
              className={`ml-folder ${
                folder === "root" ? "active" : ""
              }`}
              type="button"
              onClick={() => {
                setFolder("root");
                setSelectedPaths([]);
              }}
            >
              <Folder size={17} />
              Root
              <small>
                {
                  files.filter(
                    (file) => file.folder === "root"
                  ).length
                }
              </small>
            </button>
          )}
        </aside>

        <section className="ml-panel ml-gallery">
          <div className="ml-heading">
            <div>
              <span className="ml-eyebrow">
                ♡ ASSET COLLECTION
              </span>
              <h2>{folderName(folder)}</h2>
            </div>
            <span className="ml-count">
              {visible.length} shown
            </span>
          </div>

          <div className="ml-toolbar">
            <label className="ml-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search names or paths..."
              />
            </label>

            <select
              aria-label="File format"
              value={format}
              onChange={(e) =>
                setFormat(e.target.value)
              }
            >
              <option value="all">All formats</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG / JPEG</option>
              <option value="webp">WEBP</option>
            </select>

            <label className="ml-sort">
              <ArrowUpDown size={15} />
              <select
                aria-label="Sort assets"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="largest">Largest first</option>
                <option value="smallest">Smallest first</option>
              </select>
            </label>
          </div>

          <div className="ml-bulk-bar">
            <button
              type="button"
              className="ml-btn"
              disabled={!visible.length || busy}
              onClick={() =>
                setSelectedPaths(
                  allVisibleSelected
                    ? []
                    : visible.map((file) => file.path)
                )
              }
            >
              {allVisibleSelected ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {allVisibleSelected
                ? "Deselect visible"
                : "Select visible"}
            </button>

            <span>{selectedPaths.length} selected</span>

            <button
              type="button"
              className="ml-btn"
              disabled={!selectedFiles.length || busy}
              onClick={() =>
                performBulk("copy", selectedFiles)
              }
            >
              <Copy size={15} />
              Copy URLs
            </button>

            <select
              aria-label="Move selected to"
              value={moveDestination}
              onChange={(e) =>
                setMoveDestination(e.target.value)
              }
              disabled={busy}
            >
              {DESTINATIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="ml-btn"
              disabled={!selectedFiles.length || busy}
              onClick={() =>
                performBulk("move", selectedFiles)
              }
            >
              <MoveRight size={15} />
              Move
            </button>

            <button
              type="button"
              className="ml-btn ml-danger"
              disabled={!selectedFiles.length || busy}
              onClick={() =>
                performBulk("delete", selectedFiles)
              }
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>

          {loading ? (
            <p className="ml-empty">
              Loading your assets... ♡
            </p>
          ) : visible.length === 0 ? (
            <div className="ml-empty">
              <Images size={32} />
              <p>No images in this view yet.</p>
            </div>
          ) : (
            <div className="ml-grid">
              {visible.map((file) => {
                const chosen =
                  selectedPaths.includes(file.path);

                const protectedBy = usage(file);

                return (
                  <article
                    className={`ml-asset ${
                      chosen ? "selected" : ""
                    }`}
                    key={file.path}
                  >
                    <button
                      type="button"
                      className="ml-select"
                      aria-label={`Select ${file.name}`}
                      aria-pressed={chosen}
                      onClick={() => toggle(file.path)}
                    >
                      {chosen ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>

                    {protectedBy.length > 0 && (
                      <span
                        className="ml-protected"
                        title={protectedBy.join(", ")}
                      >
                        <ShieldAlert size={15} />
                      </span>
                    )}

                    <button
                      type="button"
                      className="ml-preview-button"
                      onClick={() => setInspected(file)}
                      aria-label={`Inspect ${file.name}`}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                      />
                    </button>

                    <div className="ml-asset-info">
                      <strong title={file.name}>
                        {file.name}
                      </strong>
                      <span>
                        {file.extension.toUpperCase()} ·{" "}
                        {sizeText(file.size)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {inspected && (
        <div
          className="ml-modal-backdrop"
          onClick={() => setInspected(null)}
        >
          <section
            className="ml-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Image inspector"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ml-modal-header">
              <strong>♡ asset.inspector</strong>
              <button
                type="button"
                aria-label="Close inspector"
                onClick={() => setInspected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ml-modal-content">
              <div className="ml-modal-preview">
                <img
                  src={inspected.url}
                  alt={inspected.name}
                />
              </div>

              <h3>{inspected.name}</h3>

              <div className="ml-details">
                <div>
                  <span>Folder</span>
                  <strong>
                    {folderName(inspected.folder)}
                  </strong>
                </div>

                <div>
                  <span>Format</span>
                  <strong>
                    {inspected.extension.toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>Size</span>
                  <strong>
                    {sizeText(inspected.size)}
                  </strong>
                </div>

                <div>
                  <span>Uploaded</span>
                  <strong>
                    {dateText(inspected.created_at)}
                  </strong>
                </div>

                <div>
                  <span>Storage path</span>
                  <strong>{inspected.path}</strong>
                </div>
              </div>

              {usage(inspected).length > 0 && (
                <p className="ml-usage-warning">
                  <ShieldAlert size={18} />
                  Protected:{" "}
                  {usage(inspected).join(", ")}
                </p>
              )}

              <div className="ml-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      inspected.url,
                      "Image URL copied ♡"
                    )
                  }
                >
                  <Copy size={16} />
                  Copy URL
                </button>

                <a
                  href={inspected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  Open
                </a>

                <button
                  type="button"
                  className="ml-delete"
                  disabled={
                    busy ||
                    usage(inspected).length > 0
                  }
                  onClick={() =>
                    performBulk("delete", [inspected])
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>

              <p className="ml-hint">
                <Info size={15} />
                To move an image, select it in the
                gallery and use the bulk toolbar.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
