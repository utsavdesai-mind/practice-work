import { useState } from "react";
import { registerUser } from "../api/authService";
import { Link, useNavigate } from "react-router-dom";
import { handleError } from "../utils/handleError";

import { Form, Input, Button, Typography, Select, message } from "antd";

const { Title } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      await registerUser(values);
      message.success("Registration successful! Please login.");
      navigate("/login");
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
          Register
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Enter your name" }]}
          >
            <Input placeholder="Your Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Enter your email" }]}
          >
            <Input placeholder="Your Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password placeholder="Your Password" />
          </Form.Item>

          <Form.Item
            label="Company Name"
            name="companyName"
            rules={[{ required: true, message: "Enter your company name" }]}
          >
            <Input placeholder="Company Name" />
          </Form.Item>

          <Form.Item
            label="Company Address"
            name="companyAddress"
            rules={[{ required: true, message: "Enter your company address" }]}
          >
            <Input placeholder="Company Address" />
          </Form.Item>

          <Form.Item
            label="Company Size"
            name="companySize"
            rules={[{ required: true, message: "Enter your company size" }]}
          >
            <Input type="number" placeholder="Company Size" />
          </Form.Item>

          <Form.Item
            label="Company Industry"
            name="companyIndustry"
            rules={[{ required: true, message: "Enter your company industry" }]}
          >
            <Select placeholder="Select Company Industry">
              <Option value="Technology">Technology</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Education">Education</Option>
              <Option value="Retail">Retail</Option>
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Register
          </Button>
        </Form>

        <p
          style={{
            marginTop: "12px",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
