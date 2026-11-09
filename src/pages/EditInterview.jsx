import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { db, updateInterview } from "../firebase/firestore";

function EditInterview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    interviewDate: "",
    interviewTime: "",
    mode: "Online",
    status: "Upcoming",
    notes: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const interviewRef = doc(db, "interviews", id);
        const snapshot = await getDoc(interviewRef);

        if (!snapshot.exists()) {
          setMessage("Interview not found.");
          return;
        }

        setFormData(snapshot.data());
      } catch (error) {
        console.error("Error loading interview:", error);
        setMessage("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateInterview(id, formData);

      setMessage("Interview updated successfully!");

      setTimeout(() => {
        navigate("/interviews");
      }, 700);

    } catch (error) {
      console.error("Error updating interview:", error);
      setMessage("Failed to update interview.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="auth-container">

      <div className="auth-card application-form">

        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>Edit Interview</h2>

        <p>
          Update your interview details.
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
            type="date"
            name="interviewDate"
            value={formData.interviewDate}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="interviewTime"
            value={formData.interviewTime}
            onChange={handleChange}
            required
          />

          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
          >
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Phone">Phone</option>
          </select>

          <select
  name="status"
  value={formData.status || "Upcoming"}
  onChange={handleChange}
>
  <option value="Upcoming">Upcoming</option>
  <option value="Completed">Completed</option>
  <option value="Cancelled">Cancelled</option>
</select>

          <textarea
            name="notes"
            placeholder="Interview Notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows="4"
          />

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Interview"}
          </button>

        </form>

        {message && (
          <p>{message}</p>
        )}

      </div>

    </div>
  );
}

export default EditInterview;