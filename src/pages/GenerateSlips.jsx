import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  FileText, 
  Download, 
  Printer,
  Receipt,
  Search,
  Calendar,
  RefreshCw
} from 'lucide-react'

const GenerateSlips = () => {
  const [goods, setGoods] = useState([])
  const [customers, setCustomers] = useState([])
  const [filteredGoods, setFilteredGoods] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('farmers')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [goods, customers, searchTerm, dateFilter, activeTab])

  const fetchData = async () => {
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

      setGoods(goodsData || [])
      setCustomers(customersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = activeTab === 'farmers' ? [...goods] : [...customers]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        if (activeTab === 'farmers') {
          return (
            item.farmer_name?.toLowerCase().includes(searchLower) ||
            item.farmer_phone?.toLowerCase().includes(searchLower) ||
            item.good_name?.toLowerCase().includes(searchLower) ||
            item.units?.toLowerCase().includes(searchLower)
          )
        } else {
          return (
            item.customer_name?.toLowerCase().includes(searchLower) ||
            item.phone?.toLowerCase().includes(searchLower) ||
            item.goods_purchased?.toLowerCase().includes(searchLower)
          )
        }
      })
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at)
        return itemDate.toDateString() === filterDate.toDateString()
      })
    }

    if (activeTab === 'farmers') {
      setFilteredGoods(filtered)
    } else {
      setFilteredCustomers(filtered)
    }
  }

  const generateFarmerSlip = (goodItem) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('FARM CONNECT', 105, 30, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text('Farmer Goods Collection Receipt', 105, 45, { align: 'center' })
    
    // Date and Receipt Number
    doc.setFontSize(10)
    doc.text(`Date: ${format(new Date(goodItem.created_at), 'MMM dd, yyyy')}`, 20, 60)
    doc.text(`Receipt #: FC-${goodItem.id || Math.random().toString(36).substr(2, 9)}`, 20, 70)
    
    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 80, 190, 80)
    
    // Farmer Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Farmer Information:', 20, 95)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${goodItem.farmer_name}`, 20, 110)
    doc.text(`Phone: ${goodItem.farmer_phone}`, 20, 125)
    doc.text(`Date of Collection: ${format(new Date(goodItem.created_at), 'MMM dd, yyyy')}`, 20, 140)
    
    // Goods Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Goods Information:', 20, 160)
    
    const tableData = [
      ['Good Name', goodItem.good_name],
      ['Quantity', `${goodItem.quantity} ${goodItem.units}`],
      ['Price per Unit', `₹${goodItem.price_per_unit.toFixed(2)}`],
      ['Total Amount', `₹${(goodItem.quantity * goodItem.price_per_unit).toFixed(2)}`],
      ['Commission Applied', goodItem.with_commission ? 'Yes (10%)' : 'No'],
      ['Final Amount', `₹${goodItem.final_price.toFixed(2)}`]
    ]
    
    autoTable(doc, {
      startY: 170,
      head: [],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 80 }
      }
    })
    
    // Commission Note
    if (goodItem.with_commission) {
      const finalY = doc.lastAutoTable.finalY + 20
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Note: 10% commission has been deducted from the total amount.', 20, finalY)
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Thank you for your business!', 105, pageHeight - 30, { align: 'center' })
    doc.text('Farm Connect - Connecting Farmers to Markets', 105, pageHeight - 20, { align: 'center' })
    
    // Save the PDF
    doc.save(`farmer_slip_${goodItem.farmer_name}_${format(new Date(goodItem.created_at), 'yyyy-MM-dd')}.pdf`)
  }

  const generateCustomerSlip = (customerItem) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('FARM CONNECT', 105, 30, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text('Customer Purchase Receipt', 105, 45, { align: 'center' })
    
    // Date and Receipt Number
    doc.setFontSize(10)
    doc.text(`Date: ${format(new Date(customerItem.created_at), 'MMM dd, yyyy')}`, 20, 60)
    doc.text(`Invoice #: FC-INV-${customerItem.id || Math.random().toString(36).substr(2, 9)}`, 20, 70)
    
    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 80, 190, 80)
    
    // Customer Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Information:', 20, 95)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${customerItem.customer_name}`, 20, 110)
    doc.text(`Phone: ${customerItem.phone}`, 20, 125)
    doc.text(`Address: ${customerItem.address}`, 20, 140)
    
    // Purchase Information
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Purchase Information:', 20, 160)
    
    const tableData = [
      ['Goods Purchased', customerItem.goods_purchased],
      ['Total Amount', `₹${customerItem.price.toFixed(2)}`],
      ['Payment Status', 'Paid'],
      ['Purchase Date', format(new Date(customerItem.created_at), 'MMM dd, yyyy')]
    ]
    
    autoTable(doc, {
      startY: 170,
      head: [],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 11 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 80 }
      }
    })
    
    // Terms and Conditions
    const finalY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions:', 20, finalY)
    
    doc.setFont('helvetica', 'normal')
    doc.text('• All goods are sold as-is without warranty', 20, finalY + 10)
    doc.text('• Returns are accepted within 24 hours of purchase', 20, finalY + 20)
    doc.text('• Quality guarantee for fresh produce', 20, finalY + 30)
    
    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Thank you for your purchase!', 105, pageHeight - 30, { align: 'center' })
    doc.text('Farm Connect - Fresh from Farm to Table', 105, pageHeight - 20, { align: 'center' })
    
    // Save the PDF
    doc.save(`customer_invoice_${customerItem.customer_name}_${format(new Date(customerItem.created_at), 'yyyy-MM-dd')}.pdf`)
  }

  const generateBulkSlips = () => {
    const items = activeTab === 'farmers' ? filteredGoods : filteredCustomers
    
    if (items.length === 0) {
      alert('No items to generate slips for')
      return
    }

    items.forEach((item, index) => {
      setTimeout(() => {
        if (activeTab === 'farmers') {
          generateFarmerSlip(item)
        } else {
          generateCustomerSlip(item)
        }
      }, index * 500) // Delay each PDF generation by 500ms
    })
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
          <h1 className="text-2xl font-bold text-gray-900">Generate Slips</h1>
          <p className="text-gray-600">Create printable slips for farmers and customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={generateBulkSlips}
            className="btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('farmers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'farmers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Farmer Slips ({goods.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customer Slips ({customers.length})
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
        </div>
      </div>

      {/* Slips List */}
      <div className="space-y-4">
        {activeTab === 'farmers' ? (
          filteredGoods.length > 0 ? (
            filteredGoods.map((item, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Receipt className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.farmer_name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.good_name} • {item.quantity} {item.units} • ₹{item.final_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.farmer_phone} • {format(new Date(item.created_at), 'MMM dd, yyyy')}
                        {item.with_commission && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            With Commission
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateFarmerSlip(item)}
                      className="btn-primary flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Slip
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No farmer records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || dateFilter ? 'Try adjusting your filters' : 'No goods have been collected yet'}
              </p>
            </div>
          )
        ) : (
          filteredCustomers.length > 0 ? (
            filteredCustomers.map((item, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.customer_name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.phone} • {item.goods_purchased} • ₹{item.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generateCustomerSlip(item)}
                      className="btn-primary flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customer records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || dateFilter ? 'Try adjusting your filters' : 'No customers have been added yet'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Printer className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Printing Instructions</h3>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Click "Generate Slip" or "Generate Invoice" to create PDF documents</li>
                <li>PDFs will be automatically downloaded to your device</li>
                <li>Use "Generate All" to create slips for all filtered items</li>
                <li>For best results, use A4 paper size when printing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateSlips 