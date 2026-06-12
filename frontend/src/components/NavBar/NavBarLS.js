import Link from "next/link";

export default function LSNavBar() {
  return (
    <>
      <div className="w-full sm:max-w-[480px]  md:max-w-[768px] lg:max-w-full mx-auto">
        <header className="flex items-center justify-between p-4 bg-white shadow-sm">
          {/* Left side - Back to Home link */}
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Back to Home
          </Link>

          {/* Right side - Navigation links */}
          <nav className="flex space-x-4">
            <Link
              href="/Log-in/page"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Login Page
            </Link>
            <Link
              href="/Sign-up/page"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Signup Page
            </Link>
          </nav>
        </header>
      </div>
    </>
  );
}
