import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./routes/RoleRoute";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import RolePage from "./pages/admin/RolePage";
import CompanyPage from "./pages/admin/CompanyPage";
import DepartmentPage from "./pages/admin/DepartmentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowed={["admin"]}>
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
            <RoleRoute allowed={['admin', 'superAdmin']}>
              <AdminLayout>
                <RolePage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Company - Accessible by both Admin and SuperAdmin */}
        <Route
          path="/admin/companies"
          element={
            <RoleRoute allowed={['admin', 'superAdmin']}>
              <AdminLayout>
                <CompanyPage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Department - Accessible by both Admin and SuperAdmin */}
        <Route
          path="/admin/departments"
          element={
            <RoleRoute allowed={['admin', 'superAdmin']}>
              <AdminLayout>
                <DepartmentPage />
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
