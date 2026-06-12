import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function SubmissionSummaryModal({ summary, onClose }) {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Submission Summary</h2>
          <p className="text-gray-600">
            Processed {summary.successful + summary.duplicates + summary.failed}{" "}
            screenshots
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">Successful</span>
            </div>
            <span className="font-bold text-green-700">
              {summary.successful}
            </span>
          </div>

          {summary.duplicates > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium">Duplicates Skipped</span>
              </div>
              <span className="font-bold text-yellow-700">
                {summary.duplicates}
              </span>
            </div>
          )}

          {summary.failed > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-medium">Failed</span>
              </div>
              <span className="font-bold text-red-700">{summary.failed}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="text-center">
            <p className="text-blue-800 font-bold text-lg">
              Total Earned: Rs {summary.totalEarned.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
