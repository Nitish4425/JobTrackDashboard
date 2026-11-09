import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addApplication } from "../firebase/firestore";

function AddApplication() {
  const navigate = useNavigate();
  const location = useLocation();

  // Saved Job se aaya hua data
  const savedJob = location.state?.savedJob;

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    company: savedJob?.company || "",
    role: savedJob?.role || "",
    location: savedJob?.location || "",
    salary: savedJob?.salary || "",
    status: "Applied",
    applicationDate: today
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      await addApplication(formData);

      setMessage("Application added successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {
      console.error(error);
      setMessage("Failed to add application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card application-form">

        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>Add Job Application</h2>

        <p>
          {savedJob
            ? "Application details loaded from your saved job."
            : "Track a new job opportunity."}
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
            placeholder="Expected Salary / CTC"
            value={formData.salary}
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
            value={formData.applicationDate}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Application"}
          </button>

        </form>

        {message && (
          <p>{message}</p>
        )}

      </div>
    </div>
  );
}

export default AddApplication;