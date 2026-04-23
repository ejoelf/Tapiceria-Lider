import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";
import ClientsPage from "../pages/Clients/ClientsPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import EmployeesPage from "../pages/Employees/EmployeesPage";
import FinancesPage from "../pages/Finances/FinancesPage";
import LoginPage from "../pages/Login/LoginPage";
import MasterCatalogsPage from "../pages/MasterCatalogs/MasterCatalogsPage";
import MaterialsPage from "../pages/Materials/MaterialsPage";
import MoldsPage from "../pages/Molds/MoldsPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import NotificationsPage from "../pages/Notifications/NotificationsPage";
import ProductsPage from "../pages/Products/ProductsPage";
import VehiclesPage from "../pages/Vehicles/VehiclesPage";
import WorkOrdersPage from "../pages/WorkOrders/WorkOrdersPage";
import authStore from "../store/authStore";

function LoginRoute() {
  if (authStore.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route
          path="/"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />

        <Route path="/clients" element={<AdminRoute><ClientsPage /></AdminRoute>} />
        <Route path="/vehicles" element={<AdminRoute><VehiclesPage /></AdminRoute>} />
        <Route path="/work-orders" element={<AdminRoute><WorkOrdersPage /></AdminRoute>} />
        <Route path="/materials" element={<AdminRoute><MaterialsPage /></AdminRoute>} />
        <Route path="/molds" element={<AdminRoute><MoldsPage /></AdminRoute>} />
        <Route path="/employees" element={<AdminRoute><EmployeesPage /></AdminRoute>} />
        <Route path="/products" element={<AdminRoute><ProductsPage /></AdminRoute>} />
        <Route path="/finances" element={<AdminRoute><FinancesPage /></AdminRoute>} />
        <Route path="/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
        <Route path="/master-catalogs" element={<AdminRoute><MasterCatalogsPage /></AdminRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;