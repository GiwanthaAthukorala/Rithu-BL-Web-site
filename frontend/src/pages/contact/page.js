"use client";
import Header from "@/components/Header/Header";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Globe,
  User,
  MessageCircle,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Numbers",
      details: ["074 008 9006", "+94 76 740 0723"],
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["rithubusinesslanka@gmail.com"],
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: MapPin,
      title: "Location",
      details: ["Mawanella, Sri Lanka"],
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Always Open", "24/7 Support Available"],
      color: "from-amber-500 to-orange-600",
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Get in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We're here to help! Reach out to our team for
              support, partnership inquiries, or any assistance you need.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-2xl transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl"></div>
                <div className="relative p-8 rounded-2xl">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form & Info */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Send Us a Message
                </h2>
              </div>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-center">
                  <CheckCircle className="mr-3" size={20} />
                  <span>
                    Your message has been sent successfully! We'll get back to
                    you soon.
                  </span>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center">
                  <AlertCircle className="mr-3" size={20} />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="How can we help you?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Company Info & FAQ */}
            <div className="space-y-8">
              {/* Company Info */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    About Rithu Business Lanka
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Rithu Business Lanka is a leading marketing and advertising
                    agency based in Mawanella, Sri Lanka. We specialize in
                    connecting businesses with engaged social media users.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-2">
                      What We Offer:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        Social Media Marketing Solutions
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        Advertising Campaign Management
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        User Engagement Platforms
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        Digital Marketing Services
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What are your business hours?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      We're always open! Our support team is available 24/7 to
                      assist you.
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      How quickly do you respond to inquiries?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      We typically respond within 1-2 hours during business
                      days, and within 24 hours maximum.
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Do you offer delivery services?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Yes! We offer delivery, contactless delivery, and takeaway
                      services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map & Location */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Location</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-6">
                  Visit us at our office in Mawanella, Sri Lanka. We're
                  conveniently located and easily accessible.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600">Mawanella, Sri Lanka</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Contact Numbers
                      </p>
                      <p className="text-gray-600">074 008 9006</p>
                      <p className="text-gray-600">+94 76 740 0723</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">
                        rithubusinesslanka@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Website</p>
                      <p className="text-gray-600">RithuBusinesslanka.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-12 h-12 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-2">
                    Interactive Map Coming Soon
                  </p>
                  <p className="text-sm text-gray-500">
                    We're working on adding an interactive map
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Need Immediate Assistance?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Call us directly for urgent matters or WhatsApp us for quick
                responses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0740089006"
                  className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Call Now: 074 008 9006
                </a>
                <a
                  href="https://wa.me/94767400723"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
                >
                  <MessageSquare className="mr-2 w-5 h-5" />
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
