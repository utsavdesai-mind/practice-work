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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
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
            <AdminLayout>
              <RolePage />
            </AdminLayout>
          }
        />

        {/* Department */}
        <Route
          path="/departments"
          element={
            <AdminLayout>
              <DepartmentPage />
            </AdminLayout>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <AdminLayout>
              <UserPage />
            </AdminLayout>
          }
        />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Accept Invitation */}
        <Route path="/accept-invitation" element={<AcceptInvitation />} />

        {/* Default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
