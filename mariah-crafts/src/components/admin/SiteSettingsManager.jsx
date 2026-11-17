
import { useEffect, useState } from "react";
import {
  Settings,
  Palette,
  Search,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Globe,
  Upload,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import AboutPhotoSettings from "./AboutPhotoSettings";

const BUCKET = "portfolio-images";

const defaults = {
  site_name: "Mariah Crafts",
  site_tagline: "Creative Technologist",
  browser_title: "Mariah Crafts | Creative Technologist",
  seo_description:
    "Explore the creative portfolio of Mariah Crafts, featuring graphic design, UI/UX, web development, game design, and interactive digital experiences.",
  seo_indexing: "true",
  seo_image_url: "",
  site_favicon_url: "",
  footer_name: "Mariah Crafts",
  footer_tagline: "Design. Code. Create.",
};

const tabs = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "profile", label: "Profile", icon: ImageIcon },
  { id: "general", label: "General", icon: Settings },
];

const panel = {
  background: "#211825",
  border: "1px solid #65415e",
  borderRadius: 14,
  padding: 22,
  color: "#f9eaf4",
  minWidth: 0,
};

const field = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  background: "#302238",
  color: "#fff",
  border: "1px solid #76516f",
  borderRadius: 9,
  font: "inherit",
};

const button = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px 16px",
  borderRadius: 9,
  border: "1px solid #76516f",
  background: "#38263b",
  color: "#fff",
  cursor: "pointer",
  font: "inherit",
};

const primaryButton = {
  ...button,
  background: "#ff4eab",
  color: "#1c1020",
  borderColor: "#ff4eab",
  fontWeight: 700,
};

