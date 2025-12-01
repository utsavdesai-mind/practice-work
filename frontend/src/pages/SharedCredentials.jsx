import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, message, Row, Col, Descriptions, Button, Space, Empty } from "antd";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";
import { accessSharedCredential } from "../api/credentialsService";

export default function SharedCredentials() {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState(null);

  useEffect(() => {
    if (token) fetchShared();
  }, [token]);

  const fetchShared = async () => {
    try {
      setLoading(true);
      const res = await accessSharedCredential(token);
      setCredential(res.data.data);
    } catch (err) {
      message.error("Failed to access shared credential");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!credential) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Empty description="No credential found or access denied." />
      </div>
    );
  }

  return (
    <Row justify="center" style={{ padding: "24px" }}>
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card 
          title={credential.name}
          extra={
            <Button 
              type="primary" 
              icon={<LinkOutlined />}
              onClick={() => window.open(credential.url, "_blank")}
            >
              Visit URL
            </Button>
          }
          style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
        >
          <Descriptions column={1} bordered>
            <Descriptions.Item label="URL">
              <Space>
                <a href={credential.url} target="_blank" rel="noreferrer">
                  {credential.url}
                </a>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(credential.url, "URL")}
                />
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Username">
              <Space>
                <span>{credential.userName}</span>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(credential.userName, "Username")}
                />
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Password">
              <Space>
                <span>{credential.password}</span>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(credential.password, "Password")}
                />
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Shared By">
              <span>{credential.userId?.name || "N/A"}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );
}
