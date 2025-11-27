import { Layout, Menu, Button } from "antd";
import { LogoutOutlined, DashboardOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider>
        <div style={{ color: "white", padding: 20, fontSize: 18 }}>
          {user.company?.name || "Admin Dashboard"}
        </div>
        <Menu theme="dark">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          {user?.role?.permissions.includes("get.role") && (
            <Menu.Item key="roles" icon={<DashboardOutlined />}>
              <Link to="/roles">Roles</Link>
            </Menu.Item>
          )}
          {user?.role?.permissions.includes("get.dept") && (
            <Menu.Item key="department" icon={<DashboardOutlined />}>
              <Link to="/departments">Departments</Link>
            </Menu.Item>
          )}
          {user?.role?.permissions.includes("get.user") && (
            <Menu.Item key="users" icon={<DashboardOutlined />}>
              <Link to="/users">Users</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 20px",
            background: "#fff",
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Header>
        <Content style={{ padding: 20 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