function SettingField({
  label,
  value,
  onChange,
  multiline = false,
  hint,
}) {
  return (
    <label style={{ display: "grid", gap: 9 }}>
      <span style={{ fontWeight: 650 }}>{label}</span>

      {multiline ? (
        <textarea
          style={{ ...field, minHeight: 110, resize: "vertical" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          style={field}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {hint && (
        <span style={{ color: "#c7b2c5", fontSize: 12 }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export default function SiteSettingsManager() {
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("portfolio_site_settings")
      .select("key, value")
      .in("key", Object.keys(defaults));

    if (loadError) {
      setError(loadError.message);
    } else {
      const values = {
        ...defaults,
        ...Object.fromEntries(
          (data || []).map((item) => [item.key, item.value])
        ),
      };

      setSettings(values);
      setSaved(values);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function update(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage("");
  }

  async function uploadImage(event, key) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || uploading) return;

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const folder =
        key === "site_favicon_url"
          ? "branding/favicons"
          : "branding/social-previews";

      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      update(key, data.publicUrl);
      setMessage("Image uploaded. Save settings to publish it ♡");
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function saveSettings() {
    if (saving || uploading) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!settings.site_name.trim()) {
        throw new Error("Website name cannot be empty.");
      }

      if (!settings.browser_title.trim()) {
        throw new Error("Browser title cannot be empty.");
      }

      const rows = Object.entries(settings).map(
        ([key, value]) => ({
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        })
      );

      const { data, error: saveError } = await supabase
        .from("portfolio_site_settings")
        .upsert(rows, { onConflict: "key" })
        .select("key");

      if (saveError) throw saveError;

      if (data?.length !== rows.length) {
        throw new Error(
          "Supabase did not confirm all saved settings."
        );
      }

      setSaved({ ...settings });
      setMessage(
        "Site settings saved! Refresh the public site to see your changes ♡"
      );
    } catch (err) {
      setError(err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(saved);

  function imageUploader(key, label, hint) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <strong>{label}</strong>

        {settings[key] && (
          <img
            src={settings[key]}
            alt={`${label} preview`}
            style={{
              width: key === "site_favicon_url" ? 72 : "100%",
              maxWidth: 360,
              maxHeight: 200,
              objectFit: "contain",
              background: "#302238",
              border: "1px solid #76516f",
              borderRadius: 9,
              padding: 10,
              boxSizing: "border-box",
            }}
          />
        )}

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
        }}>
          <label style={{
            ...button,
            cursor: uploading ? "wait" : "pointer",
          }}>
            <Upload size={16} />
            {uploading ? "Uploading..." : "Choose Image"}
            <input
              type="file"
              hidden
              disabled={uploading}
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadImage(event, key)}
            />
          </label>

          {settings[key] && (
            <button
              type="button"
              style={button}
              onClick={() => update(key, "")}
            >
              Remove Selection
            </button>
          )}
        </div>

        <span style={{
          fontSize: 12,
          color: "#c7b2c5",
        }}>
          {hint}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gap: 20,
      color: "#f9eaf4",
    }}>
      <section style={panel}>
        <p style={{
          color: "#ff4eab",
          letterSpacing: 2,
          fontSize: 12,
          fontWeight: 800,
        }}>
          ♡ SYSTEM CONFIGURATION
        </p>

        <h2>Site Settings</h2>

        <p style={{ color: "#c7b2c5" }}>
          Customize your portfolio's identity,
          search appearance, and public information.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
          marginTop: 20,
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...button,
                  background:
                    activeTab === tab.id
                      ? "#ff4eab"
                      : "#38263b",
                  color:
                    activeTab === tab.id
                      ? "#1c1020"
                      : "#fff",
                  fontWeight:
                    activeTab === tab.id ? 800 : 500,
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <p role="alert" style={{
          ...panel,
          color: "#ffb4c4",
        }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{
          ...panel,
          color: "#a8edc9",
        }}>
          {message}
        </p>
      )}

      {activeTab === "profile" ? (
        <AboutPhotoSettings />
      ) : loading ? (
        <section style={panel}>Loading settings... ♡</section>
      ) : (
        <>
          {activeTab === "branding" && (
            <section style={{
              ...panel,
              display: "grid",
              gap: 22,
            }}>
              <h3>Brand Identity</h3>

              <SettingField
                label="Website Name"
                value={settings.site_name}
                onChange={(v) => update("site_name", v)}
              />

              <SettingField
                label="Creator Tagline"
                value={settings.site_tagline}
                onChange={(v) => update("site_tagline", v)}
              />

              <SettingField
                label="Browser Tab Title"
                value={settings.browser_title}
                onChange={(v) => update("browser_title", v)}
              />

              {imageUploader(
                "site_favicon_url",
                "Website Favicon",
                "A square PNG or WEBP, ideally 512 × 512 pixels."
              )}
            </section>
          )}

          {activeTab === "seo" && (
            <section style={{
              ...panel,
              display: "grid",
              gap: 22,
            }}>
              <h3>Search Engine Appearance</h3>

              <SettingField
                label="Search Description"
                value={settings.seo_description}
                onChange={(v) =>
                  update("seo_description", v)
                }
                multiline
                hint="Aim for approximately 150–160 characters."
              />

              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <input
                  type="checkbox"
                  checked={settings.seo_indexing === "true"}
                  onChange={(e) =>
                    update(
                      "seo_indexing",
                      String(e.target.checked)
                    )
                  }
                  style={{ accentColor: "#ff4eab" }}
                />

                Allow search engine indexing
              </label>

              {imageUploader(
                "seo_image_url",
                "Social Sharing Image",
                "Recommended: 1200 × 630 pixels."
              )}

              <div style={{
                background: "#302238",
                borderRadius: 10,
                padding: 16,
              }}>
                <span style={{
                  fontSize: 12,
                  color: "#c7b2c5",
                }}>
                  SEARCH PREVIEW
                </span>

                <h4 style={{
                  color: "#ff8ac6",
                  marginBottom: 6,
                }}>
                  {settings.browser_title}
                </h4>

                <p style={{
                  fontSize: 13,
                  color: "#e7d1e0",
                }}>
                  {settings.seo_description}
                </p>
              </div>
            </section>
          )}

          {activeTab === "general" && (
            <section style={{
              ...panel,
              display: "grid",
              gap: 22,
            }}>
              <h3>General Website Information</h3>

              <SettingField
                label="Footer Copyright Name"
                value={settings.footer_name}
                onChange={(v) => update("footer_name", v)}
              />

              <SettingField
                label="Footer Tagline"
                value={settings.footer_tagline}
                onChange={(v) => update("footer_tagline", v)}
              />

              <div style={{
                background: "#302238",
                padding: 16,
                borderRadius: 10,
                display: "grid",
                gap: 8,
              }}>
                <span style={{
                  fontSize: 12,
                  color: "#c7b2c5",
                }}>
                  FOOTER PREVIEW
                </span>

                <span>
                  © {new Date().getFullYear()}{" "}
                  {settings.footer_name}
                </span>

                <span>{settings.footer_tagline}</span>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...button,
                  width: "fit-content",
                  textDecoration: "none",
                }}
              >
                <Globe size={16} />
                Open Website
                <ExternalLink size={15} />
              </a>
            </section>
          )}

          <section style={panel}>
            <div style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}>
              <button
                type="button"
                style={primaryButton}
                disabled={saving || uploading}
                onClick={saveSettings}
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Settings ♡"}
              </button>

              <button
                type="button"
                style={button}
                disabled={saving || uploading}
                onClick={loadSettings}
              >
                <RefreshCw size={16} />
                Reload
              </button>
            </div>

            {hasChanges && (
              <p style={{
                fontSize: 12,
                color: "#ffadd9",
              }}>
                You have unsaved changes.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
