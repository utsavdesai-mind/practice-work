import { Layout, Menu, Button } from "antd";
import {
  LogoutOutlined,
  DashboardOutlined,
  UsergroupAddOutlined,
  ContactsOutlined,
  SwapOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedKey, setSelectedKey] = useState(location.pathname);

  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const handleClick = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider>
        <div style={{ color: "white", padding: 20, fontSize: 18 }}>
          {user?.company?.name || "Admin Dashboard"}
        </div>
        <Menu
          theme="dark"
          onClick={handleClick}
          selectedKeys={[selectedKey]}
          mode="inline"
        >
          <Menu.Item key="/" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          {user?.permissions.includes("get.role") && (
            <Menu.Item key="/roles" icon={<SwapOutlined />}>
              <Link to="/roles">Roles</Link>
            </Menu.Item>
          )}
          {user?.permissions.includes("get.dept") && (
            <Menu.Item key="/departments" icon={<ContactsOutlined />}>
              <Link to="/departments">Departments</Link>
            </Menu.Item>
          )}
          {user?.permissions.includes("get.credit") && (
            <Menu.Item key="/credentials" icon={<KeyOutlined />}>
              <Link to="/credentials">Credentials</Link>
            </Menu.Item>
          )}
          {user?.permissions.includes("get.user") && (
            <Menu.Item key="/users" icon={<UsergroupAddOutlined />}>
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
