"use client";

import { useState } from "react";
import {
  X,
  Instagram,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

export default function InstagramAddAccountModal({
  isOpen,
  onClose,
  onAdd,
  remainingSlots,
}) {
  const [formData, setFormData] = useState({
    accountName: "",
    profileUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.profileUrl.trim()) {
      newErrors.profileUrl = "Profile URL is required";
    } else {
      // More flexible URL validation
      const urlPattern =
        /^(https?:\/\/)?(www\.)?(instagram\.com)\/[a-zA-Z0-9.\-_]+/i;
      const profilePattern =
        /^(https?:\/\/)?(www\.)?instagram\.com\/profile\.php\?id=\d+$/i;

      if (
        !urlPattern.test(formData.profileUrl) &&
        !profilePattern.test(formData.profileUrl)
      ) {
        newErrors.profileUrl = "Please enter a valid Instagram profile URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onAdd(formData);
      setFormData({ accountName: "", profileUrl: "" });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Add account error:", error);
      setSubmitError(
        error.message || "Failed to add account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Instagram size={20} />
              </div>
              <h3 className="text-xl font-bold">Add Instagram Account</h3>
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
          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium mb-2">
              Available Slots: {remainingSlots}/20
            </p>
            <p className="text-blue-600 text-xs">
              You can add up to 20 different Instagram accounts to work on
              tasks. Each account must be unique.
            </p>
          </div>

          {/* Submit Error Display */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={16}
              />
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

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
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
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
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instagram Profile URL <span className="text-red-500">*</span>
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
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.profileUrl ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://instagram.com/username"
                disabled={isLoading}
              />
            </div>
            {errors.profileUrl && (
              <p className="mt-1 text-red-600 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.profileUrl}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Example: https://instagram.com/username or
              https://www.instagram.com/profile.php?id=12345
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
              disabled={isLoading || remainingSlots === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
                isLoading || remainingSlots === 0
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
