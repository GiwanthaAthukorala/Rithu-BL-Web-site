"use client";

import { AuthProvider } from "@/Context/AuthContext";
import { SocketProvider } from "@/Context/SocketContext";
import "@/styles/globals.css";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SocketProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
}
