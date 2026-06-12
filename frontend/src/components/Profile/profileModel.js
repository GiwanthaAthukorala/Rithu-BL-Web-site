"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Edit3,
  Save,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Loader2,
} from "lucide-react";

const ProfileEditModal = ({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
  apiBaseUrl = "/api",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bankName: "",
    bankBranch: "",
    bankAccountNo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [activeTab, setActiveTab] = useState("personal");

  const fileInputRef = useRef(null);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        bankName: user.bankName || "",
        bankBranch: user.bankBranch || "",
        bankAccountNo: user.bankAccountNo || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Set profile image preview
      if (user.profilePicture?.url) {
        setImagePreview(user.profilePicture.url);
      } else {
        // Generate initials avatar
        const initials = `${user.firstName?.charAt(0) || ""}${
          user.lastName?.charAt(0) || ""
        }`;
        setImagePreview(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            initials
          )}&background=3B82F6&color=ffffff&size=400`
        );
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Image size must be less than 5MB",
        }));
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Clear any previous image errors
      setErrors((prev) => ({ ...prev, profilePicture: "" }));
    }
  };

  const uploadProfilePicture = async () => {
    if (!profileImage) return null;

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", profileImage);

      const response = await fetch(
        `${apiBaseUrl}/users/profile/upload-picture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      // Check if response has content before parsing
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }
      return data.profilePicture;
    } catch (error) {
      console.error("Image upload error:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Failed to upload image",
      }));
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
    if (!formData.bankBranch.trim())
      newErrors.bankBranch = "Bank branch is required";
    if (!formData.bankAccountNo.trim())
      newErrors.bankAccountNo = "Bank account number is required";

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    // Validate password fields
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          "Current password is required to set new password";
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Upload profile picture first if there's a new one
      let profilePictureData = null;
      if (profileImage) {
        profilePictureData = await uploadProfilePicture();
      }

      const token = localStorage.getItem("token");
      const updateData = { ...formData };

      // Remove empty password fields
      if (!updateData.newPassword) {
        delete updateData.currentPassword;
        delete updateData.newPassword;
        delete updateData.confirmPassword;
      } else {
        delete updateData.confirmPassword; // Don't send confirm password to backend
      }

      // If we have a new profile picture, include it in the update
      if (profilePictureData) {
        updateData.profilePicture = profilePictureData;
      }

      const response = await fetch(`${apiBaseUrl}/users/profile`, {
        method: "PUT", // Changed from POST to PUT
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      // Check if response has content before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!data.success) {
          if (data.errorType && data.message) {
            setErrors({ [data.errorType]: data.message });
          } else {
            setErrors({ general: data.message || "Failed to update profile" });
          }
          return;
        }

        // Call the success callback with updated user data
        if (onUpdateSuccess) {
          onUpdateSuccess(data.user);
        }

        onClose();
      } else {
        // Handle non-JSON response
        const text = await response.text();
        throw new Error(text || "Update failed - invalid response from server");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrors({
        general: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform animate-in fade-in-0 zoom-in-95 border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 size={24} />
              <h2 className="text-2xl font-bold">Edit Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Profile Picture Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-110"
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Picture
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a new profile picture. Max size 5MB.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  disabled={isUploadingImage}
                >
                  <Upload size={16} />
                  <span>
                    {isUploadingImage ? "Uploading..." : "Choose Image"}
                  </span>
                </button>
              </div>
            </div>
            {errors.profilePicture && (
              <div className="mt-3 text-red-600 text-sm flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                {errors.profilePicture}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "personal"
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab("banking")}
                className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "banking"
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Banking Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "security"
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Security
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                  {errors.general}
                </div>
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <div className="mt-1 text-red-600 text-sm">
                        {errors.firstName}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <div className="mt-1 text-red-600 text-sm">
                        {errors.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your 10-digit phone number"
                  />
                  {errors.phoneNumber && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banking Info Tab */}
            {activeTab === "banking" && (
              <div className="space-y-6">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building size={16} className="inline mr-2" />
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.bankName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your bank name"
                  />
                  {errors.bankName && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.bankName}
                    </div>
                  )}
                </div>

                {/* Bank Branch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Bank Branch
                  </label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={formData.bankBranch}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.bankBranch ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your bank branch"
                  />
                  {errors.bankBranch && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.bankBranch}
                    </div>
                  )}
                </div>

                {/* Bank Account Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard size={16} className="inline mr-2" />
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.bankAccountNo
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your bank account number"
                  />
                  {errors.bankAccountNo && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.bankAccountNo}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-12 ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-12 ${
                        errors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-12 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-1 text-red-600 text-sm">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
