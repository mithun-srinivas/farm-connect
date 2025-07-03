import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import { 
  Search, 
  Filter, 
  Download, 
  FileText,
  RefreshCw,
  Calendar,
  Package,
  Users
} from 'lucide-react'

const Reports = () => {
  const [goods, setGoods] = useState([])
  const [customers, setCustomers] = useState([])
  const [filteredGoods, setFilteredGoods] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('goods')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [commissionFilter, setCommissionFilter] = useState('all')

  useEffect(() => {
    fetchReportsData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [goods, customers, searchTerm, dateFilter, commissionFilter, activeTab, activeTab])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      // Fetch goods data
      const { data: goodsData, error: goodsError } = await supabase
        .from('farmers_goods')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (goodsError) {
        console.error('Error fetching goods:', goodsError)
        throw goodsError
      }

      // Fetch customers data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (customersError) {
        console.error('Error fetching customers:', customersError)
        throw customersError
      }

      console.log('Fetched goods:', goodsData?.length || 0)
      console.log('Fetched customers:', customersData?.length || 0)
      
      if (customersError) {
        console.error('Error fetching customers:', customersError)
        throw customersError
      }

      console.log('Fetched goods:', goodsData?.length || 0)
      console.log('Fetched customers:', customersData?.length || 0)
      
      setGoods(goodsData || [])
      setCustomers(customersData || [])
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = activeTab === 'goods' ? [...goods] : [...customers]
    
    console.log(`Applying filters for ${activeTab}:`, filtered.length, 'items')
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        if (activeTab === 'goods') {
          return (
            item.farmer_name?.toLowerCase().includes(searchLower) ||
            item.good_name?.toLowerCase().includes(searchLower)
          )
        } else {
          return (
            item.customer_name?.toLowerCase().includes(searchLower) ||
            item.phone?.toLowerCase().includes(searchLower) ||
            item.goods_purchased?.toLowerCase().includes(searchLower)
          )
        }
      })
      console.log(`After search filter (${searchTerm}):`, filtered.length, 'items')
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate.toDateString() === filterDate.toDateString()
      })
      console.log(`After date filter (${dateFilter}):`, filtered.length, 'items')
    }

    // Apply commission filter (only for goods)
    if (activeTab === 'goods' && commissionFilter !== 'all') {
      filtered = filtered.filter(item => {
        return commissionFilter === 'with' ? item.with_commission : !item.with_commission
      })
      console.log(`After commission filter (${commissionFilter}):`, filtered.length, 'items')
    }

    console.log(`Final filtered ${activeTab}:`, filtered.length, 'items')

    if (activeTab === 'goods') {
      setFilteredGoods(filtered)
    } else {
      setFilteredCustomers(filtered)
    }
  }

  const exportToExcel = () => {
    const dataToExport = activeTab === 'goods' ? filteredGoods : filteredCustomers
    
    let worksheetData = []
    
    if (activeTab === 'goods') {
      worksheetData = dataToExport.map(item => ({
        'Date': format(new Date(item.created_at), 'yyyy-MM-dd'),
        'Farmer Name': item.farmer_name,
        'Good Name': item.good_name,
        'Quantity': item.quantity,
        'Price per Unit': item.price_per_unit,
        'With Commission': item.with_commission ? 'Yes' : 'No',
        'Final Price': item.final_price,
        'Commission Amount': item.with_commission ? (item.quantity * item.price_per_unit * 0.1).toFixed(2) : '0.00'
      }))
    } else {
      worksheetData = dataToExport.map(item => ({
        'Date': format(new Date(item.created_at), 'yyyy-MM-dd'),
        'Customer Name': item.customer_name,
        'Phone': item.phone,
        'Address': item.address,
        'Goods Purchased': item.goods_purchased,
        'Price': item.price
      }))
    }

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'goods' ? 'Goods' : 'Customers')
    
    const filename = `farm_connect_${activeTab}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(workbook, filename)
  }

  const exportToCSV = () => {
    const dataToExport = activeTab === 'goods' ? filteredGoods : filteredCustomers
    
    let csvContent = ''
    
    if (activeTab === 'goods') {
      csvContent = 'Date,Farmer Name,Good Name,Quantity,Price per Unit,With Commission,Final Price,Commission Amount\n'
      dataToExport.forEach(item => {
        const commissionAmount = item.with_commission ? (item.quantity * item.price_per_unit * 0.1).toFixed(2) : '0.00'
        csvContent += `${format(new Date(item.created_at), 'yyyy-MM-dd')},${item.farmer_name},${item.good_name},${item.quantity},${item.price_per_unit},${item.with_commission ? 'Yes' : 'No'},${item.final_price},${commissionAmount}\n`
      })
    } else {
      csvContent = 'Date,Customer Name,Phone,Address,Goods Purchased,Price\n'
      dataToExport.forEach(item => {
        csvContent += `${format(new Date(item.created_at), 'yyyy-MM-dd')},${item.customer_name},${item.phone},${item.address},${item.goods_purchased},${item.price}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `farm_connect_${activeTab}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateTotalRevenue = () => {
    return filteredGoods.reduce((sum, item) => sum + (item.final_price || 0), 0)
  }

  const calculateTotalCommission = () => {
    return filteredGoods.reduce((sum, item) => {
      if (item.with_commission) {
        return sum + (item.quantity * item.price_per_unit * 0.1)
      }
      return sum
    }, 0)
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View and analyze your trading data</p>
        </div>
        <button
          onClick={fetchReportsData}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>


      {/* Debug Info (remove in production) */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="font-medium text-yellow-900 mb-2">Debug Info:</h3>
        <p className="text-sm text-yellow-700">
          Raw Goods: {goods.length} | Raw Customers: {customers.length} | 
          Active Tab: {activeTab} | 
          Filtered Goods: {filteredGoods.length} | Filtered Customers: {filteredCustomers.length}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Goods</p>
              <p className="text-2xl font-bold text-gray-900">{goods.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalRevenue().toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-900">₹{calculateTotalCommission().toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('goods')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'goods'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Goods ({goods.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers ({customers.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex-1">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>

          {/* Commission Filter (only for goods) */}
          {activeTab === 'goods' && (
            <div className="flex-1">
              <select
                value={commissionFilter}
                onChange={(e) => setCommissionFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Transactions</option>
                <option value="with">With Commission</option>
                <option value="without">Without Commission</option>
              </select>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {activeTab === 'goods' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Farmer Name</th>
                  <th className="table-header">Good Name</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Price/Unit</th>
                  <th className="table-header">Commission</th>
                  <th className="table-header">Final Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGoods.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="table-cell">{format(new Date(item.created_at), 'MMM dd, yyyy')}</td>
                    <td className="table-cell">{item.farmer_name}</td>
                    <td className="table-cell">{item.good_name}</td>
                    <td className="table-cell">{item.quantity}</td>
                    <td className="table-cell">₹{item.price_per_unit}</td>
                    <td className="table-cell">
                      {item.with_commission ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          10%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          None
                        </span>
                      )}
                    </td>
                    <td className="table-cell font-medium">₹{item.final_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Customer Name</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Address</th>
                  <th className="table-header">Goods Purchased</th>
                  <th className="table-header">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="table-cell">{format(new Date(item.created_at), 'MMM dd, yyyy')}</td>
                    <td className="table-cell">{item.customer_name}</td>
                    <td className="table-cell">{item.phone}</td>
                    <td className="table-cell">{item.address}</td>
                    <td className="table-cell">{item.goods_purchased}</td>
                    <td className="table-cell font-medium">₹{item.price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Empty State */}
        {(activeTab === 'goods' ? filteredGoods : filteredCustomers).length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateFilter || commissionFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : `No ${activeTab} have been added yet`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports 