import { useState } from "react";
import { registerUser } from "../api/authService";
import { Link, useNavigate } from "react-router-dom";
import { handleError } from "../utils/handleError";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      handleError(err, setError);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <br />
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: "12px", textAlign: "center" }}>
        Already registered?{" "}
        <Link to="/login" style={{ color: "#007bff", fontWeight: "bold" }}>
          Login Here
        </Link>
      </p>
    </div>
  );
}
