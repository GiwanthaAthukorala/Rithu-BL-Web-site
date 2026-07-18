"use client";
import ManageFacebookLinks from "@/components/Admin/ManageFacebookLinks";
import AdminRoute from "@/components/Admin/AdminRoute";
import { AdminAuthProvider } from "@/Context/AdminAuthContext";

export default function FacebookLinkAdminPage() {
  return (
    <AdminAuthProvider>
      <AdminRoute>
        <ManageFacebookLinks />
      </AdminRoute>
    </AdminAuthProvider>
  );
}
