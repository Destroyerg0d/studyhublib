
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminHome from "@/components/admin/AdminHome";
import UserManagement from "@/components/admin/UserManagement";
import SeatManagement from "@/components/admin/SeatManagement";
import TimetableManagement from "@/components/admin/TimetableManagement";
import FeesManagement from "@/components/admin/FeesManagement";
import VerificationManagement from "@/components/admin/VerificationManagement";
import RegistrationManagement from "@/components/admin/RegistrationManagement";
import TuitionManagement from "@/components/admin/TuitionManagement";
import CanteenManagement from "@/components/admin/CanteenManagement";
import CanteenOrderManagement from "@/components/admin/CanteenOrderManagement";

const AdminPanel = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/seats" element={<SeatManagement />} />
        <Route path="/timetable" element={<TimetableManagement />} />
        <Route path="/fees" element={<FeesManagement />} />
        <Route path="/verification" element={<VerificationManagement />} />
        <Route path="/registrations" element={<RegistrationManagement />} />
        <Route path="/tuition" element={<TuitionManagement />} />
        <Route path="/canteen" element={<CanteenManagement />} />
        <Route path="/canteen-orders" element={<CanteenOrderManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPanel;
