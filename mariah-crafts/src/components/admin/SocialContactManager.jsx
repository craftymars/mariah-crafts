
import { useCallback, useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, Save, X, RefreshCw,
  Link2, Mail, Phone, Check, AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const ICON_OPTIONS = [
  ["instagram", "Instagram"],
  ["music", "TikTok"],
  ["youtube", "YouTube"],
  ["twitch", "Twitch"],
  ["discord", "Discord"],
  ["twitter", "X / Twitter"],
  ["gist", "Gist"],
  ["coffee", "Ko-fi"],
  ["shopping", "Etsy / Shop"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["message", "Other / Community"],
];

const EMPTY_LINK = {
  name: "",
  category: "",
  icon: "message",
  url: "",
  published: true,
};

const EMPTY_CONTACT = {
  email: "",
  phone: "",
  show_email: true,
  show_phone: false,
  heading: "Connect With Me",
  intro:
    "From design experiments to game development, there's always something happening somewhere. Pick your favorite corner of the internet.",
  business_heading: "Have a project in mind?",
  business_description:
    "I'm always interested in hearing about creative collaborations, technical projects, and new opportunities.",
};

const panel = {
  background: "#211825",
  border: "1px solid #68445f",
  borderRadius: 15,
  padding: 20,
  color: "#fcebf6",
};

const field = {
  width: "100%",
  boxSizing: "border-box",
  background: "#342539",
  border: "1px solid #79546f",
  color: "#fff",
  padding: "11px 12px",
  borderRadius: 9,
  font: "inherit",
};

const button = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 12px",
  background: "#38263c",
  color: "#fff",
  border: "1px solid #79546f",
  borderRadius: 9,
  cursor: "pointer",
  font: "inherit",
};

const pinkButton = {
  ...button,
  background: "#ff4eab",
  color: "#251322",
  borderColor: "#ff4eab",
  fontWeight: 800,
};

const labelStyle = {
  display: "grid",
  gap: 7,
  fontSize: 13,
  color: "#e8c7dc",
};

function validUrl(url) {
  try {
    return ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export default function SocialContactManager() {
  const [links, setLinks] = useState([]);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_LINK);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [linksResult, contactResult] = await Promise.all([
      supabase
        .from("portfolio_social_links")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("portfolio_contact_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
    ]);

    if (linksResult.error || contactResult.error) {
      setError(
        linksResult.error?.message ||
        contactResult.error?.message
      );
    } else {
      setLinks(linksResult.data || []);
      setContact({
        ...EMPTY_CONTACT,
        ...(contactResult.data || {}),
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    setEditing("new");
    setForm({ ...EMPTY_LINK });
    setError("");
    setNotice("");
  }

  function startEdit(link) {
    setEditing(link.id);
    setForm({
      name: link.name,
      category: link.category || "",
      icon: link.icon || "message",
      url: link.url || "",
      published: link.published,
    });
    setError("");
    setNotice("");
  }

  async function saveLink(event) {
    event.preventDefault();
    if (busy) return;

    if (!form.name.trim()) {
      setError("Enter a platform name.");
      return;
    }

    if (form.url.trim() && !validUrl(form.url.trim())) {
      setError("Use a complete http:// or https:// URL.");
      return;
    }

    setBusy(true);
    setError("");

    const isNew = editing === "new";
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      icon: form.icon,
      url: form.url.trim(),
      published: form.published,
    };

    if (isNew) {
      payload.sort_order =
        Math.max(0, ...links.map((l) => l.sort_order || 0)) + 1;
    }

    const query = isNew
      ? supabase.from("portfolio_social_links").insert(payload)
      : supabase
          .from("portfolio_social_links")
          .update(payload)
          .eq("id", editing);

    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
    } else {
      setEditing(null);
      await load();
      setNotice(isNew ? "Social link added ♡" : "Social link saved ♡");
    }

    setBusy(false);
  }

  async function toggleLink(link) {
    if (busy) return;
    setBusy(true);
    setError("");

    const { error: updateError } = await supabase
      .from("portfolio_social_links")
      .update({ published: !link.published })
      .eq("id", link.id);

    if (updateError) setError(updateError.message);
    else {
      await load();
      setNotice("Visibility updated ♡");
    }

    setBusy(false);
  }

  async function removeLink(link) {
    if (busy) return;

    if (!window.confirm(`Delete ${link.name}?`)) return;

    setBusy(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("portfolio_social_links")
      .delete()
      .eq("id", link.id);

    if (deleteError) setError(deleteError.message);
    else {
      await load();
      setNotice("Social link deleted ♡");
    }

    setBusy(false);
  }

  async function moveLink(index, direction) {
    if (busy) return;

    const next = index + direction;
    if (next < 0 || next >= links.length) return;

    setBusy(true);
    setError("");

    const reordered = [...links];
    [reordered[index], reordered[next]] =
      [reordered[next], reordered[index]];

    let failed = false;

    for (let i = 0; i < reordered.length; i++) {
      const { error: updateError } = await supabase
        .from("portfolio_social_links")
        .update({ sort_order: i + 1 })
        .eq("id", reordered[i].id);

      if (updateError) {
        setError(updateError.message);
        failed = true;
        break;
      }
    }

    await load();
    if (!failed) setNotice("Order updated ♡");
    setBusy(false);
  }

  async function saveContact(event) {
    event.preventDefault();
    if (busy) return;

    if (
      contact.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    const payload = {
      id: "main",
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      show_email: contact.show_email,
      show_phone: contact.show_phone,
      heading: contact.heading.trim(),
      intro: contact.intro.trim(),
      business_heading: contact.business_heading.trim(),
      business_description: contact.business_description.trim(),
    };

    const { error: saveError } = await supabase
      .from("portfolio_contact_settings")
      .upsert(payload, { onConflict: "id" });

    if (saveError) setError(saveError.message);
    else setNotice("Contact settings saved ♡");

    setBusy(false);
  }

  const updateContact = (key, value) =>
    setContact((old) => ({ ...old, [key]: value }));

  return (
    <div style={{
      display: "grid",
      gap: 18,
      color: "#fcebf6",
      minWidth: 0,
    }}>
      <section style={panel}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <div>
            <p style={{
              color: "#ff70bc",
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 800,
            }}>
              ♡ CONNECTION CONTROL CENTER
            </p>

            <h2 style={{ margin: "8px 0" }}>
              Social & Contact Manager
            </h2>

            <p style={{ color: "#d8b9cf", margin: 0 }}>
              Manage where visitors can find and contact you.
            </p>
          </div>

          <button
            type="button"
            style={button}
            onClick={load}
            disabled={busy || loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" style={{
          ...panel,
          color: "#ffb9cd",
        }}>
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {notice && (
        <p role="status" style={{
          ...panel,
          color: "#b3f5d1",
        }}>
          <Check size={16} /> {notice}
        </p>
      )}

      <section style={{
        ...panel,
        display: "grid",
        gap: 15,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <div>
            <h3 style={{ margin: 0 }}>
              <Link2 size={18} /> Social Directory
            </h3>
            <p style={{
              color: "#d8b9cf",
              fontSize: 13,
            }}>
              {links.length} platforms ·{" "}
              {links.filter((l) => l.published).length} published
            </p>
          </div>

          <button
            type="button"
            style={pinkButton}
            onClick={startNew}
            disabled={busy}
          >
            <Plus size={16} /> Add Platform
          </button>
        </div>

        {editing && (
          <form
            onSubmit={saveLink}
            style={{
              display: "grid",
              gap: 14,
              background: "#302136",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <h4 style={{ margin: 0 }}>
              {editing === "new"
                ? "Add Social Platform"
                : "Edit Social Platform"}
            </h4>

            <label style={labelStyle}>
              Platform Name
              <input
                style={field}
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Instagram"
                required
              />
            </label>

            <label style={labelStyle}>
              Subtitle / Category
              <input
                style={field}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Design, creativity & behind the scenes"
              />
            </label>

            <label style={labelStyle}>
              Icon
              <select
                style={field}
                value={form.icon}
                onChange={(e) =>
                  setForm({ ...form, icon: e.target.value })
                }
              >
                {ICON_OPTIONS.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Profile URL
              <input
                style={field}
                value={form.url}
                onChange={(e) =>
                  setForm({ ...form, url: e.target.value })
                }
                placeholder="https://..."
              />
            </label>

            <label style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
            }}>
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
              Show on public website
            </label>

            <div style={{
              display: "flex",
              gap: 9,
              flexWrap: "wrap",
            }}>
              <button
                type="submit"
                style={pinkButton}
                disabled={busy}
              >
                <Save size={16} />
                {busy ? "Saving..." : "Save Platform"}
              </button>

              <button
                type="button"
                style={button}
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading your platforms... ♡</p>
        ) : links.length === 0 ? (
          <p style={{ color: "#d8b9cf" }}>
            No platforms yet. Add your first social link.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 9 }}>
            {links.map((link, index) => (
              <div
                key={link.id}
                style={{
                  background: "#302136",
                  border: "1px solid #60435d",
                  borderRadius: 11,
                  padding: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <strong>{link.name}</strong>
                  <p style={{
                    color: "#d0b4c7",
                    fontSize: 12,
                    margin: "5px 0",
                  }}>
                    {link.category}
                  </p>
                  <span style={{
                    fontSize: 11,
                    color: link.published
                      ? "#a8eacc"
                      : "#f1b1c7",
                  }}>
                    {link.published ? "● Published" : "○ Hidden"}
                    {!link.url && " · Coming Soon"}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                }}>
                  <button
                    type="button"
                    style={button}
                    title="Move up"
                    disabled={busy || index === 0}
                    onClick={() => moveLink(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>

                  <button
                    type="button"
                    style={button}
                    title="Move down"
                    disabled={busy || index === links.length - 1}
                    onClick={() => moveLink(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    type="button"
                    style={button}
                    title="Toggle visibility"
                    disabled={busy}
                    onClick={() => toggleLink(link)}
                  >
                    {link.published
                      ? <Eye size={15} />
                      : <EyeOff size={15} />}
                  </button>

                  <button
                    type="button"
                    style={button}
                    title="Edit"
                    disabled={busy}
                    onClick={() => startEdit(link)}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    style={button}
                    title="Delete"
                    disabled={busy}
                    onClick={() => removeLink(link)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <form
        onSubmit={saveContact}
        style={{ ...panel, display: "grid", gap: 15 }}
      >
        <h3 style={{ margin: 0 }}>
          <Mail size={18} /> Business Contact
        </h3>

        <p style={{
          color: "#d8b9cf",
          fontSize: 13,
          margin: 0,
        }}>
          Only enter business contact details you are
          comfortable publishing.
        </p>

        <label style={labelStyle}>
          Business Email
          <input
            type="email"
            style={field}
            value={contact.email}
            onChange={(e) =>
              updateContact("email", e.target.value)
            }
            placeholder="hello@example.com"
          />
        </label>

        <label style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
        }}>
          <input
            type="checkbox"
            checked={contact.show_email}
            onChange={(e) =>
              updateContact("show_email", e.target.checked)
            }
          />
          Display email publicly
        </label>

        <label style={labelStyle}>
          Business Phone (Optional)
          <input
            type="tel"
            style={field}
            value={contact.phone}
            onChange={(e) =>
              updateContact("phone", e.target.value)
            }
            placeholder="Business phone number"
          />
        </label>

        <label style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
        }}>
          <input
            type="checkbox"
            checked={contact.show_phone}
            onChange={(e) =>
              updateContact("show_phone", e.target.checked)
            }
          />
          Display phone publicly
        </label>

        <h3 style={{ marginBottom: 0 }}>
          Contact Page Content
        </h3>

        {[
          ["heading", "Main Heading"],
          ["intro", "Introduction"],
          ["business_heading", "Business Heading"],
          ["business_description", "Business Description"],
        ].map(([key, title]) => (
          <label style={labelStyle} key={key}>
            {title}
            <textarea
              style={{ ...field, minHeight: 65 }}
              value={contact[key] || ""}
              onChange={(e) =>
                updateContact(key, e.target.value)
              }
            />
          </label>
        ))}

        <button
          type="submit"
          style={pinkButton}
          disabled={busy || loading}
        >
          <Save size={16} />
          {busy ? "Saving..." : "Save Contact Settings ♡"}
        </button>
      </form>
    </div>
  );
}
