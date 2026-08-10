"use client";
import ManageInstagramLinks from "@/components/Admin/ManageInstagramLinks";
import AdminRoute from "@/components/Admin/AdminRoute";
import { AdminAuthProvider } from "@/Context/AdminAuthContext";

export default function InstagramLinkAdminPage() {
  return (
    <AdminAuthProvider>
      <AdminRoute>
        <ManageInstagramLinks />
      </AdminRoute>
    </AdminAuthProvider>
  );
}
