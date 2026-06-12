"use client";
import { useEffect } from "react";
import { useRouter } from "next/router"; // Changed from next/navigation
import { useAdminAuth } from "@/Context/AdminAuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/admin/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated() ? children : null;
};

export default AdminRoute;
