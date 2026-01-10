import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* Max Facility Logo */}
          <div className="mb-4">
            <img
              src="/images/max-facility-logo.png"
              alt="Max Facility"
              className="mx-auto w-full max-w-md"
            />
          </div>

          {/* Rink Reports text in same style as MAX FACILITY */}
          <div className="inline-flex items-center justify-center overflow-hidden">
            <div className="flex items-center bg-[#2c4a73] px-4 py-2">
              <span className="text-white font-black text-3xl tracking-tight uppercase">RINK</span>
            </div>
            <div className="flex items-center bg-[#5cb85c] px-4 py-2">
              <span className="text-white font-black text-3xl tracking-tight uppercase">REPORTS</span>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
