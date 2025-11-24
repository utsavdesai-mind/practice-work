import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function RoleRoute({ children, allowed }) {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user?.roleName)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
