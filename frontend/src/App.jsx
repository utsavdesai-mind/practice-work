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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowed={["CEO"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </RoleRoute>
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

        {/* Roles - Accessible by both Admin and SuperAdmin */}
        <Route
          path="/admin/roles"
          element={
            <RoleRoute allowed={["CEO"]}>
              <AdminLayout>
                <RolePage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Department - Accessible by both Admin and SuperAdmin */}
        <Route
          path="/admin/departments"
          element={
            <RoleRoute allowed={["CEO"]}>
              <AdminLayout>
                <DepartmentPage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Users - Accessible by both Admin and SuperAdmin */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowed={["CEO"]}>
              <AdminLayout>
                <UserPage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
