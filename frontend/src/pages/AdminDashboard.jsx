import { Card } from "antd";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

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
