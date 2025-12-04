import { Card } from "antd";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSyncPermissions } from "../hooks/useSyncPermissions";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  useSyncPermissions();

  return (
    <Card style={{
      minHeight: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1>Welcome to the {user.company.name} Dashboard</h1>
    </Card>
  );
}
