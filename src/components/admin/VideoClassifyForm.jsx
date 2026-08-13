import React, { useState } from "react";
import {
  Save,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const subjects = [
  "Physics",
  "Chemistry",
  "Mathematics",
];

const classes = [
  "Class 11",
  "Class 12",
  "Dropper",
  "All Classes",
];

const exams = [
  "JEE Main",
  "JEE Advanced",
  "JEE Main + Advanced",
];

const difficulties = [
  "Basic",
  "Moderate",
  "Advanced",
];

const lectureTypes = [
  "Full Lecture",
  "One Shot",
  "Revision",
  "Problem Solving",
  "PYQ",
  "DPP",
  "Short Concept",
];

const VideoClassifyForm = ({ video }) => {
  const navigate = useNavigate();

  const storageKey = `jee_tube_video_${video.id}`;

  const existing = JSON.parse(
    localStorage.getItem(storageKey) || "{}"
  );

  const [form, setForm] = useState({
    subject: existing.subject || video.subject || "",
    className: existing.className || video.className || "",
    exam: existing.exam || video.exam || "",
    chapter: existing.chapter || video.chapter || "",
    topic: existing.topic || video.topic || "",
    teacher: existing.teacher || video.teacher || "",
    difficulty:
      existing.difficulty || video.difficulty || "",
    lectureType:
      existing.lectureType || video.lectureType || "",
    tags: existing.tags || video.tags || "",
    description:
      existing.description || video.description || "",
  });

  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function save() {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...form,
        classifiedAt: new Date().toISOString(),
      })
    );

    setSaved(true);
  }

  return (
    <div className="classify-page">
      <div className="classify-topbar">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h2>Classify Video</h2>
          <p>
            Manually organize this lecture for students.
          </p>
        </div>
      </div>

      <div className="classify-layout">
        <aside className="classify-preview">
          <img
            src={
              video.thumbnail ||
              `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`
            }
            alt=""
          />

          <div className="preview-info">
            <h3>{video.title || "Untitled video"}</h3>

            <p>
              {video.channel_name ||
                video.teacher ||
                "Unknown channel"}
            </p>

            <span>
              ID: {video.youtube_id || video.id}
            </span>
          </div>
        </aside>

        <section className="classify-form-card">
          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <div>
                <h3>Core classification</h3>
                <p>
                  Tell JEE-Tube where this video belongs.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Subject" required>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    update("subject", e.target.value)
                  }
                >
                  <option value="">Select subject</option>

                  {subjects.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Class">
                <select
                  value={form.className}
                  onChange={(e) =>
                    update("className", e.target.value)
                  }
                >
                  <option value="">Select class</option>

                  {classes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Exam">
                <select
                  value={form.exam}
                  onChange={(e) =>
                    update("exam", e.target.value)
                  }
                >
                  <option value="">Select exam</option>

                  {exams.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Teacher">
                <input
                  value={form.teacher}
                  onChange={(e) =>
                    update("teacher", e.target.value)
                  }
                  placeholder="e.g. Saleem Sir"
                />
              </Field>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <div>
                <h3>Topic hierarchy</h3>
                <p>
                  This controls how students discover the lecture.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <Field label="Chapter" required>
                <input
                  value={form.chapter}
                  onChange={(e) =>
                    update("chapter", e.target.value)
                  }
                  placeholder="e.g. Kinematics"
                />
              </Field>

              <Field label="Topic" required>
                <input
                  value={form.topic}
                  onChange={(e) =>
                    update("topic", e.target.value)
                  }
                  placeholder="e.g. Relative Motion"
                />
              </Field>

              <Field label="Difficulty">
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    update("difficulty", e.target.value)
                  }
                >
                  <option value="">Select difficulty</option>

                  {difficulties.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Lecture type">
                <select
                  value={form.lectureType}
                  onChange={(e) =>
                    update("lectureType", e.target.value)
                  }
                >
                  <option value="">
                    Select lecture type
                  </option>

                  {lectureTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>03</span>
              <div>
                <h3>Discovery metadata</h3>
                <p>
                  Add information that improves search.
                </p>
              </div>
            </div>

            <Field label="Tags">
              <input
                value={form.tags}
                onChange={(e) =>
                  update("tags", e.target.value)
                }
                placeholder="kinematics, jee main, pyq, mechanics"
              />
            </Field>

            <Field label="Admin notes">
              <textarea
                value={form.description}
                onChange={(e) =>
                  update("description", e.target.value)
                }
                placeholder="Internal notes about this video..."
                rows={5}
              />
            </Field>
          </div>

          <div className="classify-footer">
            {saved && (
              <div className="save-success">
                <CheckCircle2 size={18} />
                Classification saved
              </div>
            )}

            <button
              className="save-classification"
              onClick={save}
            >
              <Save size={18} />
              Save classification
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

function Field({ label, required, children }) {
  return (
    <label className="admin-field">
      <span>
        {label}

        {required && (
          <b className="required">*</b>
        )}
      </span>

      {children}
    </label>
  );
}

export default VideoClassifyForm;