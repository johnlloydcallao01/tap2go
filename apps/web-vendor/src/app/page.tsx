export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Hello World! 🏪
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to Tap2Go Vendor Portal
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Vendor Dashboard
          </h2>
          <p className="text-gray-600">
            Clean Next.js app for the vendor portal.
            Ready for Vercel deployment! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
