
import { useEffect, useState } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Save,
  Check,
  RefreshCw,
  Search,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const BUCKET = "portfolio-images";
const MAX_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

const panelStyle = {
  background: "#211825",
  border: "1px solid #65415e",
  borderRadius: 14,
  padding: 22,
  minWidth: 0,
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  padding: "12px 18px",
  background: "#ff4eab",
  color: "#1c1020",
  border: "none",
  borderRadius: 9,
  fontWeight: 700,
  cursor: "pointer",
};

function getPublicUrl(path) {
  return supabase.storage
    .from(BUCKET)
    .getPublicUrl(path).data.publicUrl;
}

async function listImages(folder = "") {
  const images = [];
  const limit = 100;
  let offset = 0;

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
        const nested = await listImages(path);
        images.push(...nested);
        continue;
      }

      if (!/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
        continue;
      }

      images.push({
        path,
        name: entry.name,
        url: getPublicUrl(path),
        created_at: entry.created_at,
      });
    }

    if (entries.length < limit) break;

    offset += limit;
  }

  return images;
}

export default function AboutPhotoSettings() {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");

  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(35);

  const [savedPosition, setSavedPosition] =
    useState("50% 35%");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadImages() {
    setRefreshing(true);

    try {
      const results = await listImages();

      results.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );

      setImages(results);
    } catch (err) {
      setError(
        err.message || "Could not load media images."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const [settingsResult, mediaResult] =
          await Promise.all([
            supabase
              .from("portfolio_site_settings")
              .select("key, value")
              .in("key", [
                "about_photo_url",
                "about_photo_position",
              ]),
            listImages(),
          ]);

        if (settingsResult.error) {
          throw settingsResult.error;
        }

        if (!active) return;

        const settings = Object.fromEntries(
          (settingsResult.data ?? []).map(
            (row) => [row.key, row.value]
          )
        );

        const url = settings.about_photo_url || "";
        const position =
          settings.about_photo_position || "50% 35%";

        const [x, y] = position
          .split(" ")
          .map((value) => parseInt(value, 10));

        setPhotoUrl(url);
        setSavedUrl(url);

        setPositionX(
          Number.isFinite(x) ? x : 50
        );

        setPositionY(
          Number.isFinite(y) ? y : 35
        );

        setSavedPosition(position);

        mediaResult.sort(
          (a, b) =>
            new Date(b.created_at || 0) -
            new Date(a.created_at || 0)
        );

        setImages(mediaResult);
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Could not initialize photo settings."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];

    if (!file || uploading) return;

    setError("");
    setMessage("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Please select a PNG, JPG, or WEBP image."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(
        "Your photo must be 20 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";

      const path =
        `profile/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

      if (uploadError) throw uploadError;

      setPhotoUrl(getPublicUrl(path));

      setMessage(
        "Photo uploaded! Click Save Photo to publish it. ♡"
      );

      await loadImages();
    } catch (err) {
      setError(
        err.message || "Could not upload photo."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function savePhoto(event) {
    event?.preventDefault();

    if (saving || uploading) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const position =
        `${positionX}% ${positionY}%`;

      const now = new Date().toISOString();

      const rows = [
        {
          key: "about_photo_url",
          value: photoUrl,
          updated_at: now,
        },
        {
          key: "about_photo_position",
          value: position,
          updated_at: now,
        },
      ];

      const { data, error: saveError } =
        await supabase
          .from("portfolio_site_settings")
          .upsert(rows, {
            onConflict: "key",
          })
          .select("key");

      if (saveError) throw saveError;

      if (data?.length !== rows.length) {
        throw new Error(
          "Supabase did not confirm both settings."
        );
      }

      setSavedUrl(photoUrl);
      setSavedPosition(position);

      setMessage(
        photoUrl
          ? "About Me photo saved successfully! ♡"
          : "Photo cleared. Placeholder restored! ♡"
      );
    } catch (err) {
      setError(
        err.message || "Could not save photo."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredImages = images.filter((image) =>
    image.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const currentPosition =
    `${positionX}% ${positionY}%`;

  const hasChanges =
    photoUrl !== savedUrl ||
    currentPosition !== savedPosition;

  if (loading) {
    return (
      <p style={{ color: "#f9eaf4" }}>
        Loading photo settings... ♡
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 22,
        color: "#f9eaf4",
      }}
    >
      {/* PHOTO SETTINGS */}
      <section style={panelStyle}>
        <span
          style={{
            color: "#ff4eab",
            fontSize: 12,
            letterSpacing: 1,
            fontWeight: 700,
          }}
        >
          ♡ ABOUT ME SETTINGS
        </span>

        <h2>Display Photo Manager</h2>

        <p style={{ color: "#c7b2c5" }}>
          Change the photo inside your existing
          glowing pink About Me frame.
        </p>

        {/* PHOTO PREVIEW */}
        <div
          style={{
            width: "100%",
            maxWidth: 280,
            aspectRatio: "3 / 4",
            margin: "24px auto",
            background: "#302038",
            border: "2px solid #ff4eab",
            borderRadius: 13,
            overflow: "hidden",
            boxShadow: "0 0 20px #ff4eab30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="About Me photo preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: currentPosition,
              }}
            />
          ) : (
            <div
              style={{
                display: "grid",
                justifyItems: "center",
                color: "#d8a5c8",
                textAlign: "center",
              }}
            >
              <ImageIcon size={35} />
              <p>YOUR PHOTO HERE</p>
            </div>
          )}
        </div>

        {/* PHOTO POSITION */}
        <div
          style={{
            display: "grid",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <label>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span>Horizontal Position</span>
              <span>{positionX}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={positionX}
              onChange={(event) =>
                setPositionX(
                  Number(event.target.value)
                )
              }
              style={{
                width: "100%",
                accentColor: "#ff4eab",
              }}
            />
          </label>

          <label>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span>Vertical Position</span>
              <span>{positionY}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={positionY}
              onChange={(event) =>
                setPositionY(
                  Number(event.target.value)
                )
              }
              style={{
                width: "100%",
                accentColor: "#ff4eab",
              }}
            />
          </label>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#bda7bc",
          }}
        >
          Adjust the crop without changing
          the original photo.
        </p>

        {/* UPLOAD PHOTO */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            marginTop: 12,
            padding: "12px 16px",
            background: "#38263b",
            border: "1px solid #ff4eab",
            borderRadius: 9,
            cursor: uploading
              ? "wait"
              : "pointer",
          }}
        >
          <UploadCloud size={19} />

          {uploading
            ? "Uploading..."
            : "Upload New Photo ♡"}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            disabled={uploading}
            onChange={uploadPhoto}
          />
        </label>

        {photoUrl && (
          <button
            type="button"
            onClick={() => {
              setPhotoUrl("");
              setMessage(
                "Photo cleared from preview. Save to publish."
              );
            }}
            style={{
              display: "block",
              marginTop: 14,
              background: "transparent",
              border: 0,
              color: "#ffb6d9",
              cursor: "pointer",
            }}
          >
            Clear Selected Photo
          </button>
        )}

        {/* SAVE */}
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            style={{
              ...buttonStyle,
              opacity:
                saving || uploading ? 0.6 : 1,
            }}
            disabled={saving || uploading}
            onClick={savePhoto}
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Photo ♡"}
          </button>
        </div>

        {hasChanges && (
          <p
            style={{
              color: "#ffadd9",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            You have unsaved changes.
          </p>
        )}

        {error && (
          <p
            role="alert"
            style={{
              color: "#ff9aa8",
              marginTop: 15,
            }}
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            style={{
              color: "#9ce9c5",
              marginTop: 15,
            }}
          >
            {message}
          </p>
        )}

        {savedUrl && (
          <p
            style={{
              color: "#bda7bc",
              fontSize: 12,
            }}
          >
            A display photo is currently published.
          </p>
        )}
      </section>

      {/* MEDIA LIBRARY PICKER */}
      <section style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                color: "#ff4eab",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ♡ PHOTO COLLECTION
            </span>

            <h2>Choose from Media Library</h2>
          </div>

          <button
            type="button"
            onClick={loadImages}
            disabled={refreshing}
            title="Refresh images"
            style={{
              background: "#38263b",
              color: "#fff",
              border: "1px solid #65415e",
              borderRadius: 8,
              padding: 10,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "16px 0",
            padding: "10px 12px",
            background: "#302238",
            border: "1px solid #65415e",
            borderRadius: 9,
          }}
        >
          <Search
            size={17}
            color="#ff4eab"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search your images..."
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: 0,
              outline: "none",
              color: "#fff",
              font: "inherit",
            }}
          />
        </div>

        {refreshing && (
          <p style={{ color: "#c7b2c5" }}>
            Refreshing images...
          </p>
        )}

        {filteredImages.length === 0 ? (
          <p style={{ color: "#c7b2c5" }}>
            {images.length
              ? "No images match your search."
              : "No images found. Upload one above!"}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            {filteredImages.map((image) => {
              const isSelected =
                image.url === photoUrl;

              return (
                <button
                  key={image.path}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(image.url);
                    setMessage(
                      "Photo selected! Save to publish. ♡"
                    );
                    setError("");
                  }}
                  title={image.path}
                  style={{
                    background: "#302238",
                    border: isSelected
                      ? "2px solid #ff4eab"
                      : "1px solid #65415e",
                    borderRadius: 10,
                    padding: 6,
                    color: "#fff",
                    cursor: "pointer",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      overflow: "hidden",
                      borderRadius: 7,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#ff4eab",
                          color: "#1c1020",
                          borderRadius: "50%",
                          padding: 4,
                        }}
                      >
                        <Check size={14} />
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      display: "block",
                      padding: 6,
                      fontSize: 11,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {image.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
