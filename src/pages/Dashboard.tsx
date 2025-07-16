
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import Timetable from "@/components/dashboard/Timetable";
import FeesPayment from "@/components/dashboard/FeesPayment";
import SeatArrangement from "@/components/dashboard/SeatArrangement";
import Canteen from "@/components/dashboard/Canteen";
import Verification from "@/components/dashboard/Verification";
import ComingSoon from "@/components/dashboard/ComingSoon";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/fees" element={<FeesPayment />} />
        <Route path="/seats" element={<SeatArrangement />} />
        <Route path="/canteen" element={<Canteen />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/fingerprint" element={<ComingSoon title="Fingerprint Access" />} />
        <Route path="/stationery" element={<ComingSoon title="Stationery Store" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
