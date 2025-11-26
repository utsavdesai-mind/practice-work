import { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { handleError } from "../utils/handleError";
import { parseJwt } from "../utils/jwt";

import { Form, Input, Button, Typography, message } from "antd";

const { Title } = Typography;

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await loginUser(values);
      const token = res.data.data.token;
      const user = res.data.data.user;

      const payload = parseJwt(token);
      user.roleName = payload.role;

      login(token, user);
      navigate("/");
      message.success("Login successful! Welcome to the Dashboard.");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Title level={2} style={{ textAlign: "center" }}>
          Login
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Enter your email" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Login
          </Button>
        </Form>

        <p
          style={{
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
