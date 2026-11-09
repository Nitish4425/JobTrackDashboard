import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { updateSavedJob } from "../firebase/firestore";

function EditSavedJob() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    jobUrl: "",
    description: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD SAVED JOB
  // =========================

  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobRef = doc(
          db,
          "savedJobs",
          id
        );

        const snapshot = await getDoc(jobRef);

        if (!snapshot.exists()) {
          setMessage("Saved job not found.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setFormData({
          company: data.company || "",
          role: data.role || "",
          location: data.location || "",
          salary: data.salary || "",
          jobUrl: data.jobUrl || "",
          description: data.description || ""
        });

      } catch (error) {
        console.error(
          "Error loading saved job:",
          error
        );

        setMessage(
          "Failed to load saved job."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // UPDATE JOB
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      await updateSavedJob(
        id,
        formData
      );

      setMessage(
        "Job updated successfully!"
      );

      setTimeout(() => {
        navigate("/saved-jobs");
      }, 700);

    } catch (error) {
      console.error(
        "Error updating saved job:",
        error
      );

      setMessage(
        "Failed to update saved job."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">

          <h1>
            JobTrack<span>Pro</span>
          </h1>

          <p>
            Loading saved job...
          </p>

        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="auth-container">

      <div className="auth-card application-form">

        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>
          Edit Saved Job ✏️
        </h2>

        <p>
          Update your saved job details.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="role"
            placeholder="Job Role"
            value={formData.role}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="salary"
            placeholder="Salary / CTC"
            value={formData.salary}
            onChange={handleChange}
          />

          <input
            type="url"
            name="jobUrl"
            placeholder="Job URL"
            value={formData.jobUrl}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Job Description / Notes"
            value={formData.description}
            onChange={handleChange}
            rows="5"
          />

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "💾 Save Changes"}
          </button>

        </form>

        {message && (
          <p>{message}</p>
        )}

      </div>

    </div>
  );
}

export default EditSavedJob;