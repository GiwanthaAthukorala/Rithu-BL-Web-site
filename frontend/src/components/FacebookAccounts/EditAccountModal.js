"use client";

import { useState, useEffect } from "react";
import {
  X,
  Facebook,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Save,
  User, // Add this import
} from "lucide-react";

export default function EditAccountModal({
  isOpen,
  onClose,
  account,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    accountName: "",
    profileUrl: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName || "",
        profileUrl: account.profileUrl || "",
        isActive: account.isActive !== undefined ? account.isActive : true,
      });
    }
  }, [account]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.profileUrl.trim()) {
      newErrors.profileUrl = "Profile URL is required";
    } else {
      const urlPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+/i;
      if (!urlPattern.test(formData.profileUrl)) {
        newErrors.profileUrl = "Please enter a valid Facebook profile URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !account) return;

    setIsLoading(true);
    try {
      await onUpdate(account._id, formData);
    } catch (error) {
      // Error is handled in parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Facebook size={20} />
              </div>
              <h3 className="text-xl font-bold">Edit Account</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Account Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.accountName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., My Personal Account"
                disabled={isLoading}
              />
            </div>
            {errors.accountName && (
              <p className="mt-1 text-red-600 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.accountName}
              </p>
            )}
          </div>

          {/* Profile URL */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Facebook Profile URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="url"
                name="profileUrl"
                value={formData.profileUrl}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                  errors.profileUrl ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://facebook.com/username"
                disabled={isLoading}
              />
            </div>
            {errors.profileUrl && (
              <p className="mt-1 text-red-600 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.profileUrl}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                disabled={isLoading}
              />
              <span className="text-gray-700 font-medium">
                Account is active
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-8">
              Deactivate accounts temporarily without deleting them
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save size={18} className="mr-2" />
                  <span>Save Changes</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
