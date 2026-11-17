
import { useCallback, useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Save, X, Eye, EyeOff,
  ArrowUp, ArrowDown, RefreshCw, Layers,
  Package, Check, AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const ICON_OPTIONS = [
  ["palette", "Palette / Branding"],
  ["panels-top-left", "UI/UX"],
  ["code-2", "Web Development"],
  ["gamepad-2", "Game Development"],
  ["clapperboard", "Motion / Video"],
  ["sparkles", "Creative Technology"],
  ["brain-circuit", "AI Solutions"],
  ["monitor-cog", "IT Support"],
  ["workflow", "Automation / DevOps"],
  ["package", "Custom Bundle"],
  ["camera", "Photography"],
  ["film", "Video Production"],
  ["shield-check", "Cybersecurity"],
  ["cloud", "Cloud"],
  ["cpu", "Hardware / Engineering"],
  ["pen-tool", "Illustration"],
  ["smartphone", "Mobile Apps"],
  ["globe", "Web Design"],
  ["database", "Databases"],
  ["bot", "AI Assistants"],
];

const EMPTY = {
  title: "",
  description: "",
  icon: "sparkles",
  details: [""],
  published: true,
};

const styles = {
  panel: {
    background: "#211825",
    border: "1px solid #633e5c",
    borderRadius: 15,
    padding: 20,
    color: "#fcebf6",
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    background: "#332337",
    color: "#fff",
    border: "1px solid #78516e",
    borderRadius: 9,
    boxSizing: "border-box",
    font: "inherit",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "10px 13px",
    background: "#38263c",
    color: "#fff",
    border: "1px solid #78516e",
    borderRadius: 9,
    cursor: "pointer",
    font: "inherit",
  },
  pink: {
    background: "#ff4eab",
    color: "#21101d",
    border: "1px solid #ff4eab",
    fontWeight: 800,
  },
  label: {
    display: "grid",
    gap: 7,
    fontSize: 13,
    color: "#eac7dd",
  },
};

function newId() {
  return crypto.randomUUID();
}

function cleanDetails(details) {
  return details.map((item) => item.trim()).filter(Boolean);
}

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("portfolio_services")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setServices(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    setEditing("new");
    setForm({ ...EMPTY, details: [""] });
    setError("");
    setMessage("");
  }

  function startEdit(service) {
    setEditing(service.id);
    setForm({
      title: service.title,
      description: service.description || "",
      icon: service.icon || "sparkles",
      details: Array.isArray(service.details)
        ? [...service.details]
        : [""],
      published: service.published,
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY);
  }

  function updateDetail(index, value) {
    setForm((old) => ({
      ...old,
      details: old.details.map((item, i) =>
        i === index ? value : item
      ),
    }));
  }

  async function saveService(event) {
    event.preventDefault();
    if (busy) return;

    const title = form.title.trim();
    const description = form.description.trim();
    const details = cleanDetails(form.details);

    if (!title || !description || !details.length) {
      setError(
        "Add a title, description, and at least one service offering."
      );
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const isNew = editing === "new";

    const payload = {
      title,
      description,
      icon: form.icon,
      details,
      published: form.published,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      payload.id = newId();
      payload.sort_order =
        Math.max(0, ...services.map((s) => s.sort_order || 0)) + 1;
    }

    const query = isNew
      ? supabase.from("portfolio_services").insert(payload)
      : supabase
          .from("portfolio_services")
          .update(payload)
          .eq("id", editing);

    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
    } else {
      cancelEdit();
      await load();
      setMessage(
        isNew ? "Service created! ♡" : "Service updated! ♡"
      );
    }

    setBusy(false);
  }

  async function togglePublished(service) {
    if (busy) return;
    setBusy(true);
    setError("");

    const { error: updateError } = await supabase
      .from("portfolio_services")
      .update({
        published: !service.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (updateError) setError(updateError.message);
    else {
      await load();
      setMessage(
        service.published
          ? "Service unpublished ♡"
          : "Service published ♡"
      );
    }

    setBusy(false);
  }

  async function deleteService(service) {
    if (busy) return;

    if (
      !window.confirm(
        `Permanently delete "${service.title}"? This cannot be undone.`
      )
    ) return;

    setBusy(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("portfolio_services")
      .delete()
      .eq("id", service.id);

    if (deleteError) setError(deleteError.message);
    else {
      await load();
      setMessage("Service deleted ♡");
    }

    setBusy(false);
  }

  async function moveService(index, direction) {
    if (busy) return;

    const otherIndex = index + direction;

    if (otherIndex < 0 || otherIndex >= services.length) {
      return;
    }

    const current = services[index];
    const other = services[otherIndex];

    setBusy(true);
    setError("");

    // Use a temporary position to avoid conflicts.
    const temporaryOrder =
      Math.max(...services.map((s) => s.sort_order || 0)) + 100;

    const updates = [
      [current.id, temporaryOrder],
      [other.id, current.sort_order],
      [current.id, other.sort_order],
    ];

    let failed = false;

    for (const [id, order] of updates) {
      const { error: updateError } = await supabase
        .from("portfolio_services")
        .update({
          sort_order: order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        setError(updateError.message);
        failed = true;
        break;
      }
    }

    await load();

    if (!failed) setMessage("Order updated ♡");
    setBusy(false);
  }

  const publishedCount = services.filter(
    (service) => service.published
  ).length;

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        color: "#fcebf6",
        minWidth: 0,
      }}
    >
      <section style={styles.panel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                color: "#ff70bc",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              ♡ SERVICE CONTROL CENTER
            </span>

            <h2 style={{ margin: "8px 0" }}>
              Services Manager
            </h2>

            <p style={{ color: "#d5b8ca", margin: 0 }}>
              Manage your offerings without editing your website.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 9,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={styles.button}
              onClick={load}
              disabled={busy || loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              style={{ ...styles.button, ...styles.pink }}
              onClick={startNew}
              disabled={busy}
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <span><Layers size={15} /> {services.length} total</span>
          <span><Eye size={15} /> {publishedCount} published</span>
          <span><EyeOff size={15} /> {services.length - publishedCount} hidden</span>
        </div>
      </section>

      {error && (
        <p role="alert" style={{
          padding: 12,
          background: "#4d2537",
          color: "#ffc0d1",
          borderRadius: 9,
          margin: 0,
        }}>
          <AlertCircle size={15} /> {error}
        </p>
      )}

      {message && (
        <p role="status" style={{
          padding: 12,
          background: "#254337",
          color: "#b8f5d5",
          borderRadius: 9,
          margin: 0,
        }}>
          <Check size={15} /> {message}
        </p>
      )}

      {editing && (
        <form
          onSubmit={saveService}
          style={{ ...styles.panel, display: "grid", gap: 17 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>
              {editing === "new"
                ? "♡ Create Service"
                : "♡ Edit Service"}
            </h3>

            <button
              type="button"
              style={styles.button}
              onClick={cancelEdit}
              disabled={busy}
            >
              <X size={16} />
              Cancel
            </button>
          </div>

          <label style={styles.label}>
            Service Title
            <input
              style={styles.input}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Custom Website Design"
              required
            />
          </label>

          <label style={styles.label}>
            Short Description
            <textarea
              style={{ ...styles.input, minHeight: 85 }}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe what you offer..."
              required
            />
          </label>

          <label style={styles.label}>
            Service Icon
            <select
              style={styles.input}
              value={form.icon}
              onChange={(e) =>
                setForm({ ...form, icon: e.target.value })
              }
            >
              {ICON_OPTIONS.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            <strong>Individual Offerings</strong>

            {form.details.map((detail, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  style={styles.input}
                  value={detail}
                  onChange={(e) =>
                    updateDetail(index, e.target.value)
                  }
                  placeholder="e.g. Logo Design"
                />

                <button
                  type="button"
                  style={styles.button}
                  aria-label="Remove offering"
                  onClick={() =>
                    setForm((old) => ({
                      ...old,
                      details: old.details.filter(
                        (_, i) => i !== index
                      ),
                    }))
                  }
                  disabled={busy}
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              style={styles.button}
              onClick={() =>
                setForm((old) => ({
                  ...old,
                  details: [...old.details, ""],
                }))
              }
            >
              <Plus size={15} />
              Add Offering
            </button>
          </div>

          <label
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({
                  ...form,
                  published: e.target.checked,
                })
              }
            />
            Publish on public website
          </label>

          <button
            type="submit"
            style={{ ...styles.button, ...styles.pink }}
            disabled={busy}
          >
            <Save size={17} />
            {busy ? "Saving..." : "Save Service ♡"}
          </button>
        </form>
      )}

      <section style={styles.panel}>
        <h3 style={{ marginTop: 0 }}>
          <Package size={18} /> Your Services
        </h3>

        {loading ? (
          <p>Loading services... ♡</p>
        ) : services.length === 0 ? (
          <p style={{ color: "#d5b8ca" }}>
            No services yet. Create your first one!
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {services.map((service, index) => (
              <div
                key={service.id}
                style={{
                  background: "#302136",
                  border: "1px solid #62425c",
                  borderRadius: 11,
                  padding: 14,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 190px" }}>
                  <strong>{service.title}</strong>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#d0b4c7",
                      margin: "6px 0",
                    }}
                  >
                    {service.description}
                  </p>
                  <span
                    style={{
                      color: service.published
                        ? "#a9ebcf"
                        : "#f5b3c8",
                      fontSize: 11,
                    }}
                  >
                    {service.published
                      ? "● Published"
                      : "○ Hidden"}
                    {" · "}
                    {service.details?.length || 0} offerings
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    style={styles.button}
                    disabled={busy || index === 0}
                    title="Move up"
                    onClick={() => moveService(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>

                  <button
                    type="button"
                    style={styles.button}
                    disabled={
                      busy || index === services.length - 1
                    }
                    title="Move down"
                    onClick={() => moveService(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    type="button"
                    style={styles.button}
                    disabled={busy}
                    title={service.published ? "Unpublish" : "Publish"}
                    onClick={() => togglePublished(service)}
                  >
                    {service.published ? (
                      <Eye size={15} />
                    ) : (
                      <EyeOff size={15} />
                    )}
                  </button>

                  <button
                    type="button"
                    style={styles.button}
                    disabled={busy}
                    title="Edit"
                    onClick={() => startEdit(service)}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    style={styles.button}
                    disabled={busy}
                    title="Delete"
                    onClick={() => deleteService(service)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
