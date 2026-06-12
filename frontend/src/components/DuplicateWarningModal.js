import { X } from "lucide-react";

export default function DuplicateWarningModal({ onClose, previousDate }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-red-600">
            Duplicate Screenshot Detected
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <p>
            This screenshot is too similar to one you submitted on{" "}
            {previousDate}.
          </p>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium mb-2">Please try:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Taking a full-page screenshot</li>
              <li>Including the browser address bar</li>
              <li>Showing your profile picture in the screenshot</li>
              <li>Capturing new interactions (like/comments)</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
