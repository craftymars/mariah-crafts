
import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  X,
  BrainCircuit,
  Folder,
  LayoutDashboard,
  Gamepad2,
  Code2,
  Palette,
  Sparkles,
  Image,
  Film,
  Cpu,
  Layers,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import "./project-manager.css";

const BUCKET = "portfolio-images";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

const CATEGORY_ICONS = {
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

const emptyProject = {
  title: "",
  slug: "",
  description: "",
  category: "",
  cover_image_url: "",
  project_url: "",
  featured: false,
  published: false,
};

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    ...emptyProject,
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const fileInputRef = useRef(null);

  // IMAGE PREVIEW
  useEffect(() => {
    if (!selectedFile) {
      setPreview(form.cover_image_url || "");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, form.cover_image_url]);

  // LOAD PROJECTS
  async function loadProjects() {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setProjects(data ?? []);
    }

    setLoading(false);
  }

  // LOAD CATEGORIES FROM CMS
  async function loadCategories() {
    setCategoriesLoading(true);
    setCategoryError("");

    const { data, error: loadError } = await supabase
      .from("portfolio_categories")
      .select(
        "id, name, slug, description, color, icon, archived, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      setCategoryError(loadError.message);
    } else {
      setCategories(data ?? []);
    }

    setCategoriesLoading(false);
  }

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, []);

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function chooseFile(file) {
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Please select a PNG, JPG, or WEBP image."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Your image must be 20 MB or smaller."
      );
      return;
    }

    setSelectedFile(file);
  }

  function resetForm() {
    setForm({ ...emptyProject });
    setEditingId(null);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function editProject(project) {
    setEditingId(project.id);

    setForm({
      title: project.title ?? "",
      slug: project.slug ?? "",
      description: project.description ?? "",
      category: project.category ?? "",
      cover_image_url: project.cover_image_url ?? "",
      project_url: project.project_url ?? "",
      featured: project.featured ?? false,
      published: project.published ?? false,
    });

    setSelectedFile(null);
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // UPLOAD IMAGE TO SUPABASE STORAGE
  async function uploadImage(file) {
    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const filePath =
      `covers/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
    };
  }

  // SAVE PROJECT
  async function saveProject(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    let uploadedPath = null;

    try {
      const selectedCategory = categories.find(
        (category) =>
          category.name === form.category
      );

      const isExistingLegacyCategory =
        Boolean(editingId) &&
        form.category ===
          projects.find(
            (project) => project.id === editingId
          )?.category;

      if (
        !selectedCategory &&
        !isExistingLegacyCategory
      ) {
        throw new Error(
          "Please select a valid category."
        );
      }

      if (
        selectedCategory?.archived &&
        !isExistingLegacyCategory
      ) {
        throw new Error(
          "Archived categories cannot be assigned to new projects."
        );
      }

      let coverUrl = form.cover_image_url || null;

      if (selectedFile) {
        const uploaded = await uploadImage(
          selectedFile
        );

        coverUrl = uploaded.url;
        uploadedPath = uploaded.path;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        category: form.category,
        cover_image_url: coverUrl,
        project_url:
          form.project_url.trim() || null,
        featured: form.featured,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      if (!payload.title || !payload.slug) {
        throw new Error(
          "Project title and slug are required."
        );
      }

      const { data, error: saveError } = editingId
        ? await supabase
            .from("portfolio_projects")
            .update(payload)
            .eq("id", editingId)
            .select("id")
        : await supabase
            .from("portfolio_projects")
            .insert(payload)
            .select("id");

      if (saveError) {
        throw saveError;
      }

      if (!data?.length) {
        throw new Error(
          "Project was not saved. Check your database permissions."
        );
      }

      resetForm();

      setMessage(
        "Project saved successfully! ♡"
      );

      await loadProjects();
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save project."
      );

      if (uploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
      }
    } finally {
      setSaving(false);
    }
  }

  // DELETE PROJECT
  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Permanently delete "${project.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(project.id);

    try {
      const { data, error: deleteError } =
        await supabase
          .from("portfolio_projects")
          .delete()
          .eq("id", project.id)
          .select("id");

      if (deleteError) {
        throw deleteError;
      }

      if (!data?.length) {
        throw new Error(
          "Project could not be deleted. Check your permissions."
        );
      }

      if (editingId === project.id) {
        resetForm();
      }

      setMessage("Project deleted. ♡");

      await loadProjects();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  }

  const activeCategories = categories.filter(
    (category) => !category.archived
  );

  const selectedCategory = categories.find(
    (category) =>
      category.name === form.category
  );

  const isLegacyCategory =
    Boolean(form.category) &&
    !categories.some(
      (category) =>
        category.name === form.category
    );

  const SelectedIcon =
    CATEGORY_ICONS[selectedCategory?.icon] ||
    Folder;

  return (
    <div className="pm-layout">
      {/* PROJECT EDITOR */}
      <section className="pm-panel">
        <div className="pm-heading">
          <div>
            <span>♡ PROJECT EDITOR</span>

            <h2>
              {editingId
                ? "Edit Project"
                : "Add New Project"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="pm-form"
          onSubmit={saveProject}
        >
          <label>
            Project Title

            <input
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="e.g. Clairose"
              required
            />
          </label>

          <label>
            URL Slug

            <input
              value={form.slug}
              onChange={(event) =>
                updateField(
                  "slug",
                  event.target.value
                )
              }
              placeholder="e.g. clairose"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              title="Use lowercase letters, numbers, and hyphens."
              required
            />
          </label>

          <label>
            Description

            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe your project..."
            />
          </label>

          {/* SUPABASE CATEGORY DROPDOWN */}
          <label>
            Category

            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              disabled={categoriesLoading}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#17131d",
                color: "#fff",
                border: "1px solid #59435c",
                font: "inherit",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select a category ♡"}
              </option>

              {activeCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                )
              )}

              {editingId &&
                selectedCategory?.archived && (
                  <option
                    value={selectedCategory.name}
                  >
                    {selectedCategory.name}
                    {" (Archived)"}
                  </option>
                )}

              {editingId &&
                isLegacyCategory && (
                  <option value={form.category}>
                    {form.category}
                    {" (Existing / Legacy)"}
                  </option>
                )}
            </select>
          </label>

          {categoryError && (
            <p
              className="pm-error"
              role="alert"
            >
              Could not load categories:
              {" "}
              {categoryError}
            </p>
          )}

          {selectedCategory && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                border: `1px solid ${selectedCategory.color}`,
                borderRadius: "10px",
                background: "#17131d",
              }}
            >
              <SelectedIcon
                size={25}
                color={selectedCategory.color}
              />

              <div>
                <strong
                  style={{
                    color: selectedCategory.color,
                  }}
                >
                  {selectedCategory.name}
                </strong>

                {selectedCategory.description && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      opacity: 0.8,
                    }}
                  >
                    {selectedCategory.description}
                  </p>
                )}

                {selectedCategory.archived && (
                  <small>
                    Archived category
                  </small>
                )}
              </div>
            </div>
          )}

          {/* COVER IMAGE UPLOADER */}
          <div className="pm-upload-field">
            <span className="pm-upload-label">
              Cover Image
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="pm-file-input"
              id="pm-cover-image"
              onChange={(event) =>
                chooseFile(
                  event.target.files?.[0]
                )
              }
            />

            <div
              className={`pm-dropzone ${
                dragging ? "dragging" : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={() =>
                fileInputRef.current?.click()
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);

                chooseFile(
                  event.dataTransfer.files?.[0]
                );
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Selected project cover"
                  className="pm-image-preview"
                />
              ) : (
                <>
                  <UploadCloud size={35} />

                  <strong>
                    Drop your image here ♡
                  </strong>

                  <span>
                    or click to browse your files
                  </span>

                  <small>
                    PNG, JPG, WEBP · Maximum 20 MB
                  </small>
                </>
              )}
            </div>

            {preview && (
              <div className="pm-image-actions">
                <span>
                  {selectedFile
                    ? selectedFile.name
                    : "Current cover image"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);

                    updateField(
                      "cover_image_url",
                      ""
                    );

                    if (fileInputRef.current) {
                      fileInputRef.current.value =
                        "";
                    }
                  }}
                >
                  <X size={15} />
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* PROJECT LINK */}
          <label>
            Project URL

            <input
              type="url"
              value={form.project_url}
              onChange={(event) =>
                updateField(
                  "project_url",
                  event.target.value
                )
              }
              placeholder="https://..."
            />
          </label>

          {/* PUBLISHING OPTIONS */}
          <div className="pm-options">
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
              />
              Featured Project
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  updateField(
                    "published",
                    event.target.checked
                  )
                }
              />
              Published
            </label>
          </div>

          <button
            className="pm-save"
            type="submit"
            disabled={
              saving ||
              categoriesLoading ||
              Boolean(categoryError)
            }
          >
            {saving
              ? "Uploading & Saving..."
              : editingId
                ? "Save Changes ♡"
                : "Create Project ♡"}
          </button>
        </form>
      </section>

      {/* PROJECT DATABASE */}
      <section className="pm-panel">
        <div className="pm-heading">
          <div>
            <span>
              ♡ PORTFOLIO DATABASE
            </span>

            <h2>
              All Projects ({projects.length})
            </h2>
          </div>
        </div>

        {error && (
          <p
            className="pm-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="pm-success">
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>
            No projects yet. Create your
            first one!
          </p>
        ) : (
          <div className="pm-project-list">
            {projects.map((project) => (
              <article
                className="pm-project"
                key={project.id}
              >
                {project.cover_image_url && (
                  <img
                    src={project.cover_image_url}
                    alt=""
                    className="pm-list-cover"
                  />
                )}

                <div>
                  <h3>{project.title}</h3>

                  <p>{project.category}</p>

                  <span>
                    {project.published
                      ? "Published"
                      : "Draft"}

                    {project.featured
                      ? " · Featured"
                      : ""}
                  </span>
                </div>

                <div className="pm-actions">
                  <button
                    type="button"
                    onClick={() =>
                      editProject(project)
                    }
                    disabled={
                      deletingId !== null
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="pm-delete"
                    onClick={() =>
                      deleteProject(project)
                    }
                    disabled={
                      deletingId !== null
                    }
                  >
                    {deletingId === project.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
