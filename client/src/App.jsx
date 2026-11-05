import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { Loading } from "./components/ui";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MyDay from "./pages/MyDay";
import MyPay from "./pages/MyPay";
import Profile from "./pages/Profile";
import Overview from "./pages/admin/Overview";
import Employees from "./pages/admin/Employees";
import EmployeeDetail from "./pages/admin/EmployeeDetail";
import Attendance from "./pages/admin/Attendance";
import Payroll from "./pages/admin/Payroll";
import Locations from "./pages/admin/Locations";

function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function RequireAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

function NotFound() {
  return (
    <div className="empty">
      <h3>Page not found</h3>
      <p>That page doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<MyDay />} />
          <Route path="pay" element={<MyPay />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<RequireAdmin />}>
            <Route index element={<Overview />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="locations" element={<Locations />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
