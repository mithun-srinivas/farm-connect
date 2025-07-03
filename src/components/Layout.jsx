import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Plus, 
  Users, 
  FileText, 
  Receipt,
  Menu,
  X,
  LogOut
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Add Goods', href: '/add-goods', icon: Plus },
    { name: 'Add Customer', href: '/add-customer', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Generate Slips', href: '/generate-slips', icon: Receipt },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Farm Connect</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Farm Connect</h1>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex h-16 items-center justify-between bg-white px-4 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">Farm Connect</h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout 