
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Code2,
  Folder,
  Gamepad2,
  LayoutDashboard,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Archive,
  Image,
  Film,
  Cpu,
  Layers,
  BrainCircuit,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import "./category-manager.css";

const ICONS = {
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

const COLORS = [
  "#FF4EAB",
  "#B18AFF",
  "#68D2FF",
  "#FFADD9",
  "#FFB86C",
  "#62D6A8",
  "#FF6B85",
  "#E5D477",
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  color: "#FF4EAB",
  icon: "folder",
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCategories() {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("portfolio_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setCategories(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateName(value) {
    setForm((previous) => ({
      ...previous,
      name: value,
      slug:
        !editingId &&
        previous.slug === makeSlug(previous.name)
          ? makeSlug(value)
          : previous.slug,
    }));
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  }

  function editCategory(category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      color: category.color,
      icon: category.icon,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveCategory(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: makeSlug(form.slug),
        description: form.description.trim(),
        color: form.color.toUpperCase(),
        icon: form.icon,
        updated_at: new Date().toISOString(),
      };

      if (!payload.name || !payload.slug) {
        throw new Error(
          "Category name and slug are required."
        );
      }

      if (!/^#[0-9A-F]{6}$/.test(payload.color)) {
        throw new Error(
          "Enter a valid 6-digit HEX color."
        );
      }

      if (!Object.hasOwn(ICONS, payload.icon)) {
        throw new Error(
          "Choose a valid category icon."
        );
      }

      const result = editingId
        ? await supabase
            .from("portfolio_categories")
            .update(payload)
            .eq("id", editingId)
            .select("id")
        : await supabase
            .from("portfolio_categories")
            .insert({
              ...payload,
              sort_order:
                Math.max(
                  0,
                  ...categories.map(
                    (category) =>
                      category.sort_order ?? 0
                  )
                ) + 1,
            })
            .select("id");

      if (result.error) {
        throw result.error;
      }

      if (!result.data?.length) {
        throw new Error(
          "Category was not saved. Check admin permissions."
        );
      }

      resetForm();

      setMessage(
        "Category saved successfully! ♡"
      );

      await loadCategories();
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(category) {
    const action = category.archived
      ? "restore"
      : "archive";

    if (
      !category.archived &&
      !window.confirm(
        `Archive "${category.name}"? Its projects will remain saved.`
      )
    ) {
      return;
    }

    setBusyId(category.id);
    setError("");
    setMessage("");

    try {
      const { data, error: updateError } =
        await supabase
          .from("portfolio_categories")
          .update({
            archived: !category.archived,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", category.id)
          .select("id");

      if (updateError) {
        throw updateError;
      }

      if (!data?.length) {
        throw new Error(
          "Category could not be updated."
        );
      }

      setMessage(
        `Category ${
          action === "archive"
            ? "archived"
            : "restored"
        }! ♡`
      );

      await loadCategories();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function moveCategory(category, direction) {
    const active = categories.filter(
      (item) => !item.archived
    );

    const index = active.findIndex(
      (item) => item.id === category.id
    );

    const other = active[index + direction];

    if (!other) return;

    setBusyId(category.id);
    setError("");
    setMessage("");

    const reordered = [...active];

    [
      reordered[index],
      reordered[index + direction],
    ] = [
      reordered[index + direction],
      reordered[index],
    ];

    try {
      for (
        let i = 0;
        i < reordered.length;
        i++
      ) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("portfolio_categories")
          .update({
            sort_order: i + 1,
          })
          .eq("id", reordered[i].id)
          .select("id");

        if (updateError) {
          throw updateError;
        }

        if (!data?.length) {
          throw new Error(
            "Could not reorder categories."
          );
        }
      }

      setMessage(
        "Category order updated! ♡"
      );
    } catch (moveError) {
      setError(
        `${moveError.message} Refreshing category order from Supabase.`
      );
    } finally {
      await loadCategories();
      setBusyId(null);
    }
  }

  const activeCategories =
    categories.filter(
      (category) => !category.archived
    );

  const archivedCategories =
    categories.filter(
      (category) => category.archived
    );

  function renderCategory(
    category,
    index,
    isArchived = false
  ) {
    const Icon =
      ICONS[category.icon] || Folder;

    return (
      <article
        className="cm-category"
        key={category.id}
      >
        <div
          className="cm-category-icon"
          style={{
            "--category-color":
              category.color,
          }}
        >
          <Icon size={24} />
        </div>

        <div className="cm-category-info">
          <strong>{category.name}</strong>

          <span>
            {category.description ||
              "No description yet"}
          </span>

          <small>
            {category.color} · {category.slug}
          </small>
        </div>

        <div className="cm-actions">
          {!isArchived && (
            <>
              <button
                type="button"
                title="Move up"
                aria-label={`Move ${category.name} up`}
                disabled={
                  busyId !== null ||
                  index === 0
                }
                onClick={() =>
                  moveCategory(category, -1)
                }
              >
                <ArrowUp size={16} />
              </button>

              <button
                type="button"
                title="Move down"
                aria-label={`Move ${category.name} down`}
                disabled={
                  busyId !== null ||
                  index === activeCategories.length - 1
                }
                onClick={() =>
                  moveCategory(category, 1)
                }
              >
                <ArrowDown size={16} />
              </button>
            </>
          )}

          <button
            type="button"
            disabled={busyId !== null}
            onClick={() =>
              editCategory(category)
            }
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            disabled={busyId !== null}
            onClick={() =>
              toggleArchive(category)
            }
          >
            {isArchived ? (
              <RotateCcw size={15} />
            ) : (
              <Archive size={15} />
            )}

            {isArchived
              ? "Restore"
              : "Archive"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="cm-layout">
      {/* CATEGORY EDITOR */}
      <section className="cm-panel">
        <div className="cm-heading">
          <div>
            <span>
              ♡ CATEGORY EDITOR
            </span>

            <h2>
              {editingId
                ? "Edit Category"
                : "New Category"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              <X size={15} />
              Cancel
            </button>
          )}
        </div>

        <form
          className="cm-form"
          onSubmit={saveCategory}
        >
          <label>
            Category Name
            <input
              value={form.name}
              onChange={(event) =>
                updateName(
                  event.target.value
                )
              }
              placeholder="e.g. AI & Intelligent Systems"
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
                  makeSlug(
                    event.target.value
                  )
                )
              }
              placeholder="e.g. ai-intelligent-systems"
              required
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="What kind of work belongs here?"
            />
          </label>

          {/* COLOR PICKER */}
          <div className="cm-field">
            <strong>
              Category Color
            </strong>

            <div className="cm-swatches">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    form.color.toUpperCase() ===
                    color
                      ? "cm-swatch selected"
                      : "cm-swatch"
                  }
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={() =>
                    updateField(
                      "color",
                      color
                    )
                  }
                  aria-label={`Choose ${color}`}
                  title={color}
                >
                  {form.color.toUpperCase() ===
                    color && (
                    <Check
                      size={17}
                      color="#171017"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="cm-color-controls">
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(
                    form.color
                  )
                    ? form.color
                    : "#FF4EAB"
                }
                onChange={(event) =>
                  updateField(
                    "color",
                    event.target.value.toUpperCase()
                  )
                }
                aria-label="Custom color picker"
              />

              <input
                value={form.color}
                onChange={(event) =>
                  updateField(
                    "color",
                    event.target.value
                  )
                }
                placeholder="#FF4EAB"
                maxLength={7}
                aria-label="HEX color"
              />
            </div>
          </div>

          {/* ICON PICKER */}
          <div className="cm-field">
            <strong>
              Category Icon
            </strong>

            <div className="cm-icon-grid">
              {Object.entries(ICONS).map(
                ([name, Icon]) => (
                  <button
                    key={name}
                    type="button"
                    className={
                      form.icon === name
                        ? "cm-icon-choice selected"
                        : "cm-icon-choice"
                    }
                    onClick={() =>
                      updateField(
                        "icon",
                        name
                      )
                    }
                    aria-label={`Select ${name} icon`}
                    title={name}
                  >
                    <Icon size={22} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            className="cm-save"
            type="submit"
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                {editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {editingId
                  ? "Save Changes ♡"
                  : "Create Category ♡"}
              </>
            )}
          </button>
        </form>
      </section>

      {/* CATEGORY DATABASE */}
      <section className="cm-panel">
        <div className="cm-heading">
          <div>
            <span>
              ♡ PORTFOLIO ORGANIZATION
            </span>

            <h2>
              Categories (
              {activeCategories.length})
            </h2>
          </div>
        </div>

        {error && (
          <p
            className="cm-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p className="cm-success">
            {message}
          </p>
        )}

        {loading ? (
          <p>
            Loading categories...
          </p>
        ) : (
          <>
            <div className="cm-category-list">
              {activeCategories.length ? (
                activeCategories.map(
                  (category, index) =>
                    renderCategory(
                      category,
                      index
                    )
                )
              ) : (
                <p>
                  No active categories yet.
                </p>
              )}
            </div>

            {archivedCategories.length >
              0 && (
              <>
                <h3 className="cm-subheading">
                  Archived (
                  {archivedCategories.length})
                </h3>

                <div className="cm-category-list">
                  {archivedCategories.map(
                    (category, index) =>
                      renderCategory(
                        category,
                        index,
                        true
                      )
                  )}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
