
import { useCallback, useEffect, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Pencil,
  Save,
  X,
  CheckCircle2,
  RefreshCw,
  Globe,
  Lock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const PRIVATE_BUCKET = "portfolio-resumes";
const PUBLIC_BUCKET = "portfolio-public-resume";

const MAX_SIZE = 10 * 1024 * 1024;

const panel = {
  background: "#211825",
  border: "1px solid #68445f",
  borderRadius: 15,
  padding: 20,
  color: "#fcebf6",
};

const button = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 13px",
  background: "#38263c",
  color: "#fff",
  border: "1px solid #79546f",
  borderRadius: 9,
  cursor: "pointer",
  font: "inherit",
};

const primaryButton = {
  ...button,
  background: "#ff4eab",
  borderColor: "#ff4eab",
  color: "#251322",
  fontWeight: 800,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 9,
  background: "#342539",
  color: "#fff",
  border: "1px solid #79546f",
  font: "inherit",
};

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function fileTitle(name) {
  return name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
}

export default function ResumeManager() {
  const [resumes, setResumes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [resumeResult, settingsResult] = await Promise.all([
      supabase
        .from("portfolio_resumes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("portfolio_resume_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle(),
    ]);

    if (resumeResult.error || settingsResult.error) {
      setError(
        resumeResult.error?.message ||
        settingsResult.error?.message
      );
    } else {
      setResumes(resumeResult.data || []);
      setSettings(settingsResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadResume(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || busy) return;

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF resume.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Resume must be smaller than 10 MB.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    const path = `${crypto.randomUUID()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(PRIVATE_BUCKET)
      .upload(path, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setBusy(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("portfolio_resumes")
      .insert({
        title: fileTitle(file.name),
        file_name: file.name,
        file_path: path,
        file_size: file.size,
      });

    if (dbError) {
      await supabase.storage
        .from(PRIVATE_BUCKET)
        .remove([path]);

      setError(dbError.message);
    } else {
      await load();
      setNotice("Resume uploaded successfully ♡");
    }

    setBusy(false);
  }

  async function getSignedUrl(resume) {
    const { data, error: signedError } =
      await supabase.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrl(resume.file_path, 60);

    if (signedError) throw signedError;

    return data.signedUrl;
  }

  async function previewResume(resume) {
    setError("");

    // Open immediately so browser popup blockers
    // don't prevent the PDF preview.
    const tab = window.open("", "_blank");

    try {
      const url = await getSignedUrl(resume);

      if (tab) {
        tab.location.href = url;
      } else {
        setError("Allow popups to preview this resume.");
      }
    } catch (err) {
      if (tab) tab.close();
      setError(err.message);
    }
  }

  async function downloadResume(resume) {
    setError("");

    try {
      const { data, error: downloadError } =
        await supabase.storage
          .from(PRIVATE_BUCKET)
          .download(resume.file_path);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = resume.file_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function renameResume(resume) {
    const title = editingTitle.trim();

    if (!title || busy) return;

    setBusy(true);
    setError("");

    const { error: updateError } = await supabase
      .from("portfolio_resumes")
      .update({ title })
      .eq("id", resume.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEditingId(null);
      await load();
      setNotice("Resume renamed ♡");
    }

    setBusy(false);
  }

  async function publishResume(resume) {
    if (busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      // Download the chosen private PDF.
      const { data: pdf, error: downloadError } =
        await supabase.storage
          .from(PRIVATE_BUCKET)
          .download(resume.file_path);

      if (downloadError) throw downloadError;

      // Publish under a new unique path.
      // This avoids stale browser caches.
      const publicPath = `${crypto.randomUUID()}.pdf`;

      const { error: uploadError } =
        await supabase.storage
          .from(PUBLIC_BUCKET)
          .upload(publicPath, pdf, {
            contentType: "application/pdf",
            upsert: false,
          });

      if (uploadError) throw uploadError;

      const { data: publicData } =
        supabase.storage
          .from(PUBLIC_BUCKET)
          .getPublicUrl(publicPath);

      const publicUrl = publicData.publicUrl;

      // Save the published resume reference.
      const { error: saveError } = await supabase
        .from("portfolio_resume_settings")
        .upsert({
          id: "main",
          published_resume_id: resume.id,
          public_url: publicUrl,
        }, { onConflict: "id" });

      if (saveError) {
        await supabase.storage
          .from(PUBLIC_BUCKET)
          .remove([publicPath]);

        throw saveError;
      }

      // Remove the previously published PDF.
      // This also invalidates its old public URL.
      const previousUrl = settings?.public_url;

      if (previousUrl && previousUrl !== publicUrl) {
        const oldPath = previousUrl.split("/").pop();

        if (oldPath) {
          const { error: cleanupError } =
            await supabase.storage
              .from(PUBLIC_BUCKET)
              .remove([oldPath]);

          if (cleanupError) {
            console.warn(
              "Old published resume cleanup failed:",
              cleanupError
            );
          }
        }
      }

      await load();
      setNotice(`${resume.title} is now your public resume ♡`);
    } catch (err) {
      setError(err.message);
    }

    setBusy(false);
  }

  async function unpublishResume() {
    if (busy) return;

    if (!window.confirm("Remove your public resume?")) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    const oldUrl = settings?.public_url;

    const { error: updateError } = await supabase
      .from("portfolio_resume_settings")
      .update({
        published_resume_id: null,
        public_url: "",
      })
      .eq("id", "main");

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    if (oldUrl) {
      const path = oldUrl.split("/").pop();

      if (path) {
        const { error: removeError } =
          await supabase.storage
            .from(PUBLIC_BUCKET)
            .remove([path]);

        if (removeError) {
          setError(
            "Resume unpublished, but the old public file " +
            "could not be removed: " + removeError.message
          );
        }
      }
    }

    await load();
    setNotice("Public resume disabled ♡");
    setBusy(false);
  }

  async function deleteResume(resume) {
    if (busy) return;

    if (settings?.published_resume_id === resume.id) {
      setError(
        "Unpublish this resume before deleting it."
      );
      return;
    }

    if (
      !window.confirm(
        `Delete "${resume.title}" permanently?`
      )
    ) return;

    setBusy(true);
    setError("");

    // Delete the database record first.
    const { error: dbError } = await supabase
      .from("portfolio_resumes")
      .delete()
      .eq("id", resume.id);

    if (dbError) {
      setError(dbError.message);
      setBusy(false);
      return;
    }

    const { error: removeError } =
      await supabase.storage
        .from(PRIVATE_BUCKET)
        .remove([resume.file_path]);

    if (removeError) {
      setError(
        "Record deleted, but file cleanup failed: " +
        removeError.message
      );
    }

    await load();
    setNotice("Resume deleted ♡");
    setBusy(false);
  }

  const published = resumes.find(
    (resume) =>
      resume.id === settings?.published_resume_id
  );

  return (
    <div style={{
      display: "grid",
      gap: 18,
      color: "#fcebf6",
    }}>
      <section style={panel}>
        <p style={{
          color: "#ff70bc",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
        }}>
          ♡ PROFESSIONAL ARCHIVE
        </p>

        <h2>Resume Manager</h2>

        <p style={{ color: "#d8b9cf" }}>
          Keep multiple resume versions organized
          and choose which one visitors can access.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 18,
        }}>
          <label style={{
            ...primaryButton,
            cursor: busy ? "wait" : "pointer",
          }}>
            <Upload size={17} />
            {busy ? "Working..." : "Upload PDF"}

            <input
              type="file"
              accept=".pdf,application/pdf"
              hidden
              disabled={busy}
              onChange={uploadResume}
            />
          </label>

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
          color: "#ffc0d1",
        }}>
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {notice && (
        <p role="status" style={{
          ...panel,
          color: "#b5f4d1",
        }}>
          <CheckCircle2 size={16} /> {notice}
        </p>
      )}

      <section style={panel}>
        <h3>
          <Globe size={18} /> Public Resume
        </h3>

        {published ? (
          <>
            <p>
              <CheckCircle2
                size={16}
                color="#9ce5bc"
              />{" "}
              <strong>{published.title}</strong>
            </p>

            <p style={{
              color: "#d8b9cf",
              fontSize: 13,
            }}>
              This is the resume visitors can open
              from your About Me page.
            </p>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
            }}>
              <a
                href={settings.public_url}
                target="_blank"
                rel="noopener noreferrer"
                style={button}
              >
                <ExternalLink size={16} />
                View Public PDF
              </a>

              <button
                type="button"
                style={button}
                onClick={unpublishResume}
                disabled={busy}
              >
                <Lock size={16} />
                Unpublish
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: "#d8b9cf" }}>
            No resume is currently published.
            Your About Me page won't display a
            download button until you publish one.
          </p>
        )}
      </section>

      <section style={panel}>
        <h3>
          <FileText size={18} /> Resume Library
          {" "}({resumes.length})
        </h3>

        {loading ? (
          <p>Loading resumes... ♡</p>
        ) : resumes.length === 0 ? (
          <p style={{ color: "#d8b9cf" }}>
            No resumes uploaded yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {resumes.map((resume) => {
              const isPublic =
                settings?.published_resume_id === resume.id;

              return (
                <div
                  key={resume.id}
                  style={{
                    background: "#302136",
                    border: "1px solid #68445f",
                    borderRadius: 12,
                    padding: 15,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {editingId === resume.id ? (
                    <div style={{
                      display: "flex",
                      gap: 8,
                    }}>
                      <input
                        style={inputStyle}
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        style={primaryButton}
                        disabled={busy}
                        onClick={() => renameResume(resume)}
                      >
                        <Save size={16} />
                      </button>

                      <button
                        type="button"
                        style={button}
                        onClick={() => setEditingId(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <strong>{resume.title}</strong>

                      <p style={{
                        fontSize: 12,
                        color: "#d8b9cf",
                        margin: "6px 0",
                      }}>
                        {formatSize(resume.file_size)}
                        {" · "}
                        {new Date(
                          resume.created_at
                        ).toLocaleDateString()}
                      </p>

                      <span style={{
                        fontSize: 12,
                        color: isPublic
                          ? "#a8edc9"
                          : "#e6b4d5",
                      }}>
                        {isPublic
                          ? "● Public Resume"
                          : "○ Private Resume"}
                      </span>
                    </div>
                  )}

                  <div style={{
                    display: "flex",
                    gap: 7,
                    flexWrap: "wrap",
                  }}>
                    <button
                      type="button"
                      style={button}
                      onClick={() => previewResume(resume)}
                    >
                      <Eye size={15} />
                      Preview
                    </button>

                    <button
                      type="button"
                      style={button}
                      onClick={() => downloadResume(resume)}
                    >
                      <Download size={15} />
                      Download
                    </button>

                    <button
                      type="button"
                      style={button}
                      onClick={() => {
                        setEditingId(resume.id);
                        setEditingTitle(resume.title);
                      }}
                    >
                      <Pencil size={15} />
                      Rename
                    </button>

                    {!isPublic && (
                      <button
                        type="button"
                        style={primaryButton}
                        disabled={busy}
                        onClick={() => publishResume(resume)}
                      >
                        <Globe size={15} />
                        Publish
                      </button>
                    )}

                    <button
                      type="button"
                      style={button}
                      disabled={busy || isPublic}
                      onClick={() => deleteResume(resume)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
