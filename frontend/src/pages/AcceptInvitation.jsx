import { Alert, Button, Form, message, Input } from "antd";
import { useState } from "react";
import { handleError } from "../utils/handleError";
import { useNavigate, useSearchParams } from "react-router-dom";
import { acceptInvitation, createPassword } from "../api/userService";
import { useEffect } from "react";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState();
  const [accepted, setAccepted] = useState(false);

  const handleAcceptInvitation = async () => {
    try {
      const token = searchParams.get("token");
      const res = await acceptInvitation({ otp, token });
      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      setAccepted(true);
      message.success(res.data.message);
    } catch (error) {
      handleError(error);
    }
  };

  const handlePasswordCreation = async (values) => {
    try {
      const res = await createPassword({
        email: values.email,
        password: values.password,
      });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      navigate("/login");
      message.success(res.data.message);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const alreadyAccepted = searchParams.get("isAccepted");
    setAccepted(alreadyAccepted === "true");
  }, [searchParams]);

  return (
    <>
      <div className="auth-page">
        <div className="auth-box">
          {accepted ? (
            <div>
              <Alert
                title="Your invitation has been accepted. Please proceed to Password Creation."
                type="success"
              ></Alert>
              <Form
                layout="vertical"
                style={{ marginTop: "20px" }}
                onFinish={handlePasswordCreation}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your email!",
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your new password!",
                    },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters long.",
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter your new password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your new password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm your new password" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Create Password
                  </Button>
                </Form.Item>
              </Form>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "26px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2>Enter Your OTP Here</h2>
              <Input.OTP onChange={(text) => setOtp(text)} />
              <Button type="primary" onClick={handleAcceptInvitation}>
                Accept Invitation
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
