import { Card } from "antd";
import { useSyncPermissions } from "../hooks/useSyncPermissions";

export default function SuperAdminDashboard() {
  useSyncPermissions();

  return (
    <Card style={{
      minHeight: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h2>Welcome to the Super Admin Dashboard</h2>
    </Card>
  );
}
