"use client";
import AdminDashboard from "@/components/Admin/adminDashbord";
import AdminRoute from "@/components/Admin/AdminRoute";
import { AdminAuthProvider } from "@/Context/AdminAuthContext";

export default function AdminDashboardPage() {
  return (
    <AdminAuthProvider>
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    </AdminAuthProvider>
  );
}
