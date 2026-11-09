import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { db, updateApplication } from "../firebase/firestore";

function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    status: "Applied",
    applicationDate: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const applicationRef = doc(db, "applications", id);
        const snapshot = await getDoc(applicationRef);

        if (!snapshot.exists()) {
          setMessage("Application not found.");
          return;
        }

        setFormData(snapshot.data());
      } catch (error) {
        console.error(error);
        setMessage("Failed to load application.");
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
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

      await updateApplication(id, formData);

      setMessage("Application updated successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update application.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading application...</p>;
  }

  return (
    <div className="auth-container">

      <div className="auth-card application-form">

        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>Edit Job Application</h2>

        <p>Update your application details.</p>

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
            value={formData.location || ""}
            onChange={handleChange}
          />

          <input
            type="text"
            name="salary"
            placeholder="Expected Salary / CTC"
            value={formData.salary || ""}
            onChange={handleChange}
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="date"
            name="applicationDate"
            value={formData.applicationDate || ""}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Application"}
          </button>

        </form>

        {message && <p>{message}</p>}

      </div>

    </div>
  );
}

export default EditApplication;