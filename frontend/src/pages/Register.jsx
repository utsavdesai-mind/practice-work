import { useState } from "react";
import { registerUser } from "../api/authService";
import { Link, useNavigate } from "react-router-dom";
import { handleError } from "../utils/handleError";
import InputField from "../components/InputField";
import Button from "../components/Button";

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
        <InputField
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <InputField
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <InputField
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button text="Register" type="submit" />
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
