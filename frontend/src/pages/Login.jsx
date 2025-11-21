import { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { handleError } from "../utils/handleError";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      login(res.data.data.token);
      navigate("/");
    } catch (err) {
      handleError(err, setError);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <InputField
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button text="Login" type="submit" />
      </form>


      <p style={{ marginTop: "12px", textAlign: "center" }}>
        Not registered yet?{" "}
        <Link to="/register" style={{ color: "#007bff", fontWeight: "bold" }}>
          Register Here
        </Link>
      </p>
    </div>
  );
}
