"use client";
import ManageTiktokLinks from "@/components/Admin/ManageTiktokLinks";
import AdminRoute from "@/components/Admin/AdminRoute";
import { AdminAuthProvider } from "@/Context/AdminAuthContext";

export default function TiktokLinkAdminPage() {
  return (
    <AdminAuthProvider>
      <AdminRoute>
        <ManageTiktokLinks />
      </AdminRoute>
    </AdminAuthProvider>
  );
}
