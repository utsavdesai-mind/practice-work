import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/jwt";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }

  return children;
}
