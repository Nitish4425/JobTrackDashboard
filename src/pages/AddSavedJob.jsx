import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { addSavedJob } from "../firebase/firestore";

function AddSavedJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    jobUrl: "",
    description: ""
  });

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
      await addSavedJob(formData);

      setMessage("Job saved successfully!");

      setTimeout(() => {
        navigate("/saved-jobs");
      }, 700);
    } catch (error) {
      console.error(
        "Error saving job:",
        error
      );

      setMessage("Failed to save job.");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card application-form">

        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>
          Save Job ⭐
        </h2>

        <p>
          Save an interesting job for later.
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

          <button type="submit">
            ⭐ Save Job
          </button>

        </form>

        {message && (
          <p>{message}</p>
        )}

      </div>

    </div>
  );
}

export default AddSavedJob;