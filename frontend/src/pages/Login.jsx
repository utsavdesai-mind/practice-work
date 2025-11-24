import { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { handleError } from "../utils/handleError";
import { parseJwt } from "../utils/jwt";

import { Form, Input, Button, Typography, Alert } from "antd";

const { Title } = Typography;

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(values);
      const token = res.data.data.token;
      const user = res.data.data.user;

      const payload = parseJwt(token);
      user.roleName = payload.role;

      login(token, user);

      if (payload.role?.toLowerCase() === "admin") {
        navigate("/admin");
      } else if (payload.role?.toLowerCase() === "superadmin") {
        navigate("/super-admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      handleError(err, setError);
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

        {error && <Alert type="error" message={error} style={{ marginBottom: 10 }} />}

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
      </div>
    </div>
  );
}
