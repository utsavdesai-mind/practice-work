import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./routes/RoleRoute";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import RolePage from "./pages/admin/RolePage";
import DepartmentPage from "./pages/admin/DepartmentPage";
import Register from "./pages/Register";
import UserPage from "./pages/admin/UserPage";
import AcceptInvitation from "./pages/AcceptInvitation";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* SuperAdmin */}
        <Route
          path="/super-admin"
          element={
            <RoleRoute allowed={["superAdmin"]}>
              <SuperAdminLayout>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            </RoleRoute>
          }
        />

        {/* Roles */}
        <Route
          path="/roles"
          element={
            <PrivateRoute>
              <AdminLayout>
                <RolePage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Department */}
        <Route
          path="/departments"
          element={
            <PrivateRoute>
              <AdminLayout>
                <DepartmentPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AdminLayout>
                <UserPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Accept Invitation */}
        <Route
          path="/accept-invitation"
          element={
            <PrivateRoute>
              <AcceptInvitation />
            </PrivateRoute>
          }
        />

        {/* Default */}
        <Route
          path="*"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
