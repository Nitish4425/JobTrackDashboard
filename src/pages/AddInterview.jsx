import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addInterview } from "../firebase/firestore";

function AddInterview() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    interviewDate: "",
    interviewTime: "",
    mode: "Online",
    status: "Upcoming",
    notes: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addInterview(formData);

      setMessage("Interview saved successfully!");

      setTimeout(() => {
        navigate("/interviews");
      }, 700);
    } catch (error) {
      console.error("Error saving interview:", error);
      setMessage("Failed to save interview.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card application-form">
        <h1>
          JobTrack<span>Pro</span>
        </h1>

        <h2>Add Interview</h2>

        <p>Schedule and track your upcoming interview.</p>

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

          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Phone">Phone</option>
          </select>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <textarea
            name="notes"
            placeholder="Interview Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit">Save Interview</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default AddInterview;
