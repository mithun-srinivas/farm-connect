import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  FileText,
  Receipt
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGoods: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    commissionAmount: 0,
    recentGoods: [],
    recentCustomers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch goods data
      const { data: goodsData, error: goodsError } = await supabase
        .from('farmers_goods')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (goodsError) throw goodsError

      // Fetch customers data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (customersError) throw customersError

      // Calculate stats
      const totalRevenue = goodsData?.reduce((sum, item) => sum + (item.final_price || 0), 0) || 0
      const commissionAmount = goodsData?.reduce((sum, item) => {
        if (item.with_commission) {
          return sum + (item.price_per_unit * item.quantity * 0.1)
        }
        return sum
      }, 0) || 0

      setStats({
        totalGoods: goodsData?.length || 0,
        totalCustomers: customersData?.length || 0,
        totalRevenue,
        commissionAmount,
        recentGoods: goodsData?.slice(0, 5) || [],
        recentCustomers: customersData?.slice(0, 5) || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, to, color }) => (
    <Link to={to} className="block">
      <div className="card hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your farming trade operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Goods"
          value={stats.totalGoods}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Commission Earned"
          value={`₹${stats.commissionAmount.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="10% commission"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionCard
            title="Add Goods"
            description="Record new goods from farmers"
            icon={Plus}
            to="/add-goods"
            color="bg-primary-500"
          />
          <QuickActionCard
            title="Add Customer"
            description="Register new customer information"
            icon={Users}
            to="/add-customer"
            color="bg-green-500"
          />
          <QuickActionCard
            title="View Reports"
            description="Access detailed reports and analytics"
            icon={FileText}
            to="/reports"
            color="bg-purple-500"
          />
          <QuickActionCard
            title="Generate Slips"
            description="Create printable slips for farmers and customers"
            icon={Receipt}
            to="/generate-slips"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goods */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Goods</h3>
          {stats.recentGoods.length > 0 ? (
            <div className="space-y-3">
              {stats.recentGoods.map((good, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{good.good_name}</p>
                    <p className="text-sm text-gray-600">
                      {good.farmer_name} • {good.quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{good.final_price?.toFixed(2) || '0.00'}
                    </p>
                    {good.with_commission && (
                      <p className="text-xs text-orange-600">With commission</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No goods recorded yet</p>
          )}
        </div>

        {/* Recent Customers */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Customers</h3>
          {stats.recentCustomers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{customer.customer_name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{customer.price?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">{customer.goods_purchased}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No customers added yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 